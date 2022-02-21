from octorest import OctoRest
import requests
import ast
import json
import cv2

class Printer:

    def __init__(self, url, apikey):
        try:
            self.client = OctoRest(url=url, apikey=apikey)
        except ConnectionError as ex:
            # Handle exception as you wish
            print(ex)



    def get_printer_info(self):
        try:
            message = ""
            message += str(self.client.version) + "\n"
            message += str(self.client.job_info()) + "\n"
            printing = self.client.printer()['state']['flags']['printing']
            if printing:
                message += "Currently printing!\n"
            else:
                message += "Not currently printing...\n"
            return message
        except Exception as e:
            print(e)

    def home(self):

        self.client.connect()
        self.client.home()

    def setExtruderTemp(self, how):

        self.client.tool_target(how)


    def getExtruderTemp(self):

        dic = self.client.tool()
    
        print(self.client.tool()["tool0"])

    def test(self):
        print(self.client.files_info(location="/"))

    def restartKlipper(self):
        r = requests.post("http://192.168.0.103:7125/machine/services/restart?service=klipper")
        return r.text

    def stuff(self):
        
        #r = requests.post('http://192.168.0.103:7125/machine/device_power/on?printer')
   

        print(self.client.select("local/Test_3_big.gcode"))


    def waitConnection(self):
        counter = 0
        self.client.connect(baudrate = 250000)
        while(self.client.connection_info()["current"]["state"] != "Paused" and counter < 30):
            counter = counter + 1
            print("conecting..." + self.client.connection_info()["current"]["state"]  + str(counter))
        self.client.users
        if counter >= 30:
            print("conection error")
            return False
        else:
            return True

    def disableMotors(self):
        self.client.system_commands
        return True



def main():



    p = Printer("http://10.42.2.13/", "BAAFA611889B4AB1AD64AE5AD675229E")

    p.waitConnection()
    
    enable: isOperational() && !isPrinting(), click: function() { $root.sendCustomCommand({type:'command',command:'M18'}) }


    


if __name__ == "__main__":
    main()