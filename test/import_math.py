"""
Written in Python 3.6.6
Imports questions from csv in a specified format:
key: (unique question number, question)
value: [[options],sub,[tags]] first option of options list is the correct answer.

Also checks if a csv for wrong responses has been created.
Based on this it imports previously wrongly answered questions into the current batch of imported questions. 
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from os import path

df = pd.read_csv("math.csv")
df.drop(["Pictorial Questions","Need for translation (yes or no)","Translated Question (if needed else fill with None)"],axis=1,inplace=True)
df.head()

questions = df['Question'].tolist()
opts = df['Options'].tolist()
ans = df['Answer'].tolist()
tags = df['Tags'].tolist()

ques = {}
for i in range(len(df)):
    ques[(i+1,questions[i])] = [opts[i],"math",[k.strip() for k in tags[i].split(",")]]

if(str(path.exists("wrong_ques.csv"))=='True'):
    wrong = pd.read_csv("wrong_ques.csv")
    questions_w = wrong['Question'].tolist()
    opts_w = wrong['Options'].tolist()
    ans_w = wrong['Answer'].tolist()
    tags_w = wrong['Tags'].tolist()
    
    for i in range(len(wrong)):
        ques[(len(ques)+i+1,questions_w[i])] = [opts_w[i],"math",[k.strip() for k in tags_w[i].split(",")]]        

def tag_ques(tags):
    """Gets questions for a particular set of tags."""
    ques_tag = {}
    j = 0
    tags_super = [list(ques.values())[i][2] for i in range(len(list(ques.values())))]
    for i in range(len(df)):
        if set(tags).issubset(set(tags_super[i])):
            ques_tag[(j+1,questions[i])] = [opts[i],"math",tags_super[i]]
            j+=1
    return ques_tag