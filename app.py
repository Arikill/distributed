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

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        fs = float(request.form["samplingRate"])
        R = float(request.form["resistance"])
        C = float(request.form["capacitance"])
        I = float(request.form["current"])
        print(request.form)
        return jsonify({"status": "OK"})
    return render_template("index.html")

@app.route("/setup", methods=["GET, POST"])
def setup():
    if request.method == "POST":
        R = float(request.form["resistance"])
        C = float(request.form["capacitance"])
    pass

@socketio.on('my event')
def handle_my_event(json):
    print("received json: "+str(json))
    

if __name__ == "__main__":
    # app.run(host=_host, port=_port, debug=True)
    socketio.run(app, host=_host, port=_port, debug=True)
