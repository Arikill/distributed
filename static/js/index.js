window.onload = function () {
    var elems = document.querySelectorAll("input[type=range]");
    M.Range.init(elems);
};

function getInputs() {
    return new Promise ((resolve, reject) => {
        var json = {}
        json.voltage = parseFloat(document.getElementById("plot").data[0].y[document.getElementById("plot").data[0].y.length-1]);
        json.current = parseFloat(document.getElementById("current").value);
        var samplingRate = parseFloat(document.getElementById("samplingRate").value);
        json.currentTime = parseFloat(document.getElementById("plot").data[0].x[document.getElementById("plot").data[0].x.length-1]);
        if (samplingRate <= 0) {
            samplingRate = parseFloat(100);
            document.getElementById("samplingRate").value = json.samplingRate;
        }
        if (json.currentTime < 0) {
            json.currentTime = 0;
        }
        json.currentTime = json.currentTime + (1.0/samplingRate);
        resolve(json);
    });
}

var socket = io();

socket.on('connect', function() {
    socket.emit('my event', {data: "I\'m connected!"});
});

document.getElementById("setup").addEventListener("click", function () {
    socket.emit('setup', {
        'resistance': parseFloat(document.getElementById("resistance").value), 
        'capacitance': parseFloat(document.getElementById("capacitance").value),
        'time': parseFloat(document.getElementById("plot").data[0].x[document.getElementById("plot").data[0].x.length-1])
    });
});

socket.on('setup', function(res) {
    console.log(res);
});

document.getElementById("run").addEventListener("click", function () {
    if (document.getElementById("run").getAttribute("state") === '0') {
        getInputs().then((json) => {
            socket.emit('call', json);
            document.getElementById("run").setAttribute("state", '1');
        });
    } else {
        document.getElementById("run").setAttribute("state", '0');
    }
});

socket.on('call', function(res) {
    if (document.getElementById("run").getAttribute("state") === '1') {
        update_plot(res).then(() => {
            return getInputs();
        }).then((json) => {
            socket.emit('call', json);
        });
    }
});

function update_plot(res) {
    return new Promise((resolve, reject) => {
        document.getElementById("plot").data[0].y.shift();
        document.getElementById("plot").data[0].y.push(parseFloat(res['voltage']));
        document.getElementById("plot").data[0].x.shift();
        document.getElementById("plot").data[0].x.push(res["time"]);
        document.getElementById("plot").data[1].y.shift();
        document.getElementById("plot").data[1].y.push(parseFloat(res['current']));
        document.getElementById("plot").data[1].x = document.getElementById("plot").data[0].x;
        Plotly.update('plot', document.getElementById("plot").data, document.getElementById("plot").layout);
        resolve();
    });
}

function initialize_plot() {
    var fs = parseFloat(document.getElementById("samplingRate").value);
    var duration = parseFloat(document.getElementById("displayDuration").value);
    var samples = parseInt(fs * duration);
    var voltage = new Array(samples);
    var current = new Array(samples);
    var time = new Array(samples);
    time[0] = parseFloat(0.0);
    for (var i = 1; i < samples; i++) {
        time[i] = time[i - 1] + 1 / fs;
    }
    voltage.fill(parseFloat(0.0));
    current.fill(parseFloat(0.0));
    var data = [{
        x: time,
        y: voltage,
        marker: {
            color: 'red'
        },
        type: 'line'
    }, {
        x: time,
        y: current,
        xaxis: 'x2',
        yaxis: 'y2',
        marker: {
            color: 'blue'
        },
        type: 'line'
    }];
    var layout = {
        title: 'Voltage of RC circuit',
        yaxis: {
            title: 'Volts',
            autorange: true
        },
        yaxis2: {
            title: 'Amps',
            autorange: true
        },
        xaxis: {
            title: 'time',
            autorange: true
        },
        xaxis2: {
            title: 'time',
            autorange: true
        },
        grid: {rows: 2, columns: 1, pattern: 'independent'},
    };
    Plotly.newPlot('plot', data, layout);
} initialize_plot();

// document.getElementById("current").addEventListener("change", function () {
//     send();
// });

// function send() {
//     var formData = new FormData(document.getElementById("send"));
//     console.log(formData);
//     window.fetch(document.location.protocol + "//" + document.location.hostname + ":" + document.location.port + "/", {
//         credentials: 'include',
//         method: 'POST', // or 'PUT'
//         body: formData,
//     }).then(response => {
//         response.json().then((c) => {
//             console.log(c);
//         });
//     });
// }