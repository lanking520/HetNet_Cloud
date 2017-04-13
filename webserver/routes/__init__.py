from flask import Blueprint
routes = Blueprint('routes',__name__)

from .index import *
from .login import *
from .event import *
from .network import *
from .appdata import *
