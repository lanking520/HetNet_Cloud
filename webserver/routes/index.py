from flask import render_template
from . import routes
from application import *

@routes.route('/')
def index():
  return render_template("index.html")
