from flask import Flask, render_template, request
import random, copy
import requests

app = Flask(__name__)

sample_questions = {
    "4 + 7 = " : ["2", "10", "11", "12"],
    "2 x 3 = " : ["2","5","6","10"],
    "A for "   : ["Apple","Ball","Cat","Gomma"]
}

ques = copy.deepcopy(sample_questions)

def shuffle(q):
    keys = []
    i = 0
    while i < len(q):
        current = random.choice(q.keys())
        if current not in keys:
            keys.append(current)
            i+=1
        return keys

@app.route("/")
def quiz():
    shuffled = shuffle(ques)
    for i in ques.keys():
        random.shuffle(ques[i])
    return render_template("main.html", q = shuffled, o = ques)

@app.route("/quiz", methods=['POST'])
def quiz_answers():
    correct = 0
    for i in ques.keys():
        answered = request.form[i]
        if sample_questions[i][0] == answered:
            correct = correct+1
    return '<h1>Correct Answers: <u>'+str(correct)+'</u></h1>'


if __name__ == "__main__":
    app.run(use_reloader = True, debug=True)

