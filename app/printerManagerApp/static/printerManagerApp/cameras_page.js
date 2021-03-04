printerPowerStatus = null;
ledPowerStatus = null;


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

    $.ajax({
        url: "/printer/" + printerId + "/getLedPowerStatus",
        type: "GET",
        success: function (data) {

            ledPowerStatus = data;
            if (ledPowerStatus == "led_status_on") {
                $('#' + printerId).attr('name', "led_status_off");
                $('#' + printerId).html("Apagar luz");
                $('#' + printerId).attr('class', 'btn btn-danger');

            } else if (ledPowerStatus == "led_status_off") {
                $('#' + printerId).attr('name', 'led_status_on');
                $('#' + printerId).html("Encender luz");
                $('#' + printerId).attr('class', 'btn btn-success');
            }

        }
    });

}

function ledOnOff(id) {

    if (ledPowerStatus == "led_status_on") {
        $.ajax({
            url: '/printer/' + id + '/ledOff',
            type: "GET",
            success: function (data) {
                ledPowerStatus = "led_status_off"
                $('#' + id).attr('name', 'led_status_on');
                $('#' + id).html("Encender luz");
                $('#' + id).attr('class', 'btn btn-success');
            }
        });

    } else if (ledPowerStatus == "led_status_off") {
        $.ajax({
            url: '/printer/' + id + '/ledOn',
            type: "GET",
            success: function (data) {                
                ledPowerStatus = "led_status_on"
                $('#' + id).attr('name', "led_status_off");
                $('#' + id).html("Apagar luz");
                $('#' + id).attr('class', 'btn btn-danger');
            }
        });

    }
}