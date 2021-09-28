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

        if counter >= 30:
            print("conection error")
            return False
        else:
            return True




def main():

   """
    #p2.waitConnection()
    TSDurl = "http://10.42.0.1:3334/"
    TSDuser = "root@example.com"
    TSDpass = "0203comosiempre"
    URL = TSDurl + "accounts/login/" 

    print(URL)

    client = requests.session()
    errorTSD = False
    try:
        client.get(URL, timeout=3)  # sets cookie      
    except:
        errorTSD = True
        print("error")
        
    if(errorTSD):
        return "TSDerror"
    else:
        csrftoken = client.cookies['csrftoken']       
        post_data = { "csrfmiddlewaretoken": csrftoken, 'login': TSDuser, 'password': TSDpass}
        print(post_data)
        headers = {'Referer': URL}
        response = client.post(URL, data=post_data, headers=headers)          
        
        a = client.get( TSDurl + "api/v1/printers/1" )
        client = None        
        data = json.loads(a.text)     
        print(data)
  



    
    URL = "http://127.0.0.1:8000/api-auth/"
        
    client = requests.session()
    client.get(URL)  # sets cookie
    
    if 'csrftoken' in client.cookies:
        # Django 1.6 and up
        csrftoken = client.cookies['csrftoken']
    else:
        # older versions
        csrftoken = client.cookies['csrf']
    
    post_data = { "csrfmiddlewaretoken": csrftoken, 'login': "admin", 'password': "admin"}
    headers = {'Referer': URL}
    response = client.post(URL, data=post_data, headers=headers)        
    print("----------------------------")
    print(response.text)

    a = client.get( "http://localhost:3334/api/v1/printers/3" )

    print("----------------------------")
    print(a.text)

    client = None        
    data = json.loads(a.text)        

    p2 = Printer("http://10.1.0.2/", "E2505FCA32E54529B35624B9E8CA60D8")

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
    """



print("Before URL")
#cap = cv2.VideoCapture('http://192.168.1.150/webcam/?action=stream')
print("After URL")
cap = cv2.VideoCapture('filesrc location=http://192.168.1.150/webcam/?action=stream ! qtdemux ! h264parse ! nvv4l2decoder ! nvvidconv ! video/x-raw,format=BGRx ! videoconvert ! queue ! video/x-raw, format=BGR ! appsink', cv2.CAP_GSTREAMER)
cap = cv2.VideoCapture(f'v4l2src http://192.168.1.150/webcam/?action=stream ! image/jpeg, width=(int)3840, height=(int)2160 !  nvjpegdec ! video/x-raw, format=I420 ! appsink', cv2.CAP_GSTREAMER)
cap = cv2.VideoCapture('httpsrc location=http://192.168.1.150/webcam/?action=stream latency=500 ! application/x-rtp, media=video, encoding-name=H264 ! rtph264depay ! h264parse ! omxh264dec ! nvvidconv ! video/x-raw, format=BGRx ! videoconvert ! video/x-raw, format=BGR ! appsink', cv2.CAP_GSTREAMER)

while True:

    #print('About to start the Read command')
    ret, frame = cap.read()
    #print('About to show frame of Video.')
    cv2.imshow("Capturing",frame)
    #print('Running..')
    print(frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
    



if __name__ == "__main__":
    main()