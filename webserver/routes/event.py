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
    location = network_data["Location"].split(",")
    loc_param = str(location[0][:8]) + ',' + str(location[1][:7])
    # loc_param = request.args.get('location')  # "lng, lat"
    net_param = request.args.get('curr_net')

    try:
        cursor_select = g.conn.execute('SELECT preference FROM apppref WHERE uid = %s AND location = %s AND device_id = %s',
                                       uid_param, loc_param, device_id_param)

        pref = ""

        for row in cursor_select:
            pref = row['preference']

        results = {}
        results["macid"] = pref

        if pref == "highest bandwidth":
            cursor_select = g.conn.execute('SELECT N.macid FROM neteval N WHERE N.bandwidth = (SELECT MAX(bandwidth) FROM neteval) LIMIT 1')
            for row in cursor_select:
                results["macid"] = row["macid"]
            cursor_select = g.conn.execute('SELECT ssid FROM networkdata WHERE macid = %s',
                                           results["macid"])
            for row in cursor_select:
                results["ssid"] = row["ssid"]
        elif pref == "lowest latency":
            cursor_select = g.conn.execute('SELECT N.macid FROM neteval N WHERE N.latency = (SELECT MIN(latency) FROM neteval) LIMIT 1')
            for row in cursor_select:
                results["macid"] = row["macid"]
            cursor_select = g.conn.execute('SELECT ssid FROM networkdata WHERE macid = %s',
                                           results["macid"])
            for row in cursor_select:
                results["ssid"] = row["ssid"]
        else:
            cursor_select = g.conn.execute('SELECT macid FROM networkdata WHERE ssid = %s AND location = %s',
                                           pref, loc_param)
            for row in cursor_select:
                results["macid"] = row["macid"]
            results["ssid"] = pref

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
    time = params['time']
    pref = params['preference']
    user_id = params['user_id']


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
    location = request.args.get('location')
    curr_net = request.args.get('curr_net')

    try:
        # Find preference based on user_id, device_id and location
        cursor_select = g.conn.execute('SELECT preference FROM loc_pref WHERE device_id = %s AND location = %s',
                                       device_id, location)

        pref = ""
        for row in cursor_select:
            pref = row['preference']


        results = {}
        if pref == "highest bandwidth":
            cursor_select = g.conn.execute('SELECT N.macid FROM neteval N WHERE N.bandwidth = (SELECT MAX(bandwidth) FROM neteval) LIMIT 1')
            for row in cursor_select:
                results["macid"] = row["macid"]
        elif pref == "lowest latency":
            cursor_select = g.conn.execute('SELECT N.macid FROM neteval N WHERE N.latency = (SELECT MIN(latency) FROM neteval) LIMIT 1')
            for row in cursor_select:
                results["macid"] = row["macid"]
        else:
            cursor_select = g.conn.execute('SELECT macid FROM networkdata WHERE ssid = %s AND location = %s',
                                           pref, location)
            for row in cursor_select:
                results["macid"] = row["macid"]

        return Response(response=json.dumps({"Status": "Success", "result": results}), status=200, mimetype="application/json")


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