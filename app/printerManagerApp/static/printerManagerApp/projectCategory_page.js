var container = document.getElementsByClassName("modal fade");
var content = container.innerHTML;
container.innerHTML = content;
let imagesFiltered = []
let concretProjectImages = []

for (var i = 0; i < images.length; i++) {
    imagesFiltered.push([images[i], ProjectIdImgaes[i]])
}


for (var i = 0; i < printersStatus.length; i++) {
    console.log(printersStatus[i])
}


let tmpImg = []

for (var i = 0; i < projects.length; i++) {
    tmpImg = []
    for (var j = 0; j < imagesFiltered.length; j++) {
        if (imagesFiltered[j][1] == projects[i]) {
            tmpImg.push(imagesFiltered[j][0])
        }
    }
    for (var k = 0; k < tmpImg.length; k++) {
        document.getElementById("P" + projects[i] + "img" + k).src = "/media/" + tmpImg[k]
    }
}

function printProject(id, path) {
    console.log("printing:")
    console.log(id)
    console.log(path)
    $.ajax({
        type: 'GET',
        url: '/printer/' + id + '/printProject/' + path,
        success: function (json) {
            if (json == "succes") {
                window.location.replace("http://10.42.1.10:8080/printer/" + id);
            }
        },
    });
}


$('#impresoras').append("<thead> <tr><td><b>Impresora:</b></td><td><b>Estado:</b></td><td><b>Imprimir:</b></td></tr></thead>");
var j = 1;
for (var i = 0; i < printers.length; i++) {

    $('#impresoras').append("<tr><td>" + printers[i] + "</td><td>" + printersStatus[i] + "</td>" + "<td>" + "<button style='margin-left: 2%;' id = 'print" + j + "' class='btn btn-success'>  <i class='mdi mdi-printer'></i> </button> " + "</td></tr>");
    $('#print' + j).attr('onclick', 'printProject(' + j + ',"'+ path +'")');
    if (printersStatus[i] == "Printing"){
        $('#print' + j).prop('disabled', true);
    }
   j = j +1
}

