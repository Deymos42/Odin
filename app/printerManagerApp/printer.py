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

 
    p = Printer("http://192.168.0.103/", "749307BF21154B18BBFD75260CFD356F")
    #p2 = Printer("http://10.1.0.2/", "E2505FCA32E54529B35624B9E8CA60D8")

    #r =requests.post('http://192.168.0.103:7125/machine/services/restart?service=klipper')

    

    #myobj = {'command': "turnPSUOff"}

    #url = "http://192.168.0.103/api/plugin/psucontrol?apikey=749307BF21154B18BBFD75260CFD356F"

    #x = requests.post(url, json=myobj)

    #url = 'http://192.168.0.103/api/files?apikey=749307BF21154B18BBFD75260CFD356Frecursive=true'

    #r = requests.get(url)
    #p.stuff()


    URL = 'http://localhost:3334/accounts/login/'
    client = requests.session()
    # Retrieve the CSRF token first
    client.get(URL)  # sets cookie
    print(client.cookies)
    if 'csrftoken' in client.cookies:
        # Django 1.6 and up
        csrftoken = client.cookies['csrftoken']
    else:
        # older versions
        csrftoken = client.cookies['csrf']

    login_data = dict(username="root@example.com", password="supersecret", csrfmiddlewaretoken=csrftoken)

    post_data = { "csrfmiddlewaretoken": csrftoken, 'login': "root@example.com", 'password': "supersecret"}
    headers = {'Referer': URL}
    response = client.post(URL, data=post_data, headers=headers)
    
    print("-------------------------------")
    print(response.text)
    print("-------------------------------")

    a = client.get("http://localhost:3334/api/v1/printers/1/")
 
    data = json.loads(a.text)
    print(type(data))
    print(data["normalized_p"])

if __name__ == "__main__":
    main()