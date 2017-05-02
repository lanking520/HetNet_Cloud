class table:
	LOGIN = "CREATE TABLE IF NOT EXISTS login (device_id text, password text NOT NULL, email text NOT NULL,PRIMARY KEY (device_id));"
	NETWORK = "CREATE TABLE IF NOT EXISTS networks (ssid text, bandwidth text NOT NULL, security text NOT NULL, location text NOT NULL,AvgSS integer NOT NULL,device_id text REFERENCES login on delete cascade, PRIMARY KEY (ssid,location));"
	APPLICATION = "CREATE TABLE IF NOT EXISTS application (name text, device_id text REFERENCES login on delete cascade,PRIMARY KEY (name,device_id));"
	APPDETL = "CREATE TABLE IF NOT EXISTS appdetl (access_time date, type text, name text, interval numeric, value numeric, device_id text,PRIMARY KEY (access_time, type), FOREIGN KEY (name, device_id) REFERENCES application(name, device_id) on delete cascade);"
	APPDATA = "CREATE TABLE IF NOT EXISTS appdata (uid numeric, timestamp numeric, download numeric, application_package text, upload numeric, device_id text, time text, PRIMARY KEY (uid, device_id), FOREIGN KEY (device_id) REFERENCES login(device_id) on delete cascade);"
<<<<<<< Updated upstream
	APPPREF = "CREATE TABLE IF NOT EXISTS apppref (uid text, device_id text, location text, preference text, time text, PRIMARY KEY (uid, device_id, location));"
=======
<<<<<<< HEAD

    NETEVAL = "CREATE TABLE IF NOT EXISTS neteval (macid text, bandwidth text NOT NULL, latency text NOT NULL, time text NOT NULL, PRIMARY KEY (macid));"
=======
	APPPREF = "CREATE TABLE IF NOT EXISTS apppref (uid text, device_id text, location text, preference text, time text, PRIMARY KEY (uid, device_id, location));"
>>>>>>> origin/master
>>>>>>> Stashed changes
	# Type indicate the CPU/Battery/DataUsage


	# Modifications to table

	networkModify = "alter table networks add time text;"

	appdata_drop_pk = "alter table drop constraint appdata_pkey from appdata;"
	appdata_add_pk = "alter table add constraint appdata_pkey primary key(uid, device_id, time);"
	"""
	psql \
   --host=hetpot.c8dtasexwftg.us-east-1.rds.amazonaws.com \
   --port=5432 \
   --username hetnet \
   --dbname=HetNet

	"""
