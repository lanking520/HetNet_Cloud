from flask import render_template, Response
from . import routes
from application import *
import json
from flask import request


@routes.route('/event/getmacidbyprefbyuidloc', methods=['GET'])
def get_macid_by_pref_by_uid_loc():
    """
    get macid by uid, device_id, loc
    :return: {
        "macid": macid
    }
    """

    uid_param = request.args.get('uid')
    device_id_param = request.args.get('device_id')
    location = request.args.get('location').split(",")
    location = str(location[0][:8]) + ',' + str(location[1][:7])
    loc_param = request.args.get('location')  # "lng, lat"
    # net_param = request.args.get('curr_net')

    flag = 0

    # print loc_param
    # print location

    try:
        cursor_select = g.conn.execute('SELECT preference FROM apppref WHERE uid = %s AND location = %s AND device_id = %s',
                                       uid_param, loc_param, device_id_param)

        pref = ""

        for row in cursor_select:
            pref = row['preference']

        results = {}
        results["macid"] = pref

        print pref

        if pref == "highest bandwidth":
            print "high"
            cursor_select = g.conn.execute('SELECT macid FROM neteval WHERE bandwidth = (SELECT MAX(L.bandwidth) FROM (SELECT bandwidth FROM neteval WHERE location = %s) AS L) AND location = %s LIMIT 1',
                                           loc_param, loc_param)
            for row in cursor_select:
                results["macid"] = row["macid"]
            # print results["macid"]
            cursor_select = g.conn.execute('SELECT ssid FROM networkdata WHERE macid = %s',
                                           results["macid"])
            for row in cursor_select:
                results["ssid"] = row["ssid"]
                flag = 1
            # print results["ssid"]
        elif pref == "lowest latency":
            print "low"
            cursor_select = g.conn.execute('SELECT macid FROM neteval WHERE latency = (SELECT MIN(L.latency) FROM (SELECT latency FROM neteval WHERE location = %s) AS L) AND location = %s LIMIT 1',
                                           loc_param, loc_param)
            for row in cursor_select:
                results["macid"] = row["macid"]
            # print results["macid"]
            cursor_select = g.conn.execute('SELECT ssid FROM networkdata WHERE macid = %s',
                                           results["macid"])
            for row in cursor_select:
                results["ssid"] = row["ssid"]
                flag = 1
            # print results["ssid"]
        else:
            print "else"
            cursor_select = g.conn.execute('SELECT macid FROM networkdata WHERE ssid = %s AND location = %s',
                                           pref, location)
            for row in cursor_select:
                results["macid"] = row["macid"]
            # print results["macid"]
            results["ssid"] = pref
            # print results["ssid"]

        return Response(response=json.dumps(results), status=200, mimetype="application/json")


    except Exception as e:
        print e

        response_json = {"Status": "Failure"}
        return Response(response=json.dumps(response_json), status=500, mimetype="application/json")



@routes.route('/event/setapppref', methods=['POST'])
def set_app_pref():
    params = request.get_json()
    # params = json.dumps(params)
    uid = params['uid']
    device_id = params['device_id']
    loc = params['location']
    location = str(location[0][:8]) + ',' + str(location[1][:7])
    time = params['time']
    pref = params['preference']
    user_id = params['user_id']

    index = uid.find(":")
    if index >= 0:
        uid = uid[:index]


    try:
        # if pref != "highest bandwidth" and pref != "lowest latency":
        #     cursor_select = g.conn.execute('SELECT macid FROM networkdata WHERE ssid = %s', pref)
        #     for row in cursor_select:
        #         pref = row['macid']

        # Find if network already exists in database
        cursor_select = g.conn.execute('SELECT * FROM apppref WHERE uid = %s AND location = %s AND device_id = %s',
                                       uid, loc, device_id)
        if cursor_select.rowcount == 0:
            cursor_insert = g.conn.execute(
                'INSERT INTO apppref(uid, device_id, location, preference, time, user_id) VALUES(%s, %s, %s, %s, %s, %s)',
                uid, device_id, loc, pref, time, user_id)
        else:
            cursor_update = g.conn.execute('UPDATE apppref SET preference = %s, time = %s WHERE uid = %s AND device_id = %s AND location = %s',
                                           pref, time, uid, device_id, loc)

        response_json = {"Status": "Success"}
        return Response(response=json.dumps(response_json), status=200, mimetype="application/json")


    except Exception as e:
        print e

        response_json = {"Status": "Failure"}
        return Response(response=json.dumps(response_json), status=500, mimetype="application/json")


@routes.route('/event/getmacidbyprefbyloc', methods = ['GET'])
def get_macid_by_pref_by_loc():

    # Get parameters
    # user_id = request.args.get('user_id')
    device_id = request.args.get('device_id')
    location = request.args.get('location').split(",")
    location = str(location[0][:8]) + ',' + str(location[1][:7])
    loc_param = request.args.get('location')
    # curr_net = request.args.get('curr_net')

    try:
        # Find preference based on user_id, device_id and location
        cursor_select = g.conn.execute('SELECT preference FROM loc_pref WHERE device_id = %s AND location = %s',
                                       device_id, location)

        pref = ""
        for row in cursor_select:
            pref = row['preference']


        results = {}
        if pref == "highest bandwidth":
            cursor_select = g.conn.execute('SELECT macid FROM neteval WHERE bandwidth = (SELECT MAX(L.bandwidth) FROM (SELECT bandwidth FROM neteval WHERE location = %s) AS L) AND location = %s LIMIT 1',
                                           loc_param, loc_param)
            for row in cursor_select:
                results["macid"] = row["macid"]
            cursor_select = g.conn.execute('SELECT ssid FROM networkdata WHERE macid = %s',
                                           results["macid"])
            for row in cursor_select:
                results["ssid"] = row["ssid"]
        elif pref == "lowest latency":
            cursor_select = g.conn.execute('SELECT macid FROM neteval WHERE latency = (SELECT MIN(L.latency) FROM (SELECT latency FROM neteval WHERE location = %s) AS L) AND location = %s LIMIT 1',
                                           loc_param, loc_param)
            for row in cursor_select:
                results["macid"] = row["macid"]
            cursor_select = g.conn.execute('SELECT ssid FROM networkdata WHERE macid = %s',
                                           results["macid"])
            for row in cursor_select:
                results["ssid"] = row["ssid"]
        else:
            cursor_select = g.conn.execute('SELECT macid FROM networkdata WHERE ssid = %s AND location = %s',
                                           pref, location)
            for row in cursor_select:
                results["macid"] = row["macid"]
            # print results["macid"]
            results["ssid"] = pref

            return Response(response=json.dumps(results), status=200, mimetype="application/json")


    except Exception as e:
        print e

        response_json = {"Status": "Failure"}
        return Response(response=json.dumps(response_json), status=400, mimetype="application/json")

@routes.route('/event/setlocpref', methods = ['POST'])
def set_loc_pref():
    params = request.get_json()

    user_id = params['user_id']
    device_id = params['device_id']
    location = params['location']
    location = str(location[0][:8]) + ',' + str(location[1][:7])
    time = params['time']
    pref = params['preference']
    location_name = params['location_name']

    try:
        # When preference is network name
        # if pref != "highest bandwidth" and pref != "lowest latency":
        #     cursor_select = g.conn.execute('SELECT macid FROM networkdata WHERE ssid = %s', pref)
        #     for row in cursor_select:
        #         pref = row['macid']

        # Find if network already exists in database
        cursor_select = g.conn.execute('SELECT * FROM loc_pref WHERE user_id = %s AND location = %s AND device_id = %s',
                                          user_id, location, device_id)
        if cursor_select.rowcount == 0:
            cursor_insert = g.conn.execute(
                'INSERT INTO loc_pref(user_id, device_id, location, preference, time, location_name) VALUES (%s, %s, %s, %s, %s, %s)',
                user_id, device_id, location, pref, time, location_name)
        else:
            cursor_update = g.conn.execute('UPDATE loc_pref SET preference = %s, time = %s WHERE user_id = %s AND device_id = %s and location = %s',
                                           pref, time, user_id, device_id, location)

        response_json = {"Status": "Success"}
        return Response(response=json.dumps(response_json), status=200, mimetype="application/json")

    except Exception as e:
        print e

        response_json = {"Status": "Failure"}
        return Response(response=json.dumps(response_json), status=400, mimetype="application/json")


# input uid, loc, ssid, pref
# save in apppref (convert ssid & loc to macid)