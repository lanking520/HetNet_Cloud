from flask import render_template, Response
from . import routes
from application import *
import json
from flask import request


@routes.route('/event/getmacidbyprefbyuidloc', methods=['GET'])
def get_macid_by_pref_by_uid_loc():
    """
    get appdata by uid
    :return: {
        "appdata": [],
        "uid": uid_param
    }
    """

    uid_param = request.args.get('uid')
    device_id_param = request.args.get('device_id')
    loc_param = request.args.get('location')

    try:
        cursor_select = g.conn.execute('SELECT preference FROM apppref WHERE uid = %s AND location = %s AND device_id = %s',
                                       uid_param, loc_param, device_id_param)

        pref = ""

        for row in cursor_select:
            pref = row['perference']

        if pref == "highest bandwidth":
            cursor_select = g.conn.execute('SELECT N.macid FROM neteval N WHERE N.bandwidth = (SELECT MAX(bandwidth) FROM neteval) LIMIT 1')
        elif pref == "lowest latency":
            cursor_select = g.conn.execute('SELECT N.macid FROM neteval N WHERE N.bandwidth = (SELECT MIN(latency) FROM neteval) LIMIT 1')
        else:
            cursor_select = g.conn.execute('SELECT macid FROM neteval WHERE macid = %s',
                                           pref)

        results = {}
        results["macid"] = ""

        for row in cursor_select:
            results["macid"] = row["macid"]

        return Response(response=json.dumps(results), status=200, mimetype="application/json")


    except Exception as e:
        print e

        response_json = {"Status": "Failure"}
        return Response(response=json.dumps(response_json), status=500, mimetype="application/json")



@routes.route('/event/setapppref', methods=['POST'])
def set_app_pref():
    params = request.get_json()
    uid = params['uid']
    device_id = params['device_id']
    loc = params['location']
    time = params['time']
    pref = params['pref']

    try:
        if pref != "highest bandwidth" and pref != "lowest latency":
            cursor_select = g.conn.execute('SELECT macid FROM networkdata WHERE ssid = %s AND location = %s',
                                           pref, loc)
            for row in cursor_select:
                pref = row['macid']

        # Find if network already exists in database
        cursor_select = g.conn.execute('SELECT * FROM apppref WHERE uid = %s AND location = %s AND device_id = %s',
                                       uid, loc, device_id)
        if cursor_select.rowcount == 0:
            cursor_insert = g.conn.execute(
                'INSERT INTO apppref(uid, device_id, location, preference, time) VALUES(%s, %s, %s, %s, %s)',
                uid, device_id, loc, pref, time)
        else:
            for row in cursor_select:
                row['preferece'] = pref
                row['time'] = time

        response_json = {"Status": "Success"}
        return Response(response=json.dumps(response_json), status=200, mimetype="application/json")


    except Exception as e:
        print e

        response_json = {"Status": "Failure"}
        return Response(response=json.dumps(response_json), status=500, mimetype="application/json")


# input uid, loc, ssid, pref
# save in apppref (convert ssid & loc to macid)