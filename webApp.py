from flask import Flask, render_template, request
import random, copy
import requests
import json, codecs
import pandas as pd
import numpy as np
from datetime import date, datetime
from os import path


app = Flask(__name__)

path_to_file = "answers.json"

"""
sample_questions: 
key: (unique question number, question)
value: [[options],sub,[tags]] first option of options list is the correct answer.
"""

sample_questions = {
    (1,"4 + 7 = ")  : [["11", "2", "10", "12"],"math",["add"]],
    (2,"2 x 3 = ")  : [["6","5","2","10"],"math",["mul"]],
    (3,"A for "  )  : [["Apple","Ball","Cat","Gomma"],"eng",["alpha"]],
    (4,"11 + 4 = ") : [["15", "13", "14", "10"],"math",["add"]],
    (5,"6 / 2 = ")  : [["3","4","5","1"],"math",["div"]],
}


ques = copy.deepcopy(sample_questions)

def shuffle(q):
    keys = []
    i = 0
    while i < len(q):
        current = random.choice(list(q.keys()))
        if current not in keys:
            keys.append(current)
            i+=1
    return keys

@app.route("/")
def quiz():
    shuffled = shuffle(ques)
    for i in list(ques.keys()):
        random.shuffle(ques[i][0])
    return render_template("main.html", q = shuffled, o = ques)

def findKey(num):
    ans = -1
    for i in list(sample_questions.keys()):
        if i[0]==num:
            ans = i
    return ans

def getResponses():
    """Load saved JSON of responses."""
    data_text = codecs.open(path_to_file, 'r', encoding='utf-8').read()
    data = json.loads(data_text)
    return data


@app.route("/quiz", methods=['POST'])
def quiz_answers():
    correct = 0
    result = request.form.to_dict()
    json.dump(result, codecs.open(path_to_file, 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4) ### this saves the array in .json format

    for i in list(ques.keys()):
        answered = result['('+str(i[0])+',']
        if sample_questions[i][0][0] == answered:
            correct = correct+1
    logAnalysis()
        
    return '<h1>Correct Answers: <u>'+str(correct)+"/"+str(len(sample_questions))+'</u></h1>'


def countTags(questions = sample_questions):
    """Returns a dictionary with the counts of each tag."""
    tag_count = {}
    for i in list(questions.keys()):
        for j in questions[i][2]:
            if j not in tag_count:
                tag_count[j]=0
            tag_count[j]+=1
    return tag_count

def countSub(questions = sample_questions):
    """Returns a dictionary with counts of each subject."""
    sub_count = {}
    for i in list(questions.keys()):
        j = questions[i][1]
        if j not in sub_count:
            sub_count[j]=0
        sub_count[j]+=1
    return sub_count

def analyseTags(response):
    """Analyses how many correct and wrong for each particular tag"""
    tag_correct = {}
    tag_wrong = {}
    for i in list(ques.keys()):
        answered = response['('+str(i[0])+',']
        answered1 = findKey(i[0])
        print(answered,":",answered1)
        answered2 = sample_questions[answered1]
        tag = answered2[2]
        if sample_questions[i][0][0] == answered:
            for j in tag:
                if j not in tag_correct:
                    tag_correct[j]=0
                tag_correct[j]+=1
        else:
            for j in tag:
                if j not in tag_wrong:
                    tag_wrong[j]=0
                tag_wrong[j]+=1
    return tag_correct, tag_wrong

def analyseSubs(response):
    """Analyses how many correct and wrong for each particular subject"""
    sub_correct = {}
    sub_wrong = {}
    for i in list(ques.keys()):
        answered = response['('+str(i[0])+',']
        answered1 = findKey(i[0])
        answered2 = sample_questions[answered1]
        sub = answered2[1]
        if sample_questions[i][0][0] == answered:
            if sub not in sub_correct:
                sub_correct[sub]=0
            sub_correct[sub]+=1
        else:
            if sub not in sub_wrong:
                sub_wrong[sub]=0
            sub_wrong[sub]+=1
    return sub_correct, sub_wrong

def SpecificSub(subject): #Aditi edit 
    """
    Function to separate correct and wrong answers on a subject basis from sub_correct and sub_wrong
    sub_resp is a dictionary with correct and wrong answers for each subject
    """
    sub_resp = {}
    str1 = subject + '_correct'
    str2 = subject + '_wrong'
    correct,wrong = analyseSubs(getResponses())
    sub_resp = {str1:correct[subject],str2:wrong[subject]}
    return sub_resp
     

def SpecificTag(tag): #Aditi edit
    """
    Function to separate correct and wrong answers on a tag basis from tag_correct and tag_wrong
    tag_resp is a dictionary with correct and wrong answers for each tag
    """
    str1 = tag + '_correct'
    str2 = tag + '_wrong'
    tag_resp = {}
    correct,wrong = analyseTags(getResponses())
    tag_resp = {str1:correct[tag],str2:wrong[tag]}
    return tag_resp       
        

def wrongCorrectQ(response):
    """Returns a dictionary of questions for which response was right and wrong"""
    wrong_q = {}
    correct_q = {}
    for i in list(ques.keys()):
        answered = response['('+str(i[0])+',']
        key = findKey(i[0])
        if sample_questions[i][0][0] == answered:
            if key not in correct_q:
                correct_q[key] = 0
            correct_q[key]+=1
        else:
            if key not in wrong_q:
                wrong_q[key]=0
            wrong_q[key]+=1
    return correct_q, wrong_q

def sampleWrong():
    """Samples previously incorrect responses to be asked again."""
    wrong = wrongCorrectQ(getResponses())[0]
    if int(len(wrong))!=0:
        sample = random.sample(wrong,int(len(wrong)*0.6))
        sample_q = {}
        for i in sample:
            sample_q[i]=sample_questions[i]
    else:
        sample = random.sample(wrong,len(wrong))
        sample_q = {}
        for i in sample:
            sample_q[i]=sample_questions[i]
    return sample_q

def logAnalysis():
    """
    Create two seperate CSVs. One for tags and the other for subjects. 
    Against each subject/tag how many were right and how many were wrong and total in that category. 
    """
    dt_log = str(datetime.now().strftime("%d/%m/%y-%H:%M:%S")) 

    #creating tags csv 
    correct, wrong = analyseTags(getResponses())
    total = countTags()
    print(total)
    right = []
    incorrect = []
    final_total = []
    for i in list(total.keys()):
        if i in correct:
            right.append(correct[i])
            if i in wrong:
                incorrect.append(wrong[i])
            else:
                incorrect.append(0) 
        else:
            incorrect.append(wrong[i])   
            if i in correct:
                right.append(correct[i])
            else: 
                right.append(0)   
        final_total.append(total[i])
        
    tags = {"date-time":pd.Series(np.array([dt_log for _ in range(len(final_total))])),"Tag":pd.Series(np.array(list(total.keys()))),"Correct":pd.Series(np.array(right)),"Wrong":pd.Series(np.array(incorrect)),"Total":pd.Series(np.array(final_total))}
    tags = pd.DataFrame(tags)
    if(str(path.exists("tags.csv"))=='False'):
        tags.to_csv("tags.csv",header=True,index=None)
    else:
        tags_final = pd.read_csv("tags.csv")
        tags_final = pd.concat([tags_final, tags])
        tags_final.to_csv("tags.csv",header = True, index = None)

    #creating subjects csv
    correct_s, wrong_s = analyseSubs(getResponses())
    total_s = countSub()
    print(total_s)
    print(correct_s,",",wrong_s)
    right_s = []
    incorrect_s = []
    final_total_s = []
    for i in list(total_s.keys()):
        if i in correct_s:
            right_s.append(correct_s[i])
            if i in wrong_s:
                incorrect_s.append(wrong_s[i])
            else:
                incorrect_s.append(0) 
        else:
            incorrect_s.append(wrong_s[i])   
            if i in correct_s:
                right_s.append(correct_s[i])
            else: 
                right_s.append(0)   
        final_total_s.append(total_s[i])
        
    subs = {"date-time":pd.Series(np.array([dt_log for _ in range(len(final_total_s))])),"Tag":pd.Series(np.array(list(total_s.keys()))),"Correct":pd.Series(np.array(right_s)),"Wrong":pd.Series(np.array(incorrect_s)),"Total":pd.Series(np.array(final_total_s))}
    subs = pd.DataFrame(subs)
    if(str(path.exists("subs.csv"))=='False'):
        subs.to_csv("subs.csv",header=True,index=None)
    else:
        subs_final = pd.read_csv("subs.csv")
        subs_final = pd.concat([subs_final, subs])
        subs_final.to_csv("subs.csv", header = True, index = None)



if __name__ == "__main__":

    app.run(use_reloader = True, debug=True)
    
