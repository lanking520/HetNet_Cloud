from flask import render_template, Response
from . import routes
from application import *
import json
from flask import request


@routes.route('/event/gethighestbandbyuidloc', methods=['GET'])
def get_highest_band_by_uid_loc():
    """
    get appdata by uid
    :return: {
        "appdata": [],
        "uid": uid_param
    }
    """

    uid_param = request.args.get('uid')
    device_id_param = request.args.get('deviceid')
    loc_param = request.args.get('location')

    try:
        cursor_select = g.conn.execute('SELECT preference FROM apppref WHERE uid = %s AND location = %s AND device_id = %s',
                                       uid_param, loc_param, loc_param)

        pref = ""

        for row in cursor_select:
            pref = row['perference']

        if pref == "highest bandwidth":
            cursor_select = g.conn.execute('SELECT macid, MAX(bandwidth) FROM neteval')
        elif pref == "lowest latency":
            cursor_select = g.conn.execute('SELECT macid, MIN(latency) FROM neteval')
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
