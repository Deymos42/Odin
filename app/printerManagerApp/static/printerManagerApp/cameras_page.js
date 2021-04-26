printerPowerStatus = null;
ledPowerStatus = null;

function changeButtonStatus(printerId){

     $.ajax({
        url: "/printer/" + printerId + "/getLedStatus",
        type: "GET",
            
        success: function (data) {
            ledPowerStatus = data;
            if (ledPowerStatus) {
                
                $('#' + printerId).attr('name', "false");
                $('#' + printerId).html("Apagar luz");
                $('#' + printerId).attr('class', 'btn btn-danger');

            } else {
               
                $('#' + printerId).attr('name', 'true');
                $('#' + printerId).html("Encender luz");
                $('#' + printerId).attr('class', 'btn btn-success');
            }

        }
    });

}

function init(printerId) {
    //alert(printerId);


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


    $.ajax({
        url: '/printer/' + id + '/toggleLed',
        type: "GET",
        success: function (data) {
           changeButtonStatus(id);
        }
    });



}
