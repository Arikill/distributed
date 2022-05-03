window.onload = function () {
    M.Range.init(document.querySelectorAll("input[type=range]"));
    M.FormSelect.init(document.querySelectorAll("select"));
};

var socketio = io();

document.getElementById("data-file").addEventListener("change", function() {
    var formData = new FormData(document.getElementById("data-form"));
    window.fetch(document.URL, {
        method: "POST",
        body: formData
    }).then(res => res.json()).then((res) => {
        var html = '';
        for(var i = 0; i < res.variables.length; i++) {
            html += `<option value="${res.variables[i]}">${res.variables[i]}</option>`;
        }
        document.getElementById("inputs").innerHTML=html;
        document.getElementById("outputs").innerHTML=html;
        M.FormSelect.init(document.querySelectorAll("#inputs, #outputs"));
    });
});

function getInputs() {
    var selected = [];
    for (var option of document.getElementById('inputs').options)
    {
        if (option.selected) {
            selected.push(option.value);
        }
    }
    return selected;
}

document.getElementById('inputs').addEventListener('change', function() {
    var inputs = getInputs();
    var outputs = getOutputs();
    for (var input of inputs) {
        if (outputs.includes(input)) {
            document.getElementById('outputs').querySelector(`option[value="${input}"]`).selected=false;
            M.FormSelect.init(document.getElementById('outputs'));
        }
    }
});

function getOutputs() {
    var selected = [];
    for (var option of document.getElementById('outputs').options)
    {
        if (option.selected) {
            selected.push(option.value);
        }
    }
    return selected;
}

document.getElementById('outputs').addEventListener('change', function() {
    var inputs = getInputs();
    var outputs = getOutputs();
    for (var output of outputs) {
        if (inputs.includes(output)) {
            document.getElementById('inputs').querySelector(`option[value="${output}"]`).selected=false;
            M.FormSelect.init(document.getElementById('inputs'));
        }
    }
});

socketio.on('setup/mimic', function() {
    socketio.emit("");
});

function initialize_line_plot(div, x_label, y_label, color, title) {
    var xData = new Array(100);
    var yData = new Array(100);
    var data = [{
        x: xData,
        y: yData,
        type: 'line',
        marker: {color: color}
    }];
    var layout = {
        margin: {l: 50, r: 0, t: 50, b: 50},
        title: title,
        yaxis: {
            title: y_label,
            autorange: true
        },
        xaxis: {
            title: x_label,
            autorange: true
        }
    }
    Plotly.newPlot(div, data, layout, {responsive: true});
}

// function getInputs() {
//     return new Promise ((resolve, reject) => {
//         var json = {}
//         json.voltage = parseFloat(document.getElementById("plot").data[0].y[document.getElementById("plot").data[0].y.length-1]);
//         json.current = parseFloat(document.getElementById("current").value);
//         var samplingRate = parseFloat(document.getElementById("samplingRate").value);
//         json.currentTime = parseFloat(document.getElementById("plot").data[0].x[document.getElementById("plot").data[0].x.length-1]);
//         if (samplingRate <= 0) {
//             samplingRate = parseFloat(100);
//             document.getElementById("samplingRate").value = json.samplingRate;
//         }
//         if (json.currentTime < 0) {
//             json.currentTime = 0;
//         }
//         json.currentTime = json.currentTime + (1.0/samplingRate);
//         resolve(json);
//     });
// }

// var socket = io();

// socket.on('connect', function() {
//     socket.emit('my event', {data: "I\'m connected!"});
// });

// document.getElementById("setup").addEventListener("click", function () {
//     socket.emit('setup/rc', {
//         'resistance': parseFloat(document.getElementById("resistance").value), 
//         'capacitance': parseFloat(document.getElementById("capacitance").value),
//         'time': parseFloat(document.getElementById("plot").data[0].x[document.getElementById("plot").data[0].x.length-1])
//     });
// });

// socket.on('setup/rc', function(res) {
//     console.log(res);
// });

// document.getElementById("run").addEventListener("click", function () {
//     if (document.getElementById("run").getAttribute("state") === '0') {
//         getInputs().then((json) => {
//             socket.emit('call/rc', json);
//             document.getElementById("run").setAttribute("state", '1');
//         });
//     } else {
//         document.getElementById("run").setAttribute("state", '0');
//     }
// });

// socket.on('call/rc', function(res) {
//     if (document.getElementById("run").getAttribute("state") === '1') {
//         update_plot(res).then(() => {
//             return getInputs();
//         }).then((json) => {
//             socket.emit('call/rc', json);
//         });
//     }
// });

// function update_plot(res) {
//     return new Promise((resolve, reject) => {
//         document.getElementById("plot").data[0].y.shift();
//         document.getElementById("plot").data[0].y.push(parseFloat(res['voltage']));
//         document.getElementById("plot").data[0].x.shift();
//         document.getElementById("plot").data[0].x.push(res["time"]);
//         document.getElementById("plot").data[1].y.shift();
//         document.getElementById("plot").data[1].y.push(parseFloat(res['current']));
//         document.getElementById("plot").data[1].x = document.getElementById("plot").data[0].x;
//         Plotly.update('plot', document.getElementById("plot").data, document.getElementById("plot").layout, document.getElementById("plot").config);
//         resolve();
//     });
// }

// function initialize_plot() {
//     var fs = parseFloat(document.getElementById("samplingRate").value);
//     var duration = parseFloat(document.getElementById("displayDuration").value);
//     var samples = parseInt(fs * duration);
//     var voltage = new Array(samples);
//     var current = new Array(samples);
//     var time = new Array(samples);
//     time[0] = parseFloat(0.0);
//     for (var i = 1; i < samples; i++) {
//         time[i] = time[i - 1] + 1 / fs;
//     }
//     voltage.fill(parseFloat(0.0));
//     current.fill(parseFloat(0.0));
//     var data = [{
//         x: time,
//         y: voltage,
//         marker: {
//             color: 'red'
//         },
//         type: 'line'
//     }, {
//         x: time,
//         y: current,
//         xaxis: 'x2',
//         yaxis: 'y2',
//         marker: {
//             color: 'blue'
//         },
//         type: 'line'
//     }];
//     var layout = {
//         margin: {
//             l: 50, r: 0, t: 50, b: 50
//         },
//         title: 'Voltage of RC circuit',
//         yaxis: {
//             title: 'Volts',
//             autorange: true
//         },
//         yaxis2: {
//             title: 'Amps',
//             autorange: true
//         },
//         xaxis: {
//             title: 'time',
//             autorange: true
//         },
//         xaxis2: {
//             title: 'time',
//             autorange: true
//         },
//         grid: {rows: 2, columns: 1, pattern: 'independent'},
//     };
//     Plotly.newPlot('plot', data, layout, {responsive: true});
// } initialize_plot();