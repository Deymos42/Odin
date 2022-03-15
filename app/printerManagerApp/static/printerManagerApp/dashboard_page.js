printersStatus = [];
ledStatus = [];
ids = [];
conected = [];
username = "";
ABORT = [];
var currentdate = new Date();


LIMITED_USER = "alumnes";


function timestrToSec(timestr) {
    var parts = timestr.split(":");
    return (parts[0] * 3600) +
        (parts[1] * 60) +
        (+parts[2]);
}

function pad(num) {
    if (num < 10) {
        return "0" + num;
    } else {
        return "" + num;
    }
}

function formatTime(seconds) {
    return [pad(Math.floor(seconds / 3600)),
    pad(Math.floor(seconds / 60) % 60),
    pad(seconds % 60),
    ].join(":");
}

function initPrinter(printerPwStatus, printerId, lightsPwStatus, Username) {

    printersStatus.push(printerPwStatus);
    ledStatus.push(lightsPwStatus);
    ids.push(printerId);
    username = Username;
    if (printerPwStatus == "printer_power_status_on") {
        conected.push(true);
    } else {
        conected.push(false);
    }
}


function updateStatus() {

    for (var i = 0; i < printersStatus.length; i++) {
        ABORT.push(false)
        if (printersStatus[i] == "printer_power_status_on") {

            // $("#printer_power_status_on" + ids[i]).html("Apagar impresora");
            $('#printer_power_status_on' + ids[i]).attr('class', 'btn btn-danger float-right');

        } else if (printersStatus[i] == "printer_power_status_off") {

            //$("#printer_power_status_off" + ids[i]).html("Encender impresora");
            $('#printer_power_status_off' + ids[i]).attr('class', 'btn btn-success float-right');

        }
        if (ledStatus[i] == "False") {
            $('#led' + ids[i]).attr('class', 'btn btn-info float-right');

        } else if (ledStatus[i] == "True") {
            $('#led' + ids[i]).attr('class', 'btn btn-danger float-right');

        }
    }
}

function printerPowerOnOff(status, id) {
    if (username != LIMITED_USER) {
        if (status == "printer_power_status_on") {
            ABORT[id] = true
            $.ajax({
                url: "/printer/" + id + "/printerPowerOff",
                type: "GET",
                success: function () {
                    var index = 0
                    for (i = 0; i < ids.length; i++) {
                        if (id == ids[i]) {
                            index = i
                        }
                    }
                    conected[index] = false;
                }
            });
            // $("#printer_power_status_on" + id).html("Encender impresora");
            $('#printer_power_status_on' + id).attr('class', 'btn btn-success float-right');
            $('#printer_power_status_on' + id).attr('id', 'printer_power_status_off' + id);
            $('#printer_power_status_off' + id).attr('onclick', "printerPowerOnOff('printer_power_status_off','" + id + "')");

        } else if (status == "printer_power_status_off") {
            $.ajax({
                url: "/printer/" + id + "/printerPowerOn",
                type: "GET",
                success: function (data) {

                    printersStatus[id - 1] = 'printer_power_status_on'
                    var index = 0
                    for (i = 0; i < ids.length; i++) {
                        if (id == ids[i]) {
                            index = i
                        }
                    }
                    conected[index] = true;

                }
            });
            $('#printer_power_status_off' + id).attr('id', 'printer_power_status_on' + id);
            //$("#printer_power_status_on" + id).html("Apagar impresora");
            $('#printer_power_status_on' + id).attr('class', 'btn btn-danger float-right');
            $('#printer_power_status_on' + id).attr('onclick', "printerPowerOnOff('printer_power_status_on','" + id + "')");
        }
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function ledOnOff(status, id) {
    if (username != LIMITED_USER) {
        $.ajax({
            url: '/printer/' + id + '/toggleLed',
            type: "GET",
            success: function (data) { }
        });
        if ($('#led' + id).attr("class") == "btn btn-info float-right") {
            $('#led' + id).attr("class", "btn btn-danger float-right");
        } else {
            $('#led' + id).attr("class", "btn btn-info float-right");
        }
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " h, " : " h, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " m, " : " m, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " s" : " s") : "";

    return hDisplay + mDisplay + sDisplay;

}

setInterval(function () {
    for (var i = 0; i < printersStatus.length; i++) {
        if (conected[i]) {
            var xhr = $.ajax({
                url: '/printer/' + ids[i] + '/getInfo',
                type: "GET",
                success: function (data) {
                    if (data.job.file.name != null) {
                        if (data.progress.printTimeLeft == null) {
                            timeLeft = secondsToHms(data.job.estimatedPrintTime) + " aprox"
                            printTime = 0;
                            completation = 0;
                            var h = Math.floor(data.job.estimatedPrintTime / 3600);
                            var m = Math.floor(data.job.estimatedPrintTime % 3600 / 60);
                            var s = Math.floor(data.job.estimatedPrintTime % 3600 % 60);
                        } else {
                            var h = Math.floor(data.progress.printTimeLeft / 3600);
                            var m = Math.floor(data.progress.printTimeLeft % 3600 / 60);
                            var s = Math.floor(data.progress.printTimeLeft % 3600 % 60);
                            timeLeft = secondsToHms(data.progress.printTimeLeft);
                            printTime = secondsToHms(data.progress.printTime);
                            completation = data.progress.completion;
                        }
                        var currentdate = new Date();

                        var currentTimeToSum = currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds()
                        var timeLeftToSum = h + ":" + m + ":" + s
                        var finalH = formatTime(timestrToSec(currentTimeToSum) + timestrToSec(timeLeftToSum));
                        $("#info" + data.id).html(
                            " Status: <b>" + data.state + "</b><br><br>" +
                            " Archivo: <b>" + data.job.file.name + "</b><br><br>" +
                            " Tiempo de impresion:  " + printTime + "</b><br><br>" +
                            " Tiempo restante:  " + timeLeft + "</b><br><br>" +
                            " Hora final aprox: <b>" + finalH + "</b>");
                        $('#barraProgreso' + data.id).attr('style', 'width:' + completation + '%');

                        if (completation % 10 == 0) {
                            $("#progress" + data.id).html(completation.toFixed(0) + "%");
                        } else {
                            $("#progress" + data.id).html(completation.toFixed(2) + "%");
                        }

                    } else {

                        $("#info" + data.id).html(
                            " Status: <b>" + data.state + "</b> <br><br>" +
                            " Archivo: <b>" + "-" + "</b> <br><br>" +
                            " Tiempo de impresion: <b>" + "-" + "</b> <br><br>" +
                            " Tiempo restante: <b>" + "-" + "</b> <br><br>" +
                            " Hora final aprox: <b>" + "-" + "</b>");
                    }

                }
            });

        } else {
            $("#info" + ids[i]).html(
                " Status: <b>" + "Offline" + "</b> <br><br>" +
                " Archivo: <b>" + "-" + "</b> <br><br>" +
                " Tiempo de impresion: <b>" + "-" + "</b> <br><br>" +
                " Tiempo restante: <b>" + "-" + "</b> <br><br>" +
                " Hora final aprox: <b>" + "-" + "</b>");
        }
    }
}, 3000);