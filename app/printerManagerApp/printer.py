from octorest import OctoRest
import requests
import ast
import json

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
        while(self.client.connection_info()["current"]["state"] != "Operational" and counter < 30):
            counter = counter + 1
            print("conecting..." + self.client.connection_info()["current"]["state"]  + str(counter))

        if counter >= 30:
            print("conection error")
            return False
        else:
            return True




def main():

 
    p = Printer("http://10.42.0.165/", "C0C0179A39DE472B9E692E3DF2F6025A")
    counter = 0
    print(p.client.connect(baudrate=115200))
    print(p.client.connection_info()["current"]["state"])
    while(p.client.connection_info()["current"]["state"] != "Operational" and counter < 30):
                counter = counter + 1
                print("conecting..." + p.client.connection_info()["current"]["state"]  + str(counter))

    #p2 = Printer("http://10.1.0.2/", "E2505FCA32E54529B35624B9E8CA60D8")

    #r =requests.post('http://192.168.0.103:7125/machine/services/restart?service=klipper')

    

    #myobj = { 'command': 'getPSUState'}

    #url = "http://192.168.0.103/api/plugin/psucontrol?apikey=5EB85BE5D98A481DA12B37A63DB08F87"

    #x = requests.post(url, json=myobj)
    #print(x.text)
    #dic = json.loads(x.text)
    #print(dic['isPSUOn'])
    #url = 'http://192.168.0.103/api/files?apikey=749307BF21154B18BBFD75260CFD356Frecursive=true'

    #r = requests.get(url)
    #p.stuff()   led_status_on




if __name__ == "__main__":
    main()