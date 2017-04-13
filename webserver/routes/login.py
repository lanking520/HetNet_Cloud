from flask import render_template,Response, jsonify
from . import routes
from application import *
import json


@routes.route('/register', methods=['POST'])
def register_new_user():
    userDataJSON = request.get_json()

    # Extract name, email and password
    name = userDataJSON['name']
    password = userDataJSON['password']
    email = userDataJSON['email']

    # Check if email already exists
    cursor = g.conn.execute('SELECT * FROM login WHERE email=%s', email)
    results = []
    for row in cursor:
        results.append(row)

    print results

    device_id = 4
    # Insert into database
    if len(results) == 0:
        g.conn.execute('INSERT INTO login(device_id, password, email) VALUES(%s, %s, %s)',
                       device_id, password, email)
        responseJSON = {"status": "Success"}
    else:
        responseJSON = {"status": "Failure"}
        print "ERROR!"

    return Response(response=json.dumps(responseJSON), status=200, mimetype="application/json")


@routes.route('/login', methods=['POST'])
def login():
    loginDataJSON = request.get_json()

    # Extract data from post JSON
    email = loginDataJSON['email']
    password = loginDataJSON['password']

    # Check database
    cursor = g.conn.execute('SELECT * FROM login WHERE email = %s AND password = %s', email, password)
    resultRows = []
    for row in cursor:
        resultRows.append(row)

    if len(resultRows) > 0:
        responseJSON = {"status": "Success"}
    else:
        responseJSON = {"status": "Failure"}

    return Response(response=json.dumps(responseJSON), status=200, mimetype="application/json")
