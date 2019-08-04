import pandas as pd
import numpy as np 
import os.path
def freq():
	df = pd.read_csv('wrong_ques.csv')
	#print(df.head())
	d_t = df['date-time'].tolist()
	questions = df['Question'].tolist()
	opts = df['Options'].tolist()
	ans = df['Answer'].tolist()
	tags = df['Tags'].tolist()
	date = []
	d = {}
	for i in range(len(d_t)):
		st = d_t[i].split('-')
		date.append(st[0])

	for i in range(len(questions)):
		if questions[i] not in d:
			d[questions[i]] = {date[i]}
		else:
			d[questions[i]].add(date[i])
	options = []
	ques = []
	answers = []
	date_time = []
	tag =[]
	for i in d:
		if len(d[i]) >1:
			ind=questions.index(i)
			options.append(opts[ind])
			ques.append(questions[ind])
			answers.append(ans[ind])
			tag.append(tags[ind])
			date_time.append(d_t[ind])

	freq_df = {"date-time":pd.Series(np.array(date_time)), "Question":pd.Series(np.array(ques)), "Options":pd.Series(np.array(options)), "Answer":pd.Series(np.array(answers)), "Tags":pd.Series(np.array(tag))}
	freq_df = pd.DataFrame(freq_df)

	if(os.path.exists("freq_wrong.csv")== False):
		freq_df.to_csv("freq_wrong.csv",header=True,index=None)

	else:
		freq_df_final = pd.read_csv("freq_wrong.csv")
		freq_df_final = pd.concat([freq_df_final, freq_df])
		freq_df_final.to_csv("freq_wrong.csv",header = True, index = None)

