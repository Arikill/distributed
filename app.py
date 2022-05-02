from requests import request
from flask import Flask, render_template, jsonify, request
from flask_wtf.csrf import CSRFProtect
from flask_socketio import SocketIO
import random
import string
import numpy as np
from Plants import RCcircuit
import os
from werkzeug.utils import secure_filename
import Reader

csrf = CSRFProtect()

app = Flask(__name__, static_folder="./static", template_folder="./templates")
app.config["UPLOAD_FOLDER"] = "./uploads"
_host = "localhost"
_port = 8000
_allowed_extensions=["txt", "csv"]
app.secret_key = "".join(random.choices(string.digits + string.ascii_uppercase + string.ascii_lowercase, k=100))
csrf.init_app(app)
socketio = SocketIO(app)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in _allowed_extensions

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

@app.route("/mimic", methods=["GET", "POST"])
def MIMIC():
    if request.method == "POST":
        if 'data-file' not in request.files:
            return jsonify({"status": False, "msg": "No file found!"})
        file = request.files["data-file"]
        if file.filename == "":
            return jsonify({"status": False, "msg": "File has no name"})
        if allowed_file(file.filename):
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
            vars = Reader.read_txt(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
            return jsonify({"status": True, "variables": vars})
        return jsonify({"status": False, "msg": "file type not allowed"})
    return render_template("mimic.html")

if __name__ == "__main__":
    for f in os.listdir(app.config["UPLOAD_FOLDER"]):
        os.remove(os.path.join(app.config["UPLOAD_FOLDER"], f))
    socketio.run(app, host=_host, port=_port, debug=True)
