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
import json, codecs

ques = {
    "1,4 + 7 = "  : [["11", "2", "10", "12"],"math",["add","easy"]],
    "2,2 x 3 = "  : [["6","5","2","10"],"math",["mul"]],
    "3,A for "  : [["Apple","Ball","Cat","Goat"],"eng",["alpha"]],
    "4,11 + 4 = " : [["15", "13", "14", "10"],"math",["add"]],
    "5,6 / 2 = "  : [["3","4","5","1"],"math",["div"]],
    "6,2 + 4 = " : [["6", "3", "8", "10"],"math",["add"]]
}

json.dump(ques, codecs.open("questions.json", 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4) 

