printerStatus = null;
ledStatus = null;
id = null;
conected = false;
tabla = null;
apikey = "?apikey=";
username = "";
resolved = true
var oneTimeCall = true
var allFolders = []
LIMITED_USER = "alumnes";
ABORT = false;
var currentdate = new Date();

function abort() {
    ABORT = !ABORT
}

function UrlExists(url, cb) {
    jQuery.ajax({
        url: url,
        dataType: 'text',
        type: 'GET',
        complete: function (xhr) {
            if (typeof cb === 'function')
                cb.apply(this, [xhr.status]);
        }
    });
}



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


function init(printerPwStatus, printerId, lightPwStatus, key, Username) {

    apikey = apikey.concat(key);
    printerStatus = printerPwStatus;
    id = printerId;
    ledStatus = lightPwStatus;
    username = Username;
    enterFolder('local');

    if (printerStatus == "printer_power_status_on") {

        //$("#printer_power_status_on").html("Apagar impresora");
        $('#printer_power_status_on').attr('class', 'btn btn-danger');
        conected = "True";
        toastr.success("impresora conectada", 'WoW');


    } else if (printerStatus == "printer_power_status_off") {

        // $("#printer_power_status_off").html("Encender impresora");
        $('#printer_power_status_off').attr('class', 'btn btn-success');

    }


    if (ledStatus == "False") {
        //$("#led_status_on").html("Encender luz");
        $('#bulb').attr('class', 'far fa-lightbulb');
        $('#led_status_on').attr('class', 'btn btn-info');
        $('#led_status_on').attr('id', 'led_status_off');
        ledStatus = "True"

    } else if (ledStatus == "True") {
        // $("#led_status_off").html("Apagar luz");
        $('#bulb').attr('class', 'fas fa-lightbulb');
        $('#led_status_off').attr('class', 'btn btn-danger');
        $('#led_status_off').attr('id', 'led_status_on');
        ledStatus = "False"
    }


}

function printerPowerOnOff(status) {
    if (username != LIMITED_USER) {
        if (status == "printer_power_status_on") {
            ABORT = true
            $.ajax({
                url: "/printer/" + id + "/printerPowerOff",
                type: "GET",
                success: function (data) {
                    // $("#printer_power_status_on").html("Encender impresora");
                    $('#printer_power_status_on').attr('class', 'btn btn-success');
                    $('#printer_power_status_on').attr('id', 'printer_power_status_off');
                    printerStatus = 'printer_status_off'
                    conected = false
                    $('#status').html("Offline");
                }
            });


        } else if (status == "printer_power_status_off") {
            ABORT = false
            $.ajax({
                url: "/printer/" + id + "/printerPowerOn",
                type: "GET",
                success: function (data) {

                    conected = data;

                    if (conected == "True" || conected == "true") {
                        toastr.success("impresora conectada", 'WoW');
                    } else {
                        toastr.error("conexion fallida", 'WoW');
                    }

                }
            });
            $('#printer_power_status_off').attr('id', 'printer_power_status_on');
            //($("#printer_power_status_on").html("Apagar impresora");
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
            //$("#led_status_on").html("Encender luz");
            $('#bulb').attr('class', 'far fa-lightbulb');
            $('#led_status_on').attr('class', 'btn btn-info');
            $('#led_status_on').attr('id', 'led_status_off');
            ledStatus = "True"

        } else if (ledStatus == "True") {
            //$("#led_status_off").html("Apagar luz");
            $('#bulb').attr('class', 'fas fa-lightbulb');
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
    var caca = $('#newFileName').find(":selected").text();

    if (conected == "True" || conected == "true") {
        if (resolved == true) {
            resolved = false
            var xhr = $.ajax({
                url: '/printer/' + id + '/getInfo',
                type: "GET",
                success: function (data) {
                    resolved = true
                    if (data.job.file.name != null) {
                        if (oneTimeCall) {
                            console.log(data.job.file.path.slice(0, -6))
                            var thumbnailUrl = printerUrl + "plugin/prusaslicerthumbnails/thumbnail/" + data.job.file.path.slice(0, -6) + ".png"
                            UrlExists(thumbnailUrl, function (status) {
                                if (status === 200) {
                                    $('#thumbnail').html('<img src="' + thumbnailUrl + '"  width="175"  height="175" style="  display: block;  margin-left: auto;  margin-right: auto;"/>');

                                } else if (status === 404) {
                                    $('#thumbnail').html("No disponible");
                                } else {
                                    $('#thumbnail').html("No disponible");
                                    toastr.error('Error extraño con la vista previa', 'Error');
                                }
                            });
                            oneTimeCall = false
                        }


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
                        console.log("curr" + currentTimeToSum)
                        $("#info").html(" Progreso: <b>" + completation.toFixed(2) + "%" + "</b><br>" +
                            "<br> Archivo: <b>" + data.job.file.name + "</b><br>" +
                            "<br> Tiempo de impresion:  " + printTime + "</b><br>" +
                            "<br> Tiempo restante: <b>" + timeLeft + "</b><br>" +
                            "<br> Hora final aprox: <b>" + finalH + "</b><br>");
                        $('#barraProgreso').attr('style', 'width:' + completation + '%');
                        if (completation % 10 == 0) {
                            $("#progress").html(completation.toFixed(0) + "%");
                        } else {
                            $("#progress").html(completation.toFixed(2) + "%");
                        }
                    } else {
                        $('#thumbnail').html("No disponible");
                    }


                    $('#status').html(data.state);



                    if (data.state == "Printing") {
                        $(".btn.btn-success").prop('disabled', true);

                    } else {
                        $(".btn.btn-success").prop('disabled', false);
                    }

                    if (data.state == "Paused") {

                        $("#pause").html("resume");
                        $('#pause').attr('class', 'btn btn-info');
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
                },
            });

            if (ABORT == true) {

                xhr.abort()

            }

        }

    } else {
        $(".btn.btn-success").prop('disabled', false);
        $("#toolTemp").html("-");
        $("#bedTemp").html("-");
        $("#info").html(" progreso: <b>" + "-" + "</b><br>" +
            "<br> Archivo: <b>" + "-" + "</b><br>" +
            "<br> Tiempo de impresion: <b>" + "-" + "</b><br>" +
            "<br> Tiempo restante: <b>" + "-" + "</b><br>" +
            "<br> hora final aprox: <b>" + "-" + "</b><br>");
        $('#input_tool').attr('placeholder', "off");
        $('#input_bed').attr('placeholder', "off");


    }
}, 2500);

function setBedtemp() {
    var temp = $('#inputBed').val()
    if (username != LIMITED_USER) {
        if (temp != "") {
            $.ajax({
                type: 'GET',
                url: '/printer/' + id + '/setBedTemp/' + temp,
                success: function (json) {

                    toastr.success('Temperatura fijada', 'WoW');
                    $("#inputBed").attr('placeholder', temp);
                },
            });
        } else {
            toastr.error('Temperatura no definida', 'Error');
        }
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
    var temp = $('#inputTool').val()
    if (username != LIMITED_USER) {
        if (temp != "") {
            $.ajax({
                type: 'GET',
                url: '/printer/' + id + '/setToolTemp/' + temp,
                success: function (json) {

                    toastr.success('Temperatura fijada', 'WoW');
                    $("#inputTool").attr('placeholder', temp);
                },
            });
        } else {
            toastr.error('Temperatura no definida', 'Error');
        }
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

function toggle() {
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

function homePrinter(axes) {
    if (username != LIMITED_USER) {
        $.ajax({
            url: '/printer/' + id + '/homePrinter/' + axes,
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
                toastr.success("Archivo eliminado", 'WoW');
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

    getLocal(obj) { // get all files and folders of an folder (obj) in local
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
                //console.log(a[i])
                filesLinks.push(a[i].refs.download.concat(apikey))
            }
        }
        return [carpets, carpetsPaths, files, filesPath, filesLinks];
    }



    recu(objFolder, path) {
        var tmp;
        for (var i = 0; i < objFolder.children.length; i++) {
            if (objFolder.children[i].type == "folder") {
                if (objFolder.children[i].path == path) {
                    return this.getLocal(objFolder.children[i]); // search content if folder is in 1rt call
                } else {
                    tmp = this.recu(objFolder.children[i], path); //search recursive (sub/sub/foler)
                    if (tmp != true) {
                        return tmp
                    }
                }
            }
        }
        return true
    }

    getFolder(path) { //return content of a concret folder
        var ret;
        for (var i = 0; i < this.files.length; i++) {

            if (this.files[i].type == "folder") {
                if (this.files[i].path == path) {
                    return this.getLocal(this.files[i]) // search content if folder is in local                    
                } else {

                    ret = this.recu(this.files[i], path); //search folder inside other folder                   
                    if (ret != true) {
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

    getAllFolders(obj) {
        var folders = []
        var a
        if (obj == this) {
            a = obj.files;
        } else {
            a = obj.children;
        }
        for (var i = 0; i < a.length; i++) {
            if (a[i].type == "folder") {
                if (a[i].children != null && a[i].children.length != 0) {
                    folders.push(a[i].path)
                    folders = folders.concat(this.getAllFolders(a[i]))
                } else {
                    folders.push(a[i].path)
                }
            }
        }
        return folders
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

            allFolders = FileSystem.getAllFolders(FileSystem)

            if (folderId == "local") {
                data = FileSystem.getLocal(FileSystem);
                let folders = data[0];
                let foldersPath = data[1];
                let files = data[2];
                let filesPath = data[3];
                let filesLink = data[4];

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
                        "<td align='center'><button  type='button' class='btn btn-info margin-5' data-toggle='modal' data-target='#moveFile' id='" + filesPath[i] + " 'onClick='showCarpetsInMove(this.id)'>Mover</button></td>" +
                        "<td  align='center'><button id='" + filesPath[i] + " 'onClick='deleteFile(this.id)' class='btn btn-danger'>eliminar</button></td>" +
                        "<td  align='center'><button id='" + filesLink[i] + " 'onClick='download(this.id)' class='btn btn-info'>descargar</button></td>" +
                        "</tr>"
                }

            } else {

                var data = FileSystem.getFolder(folderId.slice(0, -1));

                var backPath = FileSystem.getBackPath(folderId.slice(0, -1));

                let folders = data[0];

                let foldersPath = data[1];

                let files = data[2];

                let filesPath = data[3];

                let filesLink = data[4];

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
                        "<td align='center'><button type='button' class='btn btn-info margin-5' data-toggle='modal' data-target='#moveFile' id='" + filesPath[i] + " 'onClick='showCarpetsInMove(this.id)'>Mover</button></td>" +
                        "<td  align='center'><button id='" + filesPath[i] + " 'onClick='deleteFile(this.id)' class='btn btn-danger'>eliminar</button></td>" +
                        "<td  align='center'><button id='" + filesLink[i] + " 'onClick='download(this.id)' class='btn btn-info'>descargar</button></td>" +
                        "</tr>"
                }


            }

            $("#zero_config").html("<thead>" +
                "<tr>" +
                "<th style='vertical-align: middle; text-align: center;'>Nombre</th>" +
                "<th style='vertical-align: middle; text-align: center;'>Imprimir</th>" +
                "<th style='vertical-align: middle; text-align: center;'>Mover</th>" +
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
    $("#nameOfDeleteElement").html("Seguro que quieres eliminar la carpeta ");
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

function jog(x, y, z) {
    if (username != LIMITED_USER) {
        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/jog/' + x + '/' + y + '/' + z,
            success: function (data) {
                //toastr.success('Moving 5mm', 'WoW');  

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
        setBedtemp();
    }
}

function showLoading() {
    $("#waitUpload").attr('style', "display: flex; justify-content: center; align-content: center;")
}


function showCarpetsInMove(fileName) {
    let substrings = fileName.split('/');
    var name = (substrings[substrings.length - 1])

    $("#newFileName").attr('class', fileName)
    $("#newFileName").attr('value', name)
    $("#newPath").empty();
    select = document.getElementById('newPath');
    var opt = document.createElement('option');
    opt.value = "/";
    opt.innerHTML = "/";
    select.appendChild(opt);
    for (var i = 0; i < allFolders.length; i++) {
        var opt = document.createElement('option');
        opt.value = allFolders[i];
        opt.innerHTML = allFolders[i];
        select.appendChild(opt);
    }
}

function moveFile() {
    newPath = document.getElementById('newPath').value;
    newName = document.getElementById('newFileName').value;
    if (!newName.includes(".gcode")) {
        newName = newName + ".gcode"
    }
    actualFile = $("#newFileName").attr('class')
    actualFile = actualFile.slice(0, -1)
    newFile = newPath + "/" + newName

    if (username != LIMITED_USER) {
        actualFile = actualFile.replaceAll("/", "@");
        newFile = newFile.replaceAll("/", "@");

        $.ajax({
            type: 'GET',
            url: '/printer/' + id + '/moveFile/' + actualFile + '/' + newFile,
            success: function (data) {
                if (data != null) {
                    toastr.error(data, 'ooh');

                } else {
                    toastr.success('Archivo movido', 'WoW');
                }

            },
        });
    } else {
        toastr.error('No tienes permisos', 'Error');
    }


}


const input = document.getElementById('input')
const csrf = document.getElementsByName('csrfmiddlewaretoken')


input.addEventListener('change', () => {
    $("#submitFile").attr('style', '');
    $('#uploadForm').append("<div class='progress m-t-15'><div id='uploadProgress' class='progress-bar progress-bar-striped progress-bar-animated bg-success' style='width:0%;'></div></div>");
    const fd = new FormData()
    const data = input.files[0]
    const bar = document.getElementById('uploadProgress')

    fd.append('csrfmiddlewaretoken', csrf[0].value)
    fd.append('file', data)
    if (data.name.includes(".gcode")) {
        $.ajax({
            type: 'POST',
            enctype: 'multipart/form-data',
            data: input.files[0],
            xhr: function () {
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', e => {

                    if (e.lengthComputable) {
                        const percent = e.loaded / e.total * 100

                        bar.style["width"] = percent + "%"
                        //$("uploadProgress").attr('style', 'width:' + percent + '%');
                    }
                })
                return xhr
            },
            success: function (response) {


            },
            error: function (error) {

            },
            cache: false,
            contentType: false,
            processData: false,
        })
    } else {
        toastr.error("Archivo no valido para subir", 'WoW');
    }
}

)

$(document).ready(function () {
    var $inputs = $('.resizing-input');

    // Resize based on text if text.length > 0
    // Otherwise resize based on the placeholder
    function resizeForText(text) {
        var $this = $(this);
        if (!text.trim()) {
            text = $this.attr('placeholder').trim();
        }
        var $span = $this.parent().find('span');
        $span.text(text);
        var $inputSize = $span.width();
        $this.css("width", $inputSize);
    }

    $inputs.find('input').keypress(function (e) {
        if (e.which && e.charCode) {
            var c = String.fromCharCode(e.keyCode | e.charCode);
            var $this = $(this);
            resizeForText.call($this, $this.val() + c);
        }
    });

    // Backspace event only fires for keyup
    $inputs.find('input').keyup(function (e) {
        if (e.keyCode === 8 || e.keyCode === 46) {
            resizeForText.call($(this), $(this).val());
        }
    });

    $inputs.find('input').each(function () {
        var $this = $(this);
        resizeForText.call($this, $this.val())
    });
});