from flask import Flask, render_template, request, json, session, redirect, url_for
from cryptography.fernet import Fernet
import tableauserverclient as TSC
import string
import random
from RestCalls import *
import requests

app = Flask(__name__)
app.secret_key = ''.join(random.choice(string.ascii_uppercase + string.digits) for i in range(10))

key = Fernet.generate_key()
cipher_suite = Fernet(key)

@app.route("/")
def main():
	return render_template('index.html')

@app.route('/login', methods=['GET'])
def login():
	##########Continuing the previous session if it exists##########
	try:
			isUserLoggedIn = session['isUserLoggedIn']
	except:
			isUserLoggedIn = False

	if isUserLoggedIn == True:
		return redirect(url_for('showGrid'))
	else:
		return render_template('login.html')

@app.route ('/logout')
def logout():
	try:
		session.clear()
	except:
		pass
	return redirect (url_for('login'))

@app.route('/loginRedirect', methods=['GET', 'POST'])
def loginAction():	
	##########Checking if user is authenticated##########
	session['isUserLoggedIn'] = loginUserToApp()
	isUserLoggedIn = session['isUserLoggedIn']
	if isUserLoggedIn == True:
		return redirect(url_for('showGrid'))
	else:
		state = "There is an error in logging in. Please re-try."
		return render_template('login.html', message = state)


@app.route('/grid', methods=['GET', 'POST'])
def showGrid():
	try:
		isUserLoggedIn = session['isUserLoggedIn']
	except:
		isUserLoggedIn = False

	if isUserLoggedIn == True :
		views = showViews()
		user = session['user']
		return render_template('grid.html', view = views, user=user)
	else:
		state = "Please log in first"
		return render_template('login.html', message = state)
	
@app.route('/view=<string:view>')
def view(view):
	try:
		isUserLoggedIn = session['isUserLoggedIn']
	except:
		isUserLoggedIn = False

	if isUserLoggedIn == True :
		worksheet = stripCharacter(view)	
		server, site, workbook = retrieveServerInfo()
		# url = server+"/trusted"
		user = session['user']
		# payload =  {'username' : user, 'target_site' : site}
		# r = requests.post(url, params = payload)	
		# ticket = r.text
		return render_template('view.html', server=server, site=site, workbook=workbook, worksheet=worksheet, user=user)

	else:
		state = "Please log in first"
		return render_template('login.html', message = state)


def loginUserToApp():
    loggedIn = False  
    #Logging into Application
    password = str(request.form['inputPassword'])
    username = str(request.form['inputName'])
        
    try :
	    if username == "jamie@pfg.com" and password == "abcd1234":
	    	loggedIn = True
	    	session['user'] = getUsersName(username)
    except :
        pass

    return loggedIn

if __name__ == "__main__":
	# setDefaultEncoding ()
	app.run(host= '0.0.0.0', debug = True)


