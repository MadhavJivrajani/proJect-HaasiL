from flask import Flask, render_template, request
from analysis import logAnalysis, sample_questions, path_to_file, ques
import random
import json, codecs

app = Flask(__name__)

def shuffle(q):
    keys = []
    i = 0
    while i < len(q):
        current = random.choice(list(q.keys()))
        if current not in keys:
            keys.append(current)
            i+=1
    return keys

#@app.route("/")
def quiz():
    shuffled = shuffle(ques)
    for i in list(ques.keys()):
        random.shuffle(ques[i][0])
    print(ques)
    print(shuffled)

quiz()
# @app.route("/quiz", methods=['POST'])
# def quiz_answers():
#     correct = 0
#     result = request.form.to_dict()
#     json.dump(result, codecs.open(path_to_file, 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4) ### this saves the array in .json format

#     for i in list(ques.keys()):
#         answered = result['('+str(i[0])+',']
#         if sample_questions[i][0][0] == answered:
#             correct = correct+1
#     logAnalysis()        
#     return '<h1>Correct Answers: <u>'+str(correct)+"/"+str(len(sample_questions))+'</u></h1>'


# if __name__ == "__main__":
#     app.run(use_reloader = True, debug=True)
    
