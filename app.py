from requests import request
from flask import Flask, render_template, jsonify, request
from flask_wtf.csrf import CSRFProtect
from flask_socketio import SocketIO
import random
import string
import numpy as np
from Plants import RCcircuit

csrf = CSRFProtect()

app = Flask(__name__, static_folder="./static", template_folder="./templates")
_host = "localhost"
_port = 8000
app.secret_key = "".join(random.choices(string.digits + string.ascii_uppercase + string.ascii_lowercase, k=100))
csrf.init_app(app)
socketio = SocketIO(app)

rc = RCcircuit()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/rc")
def RC():
    return render_template("rc.html")

@socketio.on('setup/rc')
def setup(json):
    rc.set_R(float(json["resistance"]))
    rc.set_C(float(json["capacitance"]))
    rc.t = float(json["time"])
    socketio.emit('setup/rc', {"status": "OK"})

@socketio.on('call/rc')
def call(json):
    socketio.emit('call/rc', {'voltage': rc(float(json["voltage"]), float(json["current"]), float(json["currentTime"])), 'current': float(json["current"]), 'time': float(json["currentTime"])})

@app.route("/mimic")
def MIMIC():
    return render_template("mimic.html")


if __name__ == "__main__":
    # app.run(host=_host, port=_port, debug=True)
    socketio.run(app, host=_host, port=_port, debug=True)
