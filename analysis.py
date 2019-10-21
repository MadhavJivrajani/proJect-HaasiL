import random, copy
import requests
import json, codecs
import pandas as pd
import numpy as np
from datetime import date, datetime
from os import path
import matplotlib.pyplot as plt 

"""
sample_questions: 
key: (unique question number, question)
value: [[options],sub,[tags]] first option of options list is the correct answer.
"""

sample_questions = {
    "1,4 + 7 = "  : [["11", "2", "10", "12"],"math",["add","easy"]],
    "2,2 x 3 = "  : [["6","5","2","10"],"math",["mul"]],
    "3,A for "  : [["Apple","Ball","Cat","Goat"],"eng",["alpha"]],
    "4,11 + 4 = " : [["15", "13", "14", "10"],"math",["add"]],
    "5,6 / 2 = "  : [["3","4","5","1"],"math",["div"]],
    "6,2 + 4 = " : [["6", "3", "8", "10"],"math",["add"]]
}

ques = copy.deepcopy(sample_questions)

path_to_file = "responses.json"

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

def sampleWrong(fraction):
    """Samples "fraction" of previously incorrect responses to be asked again."""
    wrong = wrongCorrectQ(getResponses())[1]
    if int(len(wrong)*fraction)!=0:
        sample = random.sample(list(wrong.keys()),int(len(wrong)*fraction))
        sample_q = {}
        for i in sample:
            sample_q[i]=sample_questions[i]
    else:
        sample = random.sample(list(wrong.keys()),len(wrong))
        sample_q = {}
        for i in sample:
            sample_q[i]=sample_questions[i]
    return sample_q


def logAnalysis(name, sub):
    """
    Create two seperate CSVs. One for tags and the other for subjects. 
    Against each subject/tag how many were right and how many were wrong and total in that category. 
    """
    dt_log = str(datetime.now().strftime("%d/%m/%y-%H:%M:%S")) 

    #creating tags csv 
    correct, wrong = analyseTags(getResponses())
    total = countTags()
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
    
    wrong_perc = [incorrect[i]/final_total[i]*100 for i in range(len(incorrect))]
    correct_perc = [right[i]/final_total[i]*100 for i in range(len(right))]

    tags = {"date-time":pd.Series(np.array([dt_log for _ in range(len(final_total))])),"Tag":pd.Series(np.array(list(total.keys()))),"Correct":pd.Series(np.array(right)),"Wrong":pd.Series(np.array(incorrect)),"Total":pd.Series(np.array(final_total)),"correct_perc":pd.Series(np.array(correct_perc)),"wrong_perc":pd.Series(np.array(wrong_perc))}
    tags = pd.DataFrame(tags)
    if(str(path.exists("tags_"+name+"_"+sub+".csv"))=='False'):
        tags.to_csv("tags_"+name+"_"+sub+".csv",header=True,index=None)
    else:
        tags_final = pd.read_csv("tags_"+name+"_"+sub+".csv")
        tags_final = pd.concat([tags_final, tags])
        tags_final.to_csv("tags_"+name+"_"+sub+".csv",header = True, index = None)

    #creating subjects csv
    correct_s, wrong_s = analyseSubs(getResponses())
    total_s = countSub()
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
        
    wrong_perc_s = [incorrect_s[i]/final_total_s[i]*100 for i in range(len(incorrect_s))]
    correct_perc_s = [right_s[i]/final_total_s[i]*100 for i in range(len(right_s))]

    #tags = {"date-time":pd.Series(np.array([dt_log for _ in range(len(final_total))])),"Tag":pd.Series(np.array(list(total.keys()))),"Correct":pd.Series(np.array(right)),"Wrong":pd.Series(np.array(incorrect)),"Total":pd.Series(np.array(final_total)),"correct_perc":pd.Series(np.array(correct_perc)),"wrong_perc":pd.Series(np.array(wrong_perc))}
    subs = {"date-time":pd.Series(np.array([dt_log for _ in range(len(final_total_s))])),"Sub":pd.Series(np.array(list(total_s.keys()))),"Correct":pd.Series(np.array(right_s)),"Wrong":pd.Series(np.array(incorrect_s)),"Total":pd.Series(np.array(final_total_s)),"correct_perc":pd.Series(np.array(correct_perc_s)),"wrong_perc":pd.Series(np.array(wrong_perc_s))}
    subs = pd.DataFrame(subs)
    if(str(path.exists("subs_"+name+"_"+sub+".csv"))=='False'):
        subs.to_csv("subs_"+name+"_"+sub+".csv",header=True,index=None)
    else:
        subs_final = pd.read_csv("subs_"+name+"_"+sub+".csv")
        subs_final = pd.concat([subs_final, subs])
        subs_final.to_csv("subs_"+name+"_"+sub+".csv", header = True, index = None)
    logWrongQues(name, sub)

def logWrongQues(name, sub):
    """
    Creates a csv in the same format as the one from which new questions are imported.
    Stores all wrongly answered questions. 
    """
    dt_log = str(datetime.now().strftime("%d/%m/%y-%H:%M:%S")) 
    wrong = sampleWrong(1)
    print(wrong)
    options = [",".join(i[0]) for i in list(wrong.values())]
    questions = [i.split(",")[1] for i in list(wrong.keys())]
    answers = [i[0][0] for i in list(wrong.values())]
    tags = [",".join(i[2]) for i in list(wrong.values())]
    wrong_df = {"date-time":pd.Series(np.array([dt_log for _ in range(len(wrong))])),"Question":pd.Series(np.array(questions)),"Options":pd.Series(np.array(options)),"Answer":pd.Series(np.array(answers)),"Tags":pd.Series(np.array(tags))}
    wrong_df = pd.DataFrame(wrong_df)
    if(str(path.exists("wrong_ques_"+name+"_"+sub+".csv"))=='False'):
        wrong_df.to_csv("wrong_ques_"+name+"_"+sub+".csv",header=True,index=None)
    else:
        wrong_df_final = pd.read_csv("wrong_ques_"+name+"_"+sub+".csv")
        wrong_df_final = pd.concat([wrong_df_final, wrong_df])
        wrong_df_final.to_csv("wrong_ques_"+name+"_"+sub+".csv", header = True, index = None)


def plotTag(tag, name):
    """Plots progress graphs for a specific tag"""
    data = pd.read_csv("tags_"+name+"_"+sub+".csv")
    tags = {}
    time = []
    #correct_perc = data["correct_perc"].tolist()
    wrong_perc = data["wrong_perc"].tolist()
    k = 0
    for i in data["Tag"]:
        if i==tag:
            if i not in tags:
                tags[i] = []
            time.append(data["date-time"][k])
            #tags[i].append(correct_perc[k])
            tags[i].append(wrong_perc[k])#, wrong_perc[k]]

        k+=1
    
    plt.figure(figsize=(10,5))
    y_pos = np.arange(len(time))
    plt.bar(y_pos,[i for i in list(tags.values())[0]])
    plt.xticks(y_pos, time,rotation=30)

    plt.xlabel("Date-time")
    plt.ylabel("Wrong-Percentage Tag")
    plt.show()

def plotSub(sub):
    """Plots progress graphs for a specific subject"""
    data = pd.read_csv("subs_"+name+"_"+sub+".csv")
    subs = {}
    time = []
    #correct_perc = data["correct_perc"].tolist()
    wrong_perc = data["wrong_perc"].tolist()
    k = 0
    for i in data["Sub"]:
        if i==sub:
            if i not in subs:
                subs[i] = []
            time.append(data["date-time"][k])
            #tags[i].append(correct_perc[k])
            subs[i].append(wrong_perc[k])#, wrong_perc[k]]

        k+=1
    
    plt.figure(figsize=(10,5))
    y_pos = np.arange(len(time))
    plt.bar(y_pos,[i for i in list(subs.values())[0]])
    plt.xticks(y_pos, time,rotation=30)

    plt.xlabel("Date-time")
    plt.ylabel("Wrong-Percentage Sub")
    plt.show()

