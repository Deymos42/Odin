printersStatus = [];
ledStatus = [];
ids = [];
conected = [];
username = "";
ABORT = false;

function abort() {
    ABORT = !ABORT   
}
LIMITED_USER = "alumnes";

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
            $.ajax({
                url: "/printer/" + id + "/printerPowerOff",
                type: "GET",
                success: function () {
                    conected[id - 1] = false;
                }
            });
           // $("#printer_power_status_on" + id).html("Encender impresora");
            $('#printer_power_status_on' + id).attr('class', 'btn btn-success float-right');
            $('#printer_power_status_on' + id).attr('id', 'printer_power_status_off' + id);
            $('#printer_power_status_off' + id).attr('onclick', "printerPowerOnOff('printer_power_status_off','"+ id +"')" );

        } else if (status == "printer_power_status_off") {

            $.ajax({
                url: "/printer/" + id + "/printerPowerOn",
                type: "GET",
                success: function (data) {

                    printersStatus[id - 1] = 'printer_power_status_on'
                    conected[id - 1] = true;
                }
            });
            $('#printer_power_status_off' + id).attr('id', 'printer_power_status_on' + id);
            //$("#printer_power_status_on" + id).html("Apagar impresora");
            $('#printer_power_status_on' + id).attr('class', 'btn btn-danger float-right');
            $('#printer_power_status_on' + id).attr('onclick', "printerPowerOnOff('printer_power_status_on','"+ id +"')" );
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
            success: function (data) {}
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

                        } else {
                            timeLeft = secondsToHms(data.progress.printTimeLeft);
                            printTime = secondsToHms(data.progress.printTime);
                            completation = data.progress.completion;
                        }
                        $("#info" + data.id).html(
                            " Status: <b>" + data.state + "</b><br><br>" +
                            " Error: <b>" + (data.error.toFixed(2) *100) + "%" + "</b><br><br>" +
                            " Archivo: <b>" + data.job.file.name + "</b><br><br>" +
                            " Tiempo de impresion:  " + printTime + "</b><br><br>" +
                            " Tiempo restante: <b>" + timeLeft + "</b>");
                        $('#barraProgreso'+ data.id).attr('style', 'width:' + completation + '%');
                        
                        if (completation % 10 == 0) {
                            $("#progress" + data.id).html(completation.toFixed(0) + "%");
                        } else {
                            $("#progress" + data.id).html(completation.toFixed(2) + "%");
                        }
                        
                    } else {

                        $("#info" + data.id).html(
                            " Status: <b>" + data.state + "</b> <br><br>" +
                            " Error: <b>" + "-" + "</b> <br><br>" +
                            " Archivo: <b>" + "-" + "</b> <br><br>" +
                            " Tiempo de impresion: <b>" + "-" + "</b> <br><br>" +
                            " Tiempo restante: <b>" + "-" + "</b>");
                    }
                    var formatedError = (data.error * 100).toFixed(2)
                }
            });
            if (ABORT) {
                xhr.abort()
            }
        } else {
            $("#info" + ids[i]).html(
                " Status: <b>" + "Offline" + "</b> <br><br>" +
                " Error: <b>" + "-" + "</b> <br><br>" +
                " Archivo: <b>" + "-" + "</b> <br><br>" +
                " Tiempo de impresion: <b>" + "-" + "</b> <br><br>" +
                " Tiempo restante: <b>" + "-" + "</b>");
        }
    }
}, 3000);