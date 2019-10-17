from flask import Flask, render_template, request, jsonify
from analysis import logAnalysis, sample_questions, path_to_file, ques
import random
import json, codecs

app = Flask(__name__)
student_name = ""
@app.route('/', methods=['GET', 'POST'])
def main():
    # global student_name
    # student_name = request.form["name"]

    return render_template('name.html')

@app.route('/hello', methods=['GET', 'POST'])
def hello():
    data_text = codecs.open("questions.json", 'r', encoding='utf-8').read()
    data = json.loads(data_text)
    # POST request
    if request.method == 'POST':
        data = request.get_json()
        json.dump(data, codecs.open("responses.json", 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4) ### this saves the array in .json format
        logAnalysis(student_name)
        return 'OK', 200

    # GET request
    else:
        return jsonify(data)  # serialize and use JSON headers

@app.route('/name', methods=['GET', 'POST'])
def name():
    global student_name
    student_name = request.form["name"]

    return render_template('index.html')

if __name__ == "__main__":
    app.run(use_reloader = True, debug=True, port=8000)
