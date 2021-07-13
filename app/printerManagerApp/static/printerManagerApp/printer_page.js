printerStatus = null;
ledStatus = null;
id = null;
conected = false;
tabla = null;
apikey = "?apikey=";
username = "";

LIMITED_USER = "alumnes";

var opts = {
    angle: 0, // The span of the gauge arc
    lineWidth: 0.44, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
        length: 0.68, // // Relative to gauge radius
        strokeWidth: 0.055, // The thickness
        color: '#000000' // Fill color
    },
    limitMax: false, // If false, max value increases automatically if value > maxValue
    limitMin: false, // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF', // Colors
    colorStop: '#8FC0DA', // just experiment with them
    strokeColor: '#E0E0E0', // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true, // High resolution support
    percentColors: [
        [0.0, "#67FE1F"],
        [0.7, "#F46E05"],
        [1, "#E71B00"]
    ],

};

var target = document.getElementById('gaugeTest'); // your canvas element
var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
gauge.maxValue = 100; // set max gauge value
gauge.setMinValue(0); // Prefer setter over gauge.minValue = 0
gauge.animationSpeed = 100; // set animation speed (32 is default value)
gauge.set(0.5); // set actual value


function init(printerPwStatus, printerId, lightPwStatus, key, Username) {

    apikey = apikey.concat(key);
    printerStatus = printerPwStatus;
    id = printerId;
    ledStatus = lightPwStatus;
    username = Username;
    enterFolder('local');

    if (printerStatus == "printer_power_status_on") {

        $("#printer_power_status_on").html("Apagar impresora");
        $('#printer_power_status_on').attr('class', 'btn btn-danger');
        conected = true;
        toastr.success("impresora conectada", 'WoW');


    } else if (printerStatus == "printer_power_status_off") {

        $("#printer_power_status_off").html("Encender impresora");
        $('#printer_power_status_off').attr('class', 'btn btn-success');

    }


    if (ledStatus == "False") {
        $("#led_status_on").html("Encender luz");
        $('#led_status_on').attr('class', 'btn btn-info');
        $('#led_status_on').attr('id', 'led_status_off');
        ledStatus = "True"

    } else if (ledStatus == "True") {
        $("#led_status_off").html("Apagar luz");
        $('#led_status_off').attr('class', 'btn btn-danger');
        $('#led_status_off').attr('id', 'led_status_on');
        ledStatus = "False"
    }


}

function printerPowerOnOff(status) {
    if (username != LIMITED_USER) {
        if (status == "printer_power_status_on") {
            $.ajax({
                url: "/printer/" + id + "/printerPowerOff",
                type: "GET",
                success: function () {
                    $("#printer_power_status_on").html("Encender impresora");
                    $('#printer_power_status_on').attr('class', 'btn btn-success');
                    $('#printer_power_status_on').attr('id', 'printer_power_status_off');
                    printerStatus = 'printer_status_off'

                }
            });


        } else if (status == "printer_power_status_off") {
            $.ajax({
                url: "/printer/" + id + "/printerPowerOn",
                type: "GET",
                success: function (data) {
                    conected = data;
                    if (conected) {
                        toastr.success("impresora conectada", 'WoW');
                    } else {
                        toastr.error("conexion fallida", 'WoW');
                    }

                }
            });
            $('#printer_power_status_off').attr('id', 'printer_power_status_on');
            $("#printer_power_status_on").html("Apagar impresora");
            $('#printer_power_status_on').attr('class', 'btn btn-danger');
            $('#status').html("Online");
            printerStatus = 'printer_power_status_on'

        }
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function ledOnOff() {
    if (username != LIMITED_USER) {
        $.ajax({
            url: '/printer/' + id + '/toggleLed',
            type: "GET",
            success: function (data) {

            }
        });

        if (ledStatus == "False") {
            $("#led_status_on").html("Encender luz");
            $('#led_status_on').attr('class', 'btn btn-info');
            $('#led_status_on').attr('id', 'led_status_off');
            ledStatus = "True"

        } else if (ledStatus == "True") {
            $("#led_status_off").html("Apagar luz");
            $('#led_status_off').attr('class', 'btn btn-danger');
            $('#led_status_off').attr('id', 'led_status_on');
            ledStatus = "False"
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

    if (conected) {

        $.ajax({
            url: '/printer/' + id + '/getInfo',
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
                    $("#info").html(" progress: <b>" + completation.toFixed(2) + "%" + "</b><br>" +
                        "<br> archivo: <b>" + data.job.file.name + "</b><br>" +
                        "<br> tiempo de impresion:  " + printTime + "</b><br>" +
                        "<br> tiempo restante: <b>" + timeLeft + "</b><br>");
                    $('#barraProgreso').attr('style', 'width:' + completation + '%');
                    if (completation % 10 == 0) {
                        $("#progress").html(completation.toFixed(0) + "%");
                    } else {
                        $("#progress").html(completation.toFixed(2) + "%");
                    }
                }
                var formatedError = (data.error * 100).toFixed(2)
                $('#status').html(data.state);
                $('#errorNumber').html(formatedError);
                gauge.set(formatedError);

                if (data.state == "Printing") {
                    $(".btn.btn-success").prop('disabled', true);

                } else {
                    $(".btn.btn-success").prop('disabled', false);
                }

                if (data.state == "Paused") {

                    $("#pause").html("resume");
                    $('#pause').attr('class', 'btn btn-success');
                    $('#pause').attr('id', 'resume');
                } else {

                    $("#resume").html("pause");
                    $('#resume').attr('class', 'btn btn-warning');
                    $('#resume').attr('id', 'pause');
                }

                $("#toolTemp").html(data.toolTemp.actual);

                if (data.toolTemp.target != 0) {
                    $('#inputTool').attr('placeholder', data.toolTemp.target);
                } else {
                    $('#inputTool').attr('placeholder', "off");
                }

                $("#bedTemp").html(data.bedTemp.actual);
                if (data.bedTemp.target != 0) {
                    $('#inputBed').attr('placeholder', data.bedTemp.target);
                } else {
                    $('#inputBed').attr('placeholder', "off");
                }
            }
        });


    } else {
        $(".btn.btn-success").prop('disabled', false);
        $("#toolTemp").html("-");
        $("#bedTemp").html("-");
        $("#info").html(" progress: <b>" + "-" + "</b><br>" +
            "<br> archivo: <b>" + "-" + "</b><br>" +
            "<br> tiempo de impresion: <b>" + "-" + "</b><br>" +
            "<br> tiempo restante: <b>" + "-" + "</b><br>");
        $('#input_tool').attr('placeholder', "off");
        $('#input_bed').attr('placeholder', "off");


    }
}, 2000);

function setBedtemp() {
    if (username != LIMITED_USER) {
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/setBedTemp/' + $('#inputBed').val(),
            success: function (json) {
                $("#inputBed").attr('placeholder', $('#inputBed').val());
            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function coolBed() {
    if (username != LIMITED_USER) {
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/setBedTemp/' + 0,
            success: function (json) {
                toastr.success('Enfriando cama', 'WoW');
                $("#inputBed").attr('placeholder', '-');
            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function setToolTemp() {
    if (username != LIMITED_USER) {
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/setToolTemp/' + $('#inputTool').val(),
            success: function (json) {
                $("#inputTool").attr('placeholder', $('#inputTool').val());
            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function coolTool() {
    if (username != LIMITED_USER) {
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/setToolTemp/' + 0,
            success: function (json) {
                toastr.success('Enfriando extrusor!', 'WoW');
                $("#inputTool").attr('placeholder', '-');
            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function printSelectedFile() {
    if (username != LIMITED_USER) {
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/printSelectedFile',
            success: function (data) {
                //$('#' + filepath).attr('style', 'background-color:moccasin');                   
                toastr.success('Imprimiendo archivo seleccionado ', 'WoW');
            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function toggle(id) {
    if (username != LIMITED_USER) {
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/toggle',

        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function cancel() {
    if (username != LIMITED_USER) {
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/cancel',

            success: function (json) {
                toastr.success('Cancelando', 'WoW');
            }

        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function homePrinter() {
    if (username != LIMITED_USER) {
        $.ajax({
            url: '/printer/' + id + '/homePrinter',
            type: "GET",
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function preheat() {
    if (username != LIMITED_USER) {
        $.ajax({
            url: '/printer/' + id + '/preheat',

            success: function (json) {
                toastr.success('Calentando', 'WoW');
                $("#inputBed").attr('placeholder', '60');
                $("#inputTool").attr('placeholder', '205');
            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function extrude() {
    if (username != LIMITED_USER) {
        $.ajax({
            url: '/printer/' + id + '/extrude',

            success: function (json) {
                toastr.success('extruyendo', 'WoW');

            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}


function retract() {
    if (username != LIMITED_USER) {
        $.ajax({
            url: '/printer/' + id + '/retract',

            success: function (json) {
                toastr.success('retrayendo', 'WoW');

            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function destroyDataRable() {

    tabla.clear().destroy();
}

function loadDataTable() {

    tabla = $('#zero_config').DataTable({
        retrieve: true
    });
}


function download(url) {

    temp = window.open(url);
    temp.addEventListener('load', function () {
        temp.close();
    }, false);
}

function deleteFile(filepath) {
    if (username != LIMITED_USER) {

        var newFilepath = filepath.replaceAll("/", "@");
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/deleteFile/' + newFilepath,
            success: function (json) {
                enterFolder(actualPath)
            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}
class fileSystem {

    constructor(options = {}) {
        Object.assign(this, options);
        this.isLocal = true;
    }

    getLocal(obj) {
        let carpets = [];
        let carpetsPaths = [];
        let files = [];
        let filesPath = [];
        let filesLinks = [];
        var a;
        if (obj == this) {
            a = obj.files;
        } else {
            a = obj.children;
        }
        for (var i = 0; i < a.length; i++) {
            if (a[i].type == "folder") {
                carpets.push(a[i].name);
                carpetsPaths.push(a[i].path); // path witout local 

            } else if (a[i].type == "machinecode") {
                files.push(a[i].name);
                filesPath.push(a[i].path); // path witout local 
                filesLinks.push(a[i].refs.download.concat(apikey))
            }
        }
        return [carpets, carpetsPaths, files, filesPath, filesLinks];
    }



    recu(objFolder, path) {
        for (var i = 0; i < objFolder.children.length; i++) {
            if (objFolder.children[i].type == "folder") {
                if (objFolder.children[i].path == path) {
                    return this.getLocal(objFolder.children[i]);
                } else {
                    recu(objFolder.children[i], path);
                }
            }
        }
        return false
    }

    getFolder(path) {

        for (var i = 0; i < this.files.length; i++) {

            if (this.files[i].type == "folder") {
                if (this.files[i].path == path) {
                    return this.getLocal(this.files[i]);
                } else {
                    var ret = this.recu(this.files[i], path);
                    if (ret != false) {
                        return ret;
                    }
                }
            }
        }
        return "Folder not Found"
    }
    getBackPath(path) {

        path = String(path)
        var list = path.split("/")

        var ret = "";
        if (list.length != 1) {
            for (var i = 0; i < list.length - 1; i++) {
                ret += list[i] + "/";
            }
            return ret.slice(0, -1) + " ";
        } else {
            return "local"
        }
    }

};


actualPath = "folderId";

function actualPathForUpladFile() {

    var elem = document.getElementById("filePath");
    elem.value = actualPath;
}

function enterFolder(folderId) {

    $.ajax({
        url: '/printer/' + id + '/getAllFilesAndFolders',
        type: "GET",
        success: function (data) {

            if (tabla != null) {
                if (tabla.data().count()) {
                    destroyDataRable();
                }
            }
            var FileSystem = new fileSystem(data);
            var content = "";

            if (folderId == "local") {

                let folders = FileSystem.getLocal(FileSystem)[0];
                let foldersPath = FileSystem.getLocal(FileSystem)[1];
                let files = FileSystem.getLocal(FileSystem)[2];
                let filesPath = FileSystem.getLocal(FileSystem)[3];
                let filesLink = FileSystem.getLocal(FileSystem)[4];

                for (var i = 0; i < folders.length; i++) {

                    content += "<tr>" +
                        "<td id='" + foldersPath[i] + " ' style='cursor: pointer;' onClick='enterFolder(this.id)'><i class='m-r-10 mdi mdi-folder'></i>" + "  " + folders[i] + "</td>" +
                        "<td></td>" +
                        "<td></td>" +
                        "<td  align='center'><button data-toggle='modal'   data-target='#confirmDialog' id='" + foldersPath[i] + " 'onClick='passIdToModal(this.id)' class='btn btn-danger'>eliminar</button></td>" +
                        "<td></td>" +
                        "</tr>"
                }

                for (var i = 0; i < files.length; i++) {
                    content += "<tr>" +
                        "<<td id='" + filesPath[i] + " ' style='cursor: pointer; ' onClick='selectFile(this.id)'><i class='m-r-10 mdi mdi-file'></i><code class='m-r-10'></i></code>" + filesPath[i] + "</td>" +
                        "<td align='center'><button id='" + filesPath[i] + " 'onClick='print(this.id)' class='btn btn-success'>print</button></td>" +
                        "<td align='center'><button type='button' class='btn btn-info margin-5' data-toggle='modal' data-target='#fileInfo'>Info</button></td>" +
                        "<td  align='center'><button id='" + filesPath[i] + " 'onClick='deleteFile(this.id)' class='btn btn-danger'>eliminar</button></td>" +
                        "<td  align='center'><button id='" + filesLink[i] + " 'onClick='download(this.id)' class='btn btn-info'>descargar</button></td>" +
                        "</tr>"
                }

            } else {
                var backPath = FileSystem.getBackPath(folderId.slice(0, -1));

                let folders = FileSystem.getFolder(folderId.slice(0, -1))[0];

                let foldersPath = FileSystem.getFolder(folderId.slice(0, -1))[1];

                let files = FileSystem.getFolder(folderId.slice(0, -1))[2];

                let filesPath = FileSystem.getFolder(folderId.slice(0, -1))[3];

                let filesLink = FileSystem.getFolder(folderId.slice(0, -1))[4];

                content += "<tr>" +
                    "<td id='" + backPath + "'  style='cursor: pointer;' onClick='enterFolder(this.id)'><i class='m-r-10 mdi mdi-arrow-left'></i>" + "  " + "  Back" + "<br>" + "<small> Carpeta: " + actualPath + "</small>" + "</td>" +
                    "<td></td>" +
                    "<td></td>" +
                    " <td></td>" +
                    "<td></td>" +
                    "</tr>";

                for (var i = 0; i < folders.length; i++) {
                    content += "<tr>" +
                        "<td id='" + foldersPath[i] + " '  style='cursor: pointer;' onClick='enterFolder(this.id)'><i class='m-r-10 mdi mdi-folder'></i>" + "  " + folders[i] + "</td>" +
                        "<td></td>" +
                        "<td></td>" +
                        "<td  align='center'><button data-toggle='modal'   data-target='#confirmDialog' id='" + foldersPath[i] + " 'onClick='passIdToModal(this.id)' class='btn btn-danger'>eliminar</button></td>" +
                        "<td></td>" +
                        "</tr>"
                }

                for (var i = 0; i < files.length; i++) {
                    content += "<tr>" +
                        "<<td id='" + filesPath[i] + " '  style='cursor: pointer;' onClick='selectFile(this.id)'><i class='m-r-10 mdi mdi-file'></i><code class='m-r-10'></i></code>" + files[i] + "</td>" +
                        "<td align='center'><button id='" + filesPath[i] + " 'onClick='print(this.id)' class='btn btn-success'>print</button></td>" +
                        "<td align='center'><button type='button' class='btn btn-info margin-5' data-toggle='modal' data-target='#fileInfo'>Info</button></td>" +
                        "<td  align='center'><button id='" + filesPath[i] + " 'onClick='deleteFile(this.id)' class='btn btn-danger'>eliminar</button></td>" +
                        "<td  align='center'><button id='" + filesLink[i] + " 'onClick='download(this.id)' class='btn btn-info'>descargar</button></td>" +
                        "</tr>"
                }


            }

            $("#zero_config").html("<thead>" +
                "<tr>" +
                "<th style='vertical-align: middle; text-align: center;'>Name</th>" +
                "<th style='vertical-align: middle; text-align: center;'>Imprimir</th>" +
                "<th style='vertical-align: middle; text-align: center;'>Informacion</th>" +
                "<th style='vertical-align: middle; text-align: center;'>Eliminar</th>" +
                "<th style='vertical-align: middle; text-align: center;'>Descargar</th>" +
                "</tr>" +
                "</thead>" +
                "<tbody>" +

                content);
            loadDataTable();
            actualPath = folderId;
        }

    });


}

function passIdToModal(id) {
    $("#deleteItemButton").attr('name', id);
    var paragraph = document.getElementById("nameOfDeleteElement");
    var text = document.createTextNode(id);
    var interrogation = document.createTextNode(" y todo lo que contiene?");
    paragraph.appendChild(text);
    paragraph.appendChild(interrogation);

}

function print(filepath) {
    if (username != LIMITED_USER) {

        var newFilepath = filepath.replaceAll("/", "@");

        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/print/' + newFilepath,

            success: function (json) {

                $('#' + filepath).attr('style', 'background-color:moccasin');
                $('#' + filepath).attr('onClick', 'none'); //TODO make alert
                toastr.success('Imprimiendo ' + filepath, 'WoW');
            },

        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }

}



function selectFile(filepath) {
    if (username != LIMITED_USER) {
        var newFilepath = filepath.replaceAll("/", "@");

        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/select/' + newFilepath,
            success: function (data) {
                toastr.success('archivo seleccionado para imprimir ', 'WoW');
                $('#' + filepath).attr('style', 'background-color:red');

            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function createFolder() {
    if (username != LIMITED_USER) {
        if (actualPath != "local") {
            var folderPath = actualPath.slice(0, -1) + "/" + $('#folderPathTextBox').val();
        } else {
            var folderPath = $('#folderPathTextBox').val();
        }
        $('#folderPathTextBox').val("");
        var newFilepath = folderPath.replaceAll("/", "@");

        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/createFolder/' + newFilepath,
            success: function (data) {
                toastr.success('Carpeta creada correctamente', 'WoW');
                enterFolder(actualPath)
            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }
}

function pulsarIntroToolTemp(e) {
    if (e.keyCode === 13 && !e.shiftKey) {
        setToolTemp();
    }
}

function pulsarIntroBedTemp(e) {
    if (e.keyCode === 13 && !e.shiftKey) {
        setBedTemp();
    }
}