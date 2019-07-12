from flask import Flask, render_template, request
import random, copy
import requests
import json, codecs

app = Flask(__name__)

path_to_file = "answers.json"

"""
sample_questions: 
key: (unique question number, question)
value: [[options],sub,[tags]] first option of options list is the correct answer.
"""

sample_questions = {
    (1,"4 + 7 = ")  : [["11", "2", "10", "12"],"math",["add"]],
    (2,"2 x 3 = ") : [["6","5","2","10"],"math",["mul"]],
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
    for i in list(sample_questions.keys()):
        for j in sample_questions[i][0]:
            if j == num:
                return i

def getResponses():
    """Load saved JSON of responses."""
    data_text = codecs.open(path_to_file, 'r', encoding='utf-8').read()
    data = json.loads(data_text)
    return data


@app.route("/quiz", methods=['POST'])
def quiz_answers():
    correct = 0
    #global result
    result = request.form.to_dict()
    # f = open("answers.txt",'w')
    # f.write(str(result))
    # f.close()
    json.dump(result, codecs.open(path_to_file, 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4) ### this saves the array in .json format

    for i in list(ques.keys()):
        #print(i)
        #print(request.form.to_dict())

        answered = result['('+str(i[0])+',']
        # print(answered)
        # answered = findKey(answered)
        # answered = sample_questions[answered]
        # res = answered[0][0]
        #print(res)
        #print(answered)
        #print(sample_questions[i][0][0])
        if sample_questions[i][0][0] == answered:
            correct = correct+1
    #print(wrongCorrectQ(getResponses()))
        
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
        answered1 = findKey(answered)
        answered2 = sample_questions[answered1]
        #res = answered2[0][0]
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


def wrongCorrectQ(response):
    """Returns a dictionary of questions for which response was right and wrong"""
    q_res = {0:[],1:[]}
    for i in list(ques.keys()):
        answered = response['('+str(i[0])+',']
        key = findKey(answered)
        #answered2 = sample_questions[answered1]
        #res = answered2[0][0]
        if sample_questions[i][0][0] == answered:
            q_res[1].append(key)
            #correct_q[answered1]+=1
        else:
            q_res[0].append(key)
            #wrong_q[answered1]+=1
    return q_res

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


if __name__ == "__main__":

    app.run(use_reloader = True, debug=True)
    
