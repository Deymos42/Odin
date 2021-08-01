printerPowerStatus = null;
ledPowerStatus = null;
username = "";
LIMITED_USER = "alumnes";

function changeButtonStatus(printerId){

     $.ajax({
        url: "/printer/" + printerId + "/getLedStatus",
        type: "GET",
            
        success: function (data) {
            ledPowerStatus = data;
            if (ledPowerStatus) {
                
                $('#' + printerId).attr('name', "false");
                $('#bulb' + printerId).attr('class', 'fas fa-lightbulb');
                $('#' + printerId).attr('class', 'btn btn-danger');

            } else {
               
                $('#' + printerId).attr('name', 'true');
                $('#bulb' + printerId).attr('class', 'far fa-lightbulb');
                $('#' + printerId).attr('class', 'btn btn-success');
            }

        }
    });

}

function init(printerId, Username) {   
    username = Username;
    $.ajax({
        url: "/printer/" + printerId + "/getPrinterPowerStatus",
        type: "GET",
        success: function (data) {
            //alert(data);           
            printerPowerStatus = data; // printer_power_status_on
        }
    });


   changeButtonStatus(printerId);

}

function ledOnOff(id) {
    if (username != LIMITED_USER) {

    $.ajax({
        url: '/printer/' + id + '/toggleLed',
        type: "GET",
        success: function (data) {
           changeButtonStatus(id);
        }
    });
    }else {
         toastr.error('No tienes permisos', 'Error');
    }



}
