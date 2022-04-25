window.onload = function () {
    var elems = document.querySelectorAll("input[type=range]");
    M.Range.init(elems);
};

function initialize_plot() {
    var fs = parseFloat(document.getElementById("samplingRate").value);
    var duration = parseFloat(document.getElementById("displayDuration").value);
    var samples = parseInt(fs * duration);
    var voltage = new Array(samples);
    var time = new Array(samples);
    time[0] = parseFloat(0.0);
    voltage[0] = parseFloat(0.0);
    for (var i = 1; i < samples; i++) {
        time[i] = time[i - 1] + 1 / fs;
        voltage[i] = voltage[i - 1];
    }
    var data = [{
        x: time,
        y: voltage,
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
        xaxis: {
            title: 'time',
            autorange: true
        }
    };
    Plotly.newPlot('plot', data, layout);
    console.log("plotting");
} initialize_plot();

document.getElementById("current").addEventListener("change", function () {
    send();
});

function send() {
    var formData = new FormData(document.getElementById("send"));
    console.log(formData);
    window.fetch(document.location.protocol + "//" + document.location.hostname + ":" + document.location.port + "/", {
        credentials: 'include',
        method: 'POST', // or 'PUT'
        body: formData,
    }).then(response => {
        response.json().then((c) => {
            console.log(c);
        });
    });
}