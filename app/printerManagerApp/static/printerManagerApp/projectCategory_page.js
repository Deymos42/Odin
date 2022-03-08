var container = document.getElementsByClassName("modal fade");
var content = container.innerHTML;
container.innerHTML = content;
let imagesFiltered = []
let concretProjectImages = []

for (var i = 0; i < images.length; i++) {
    imagesFiltered.push([images[i], ProjectIdImgaes[i]])

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
       // console.log("P" + projects[i] + "img" + k)
        //console.log("/media/" + tmpImg[k])        
        document.getElementById("P" + projects[i] + "img" + k).src = "/media/" + tmpImg[k]
    }
}

function printProject(id, k ,path) {

   $("#waitUpload" + k).attr('style', "display: flex; justify-content: center; align-content: center;")
    $.ajax({
        type: 'GET',
        url: '/printer/' + id + '/printProject/' + path,
        success: function (json) {
            if (json == "succes") {
               // window.location.replace("http://10.42.1.10:8080/printer/" + id);
               window.location.href = '/printer/' + id;
            }
        },
    });
}
var totalFiles = 0
for (var f = 0; f < files.length; f++) {
    totalFiles = totalFiles + files[f]   
}

//console.log(totalFiles)

for (var k = 1; k < totalFiles + 1; k++) {
$('#impresoras' + k).append("<thead> <tr><td><b>Impresora:</b></td><td><b>Estado:</b></td><td><b>Imprimir:</b></td></tr></thead>");

var j = 1;
for (var i = 0; i < printers.length; i++) {  
    $('#impresoras' + k).append("<tr><td>" + printers[i] + "</td><td>" + printersStatus[i] + "</td>" + "<td>" + "<button style='margin-left: 2%;' id = 'print"+ k + j + "' class='btn btn-success'>  <i class='mdi mdi-printer'></i> </button> " + "</td></tr>");
    $('#print' + k + j).attr('onclick', 'printProject(' + j + ',' + k + ',"'  + path[k-1] + '")');
    if (printersStatus[i] == "Printing") {
        $('#print' + k + j).prop('disabled', true); 
    }
    j = j + 1
}
}
 $(window).bind("load", function () {
   $('#container').masonry()
  });


