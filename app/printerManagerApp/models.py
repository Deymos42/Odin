from django.db import models
from octorest import OctoRest
import requests
import ast
import json
# Create your models here.



class Document(models.Model):
    description = models.CharField(max_length=255, blank=True)
    document = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class TSD_url(models.Model):
    url = models.CharField(max_length=120)
    #azumbawe = models.CharField(max_length=120)
    username = models.CharField(max_length=120)
    password = models.CharField(max_length=120)

class Printer(models.Model):
    url = models.CharField(max_length=120)
    apikey = models.CharField(max_length=120)
    name = models.CharField(max_length=120)
    IDa = models.CharField(max_length=120)
    urlCam = models.CharField(max_length=120)

    client = None

    try:
        TSDurl = TSD_url.objects.get().url
        TSDuser = TSD_url.objects.get().username 
        TSDpass = TSD_url.objects.get().password
    except:
       TSDurl = None  
       TSDuser = None
       TSDpass = None
    

    def connect(self):
        #print("conect")
        try:
            self.client = OctoRest(url=self.url, apikey=self.apikey)
        except ConnectionError as ex:
            print("..............Connect error.....................")
            print(ex)

    def restartKlipper(self):
         r = requests.post(self.url[:-1]+":7125/machine/services/restart?service=klipper")
         return r.text

    def restartFirmware(self):
         print(self.url[:-1]+":7125/printer/firmware_restart")
         r = requests.post(self.url[:-1]+":7125/printer/firmware_restart")
         print("Firware restarted")
         return r.text

    def waitConnection(self):
        counter = 0
        if(self.getPrinterPowerStatus() == "printer_power_status_off"):
            print("printer Off")
            return False
        else:            
            self.connect()            
            self.client.connect(baudrate = 250000)
            while(self.client.connection_info()["current"]["state"] != "Operational" and counter < 30):
                counter = counter + 1
                print("conecting..." + self.client.connection_info()["current"]["state"]  + str(counter))
            if counter >= 30:
                return False
            else:
                return True


    def home(self):
        if self.client == None:
            self.connect()
        return self.client.home()

    def extrude(self):
        if self.client == None:
            self.connect()
        return self.client.extrude(25)

    def retract(self):
        if self.client == None:
            self.connect()
        return self.client.extrude(-25)

    def setToolTemp(self, t):
        if self.client == None:
            self.connect()
        return self.client.tool_target(t)
    
    def getToolTemp(self):
        if self.client == None:
            self.connect()
        if self.client.tool() == {}:
            return {'actual': 0, 'offset': 0, 'target': 0.0}
        else:
            return self.client.tool()["tool0"] 

    def setBedTemp(self, t):
        if self.client == None:
            self.connect()
        return self.client.bed_target(t)
    
    def getBedTemp(self):
        if self.client == None:
            self.connect()
        if self.client.bed() == {}:
            return {'actual': 0, 'offset': 0, 'target': 0.0}
        else:
            return self.client.bed()["bed"] 

    def getName(self):
        return self.name
    
    def getId(self):
        return self.IDa
        
    def getUrl(self):
        return self.url

    def getLedStatus(self):
        r = requests.get(self.url[:-1]+":7125/machine/device_power/status?printer_led")
        dic = json.loads(r.text)
        #print("led_status_" + dic["result"]["printer_led"])
        return "led_status_" + dic["result"]["printer_led"]

    def powerLedOn(self):
       
        x = requests.post(self.url[:-1]+":7125/machine/device_power/on?printer_led")
        #print(x.content)
        return x
       
        
    def powerLedOff(self):
        
        x = requests.post(self.url[:-1]+":7125/machine/device_power/off?printer_led")
        print(x.content)
        return x

    def getPrinterPowerStatus(self):
        r = requests.get(self.url[:-1]+":7125/machine/device_power/status?printer")
        dic = json.loads(r.text)
        
        return "printer_power_status_" + dic["result"]["printer"]

    def PrinterPowerOn(self):        
        myobj = {'command': "turnPSUOn"}
        url = self.url + "api/plugin/psucontrol?apikey=" + self.apikey 
        x = requests.post(url, json=myobj)
        return x
       
        
    def printerPowerOFf(self):
        myobj = {'command': "turnPSUOff"}
        url = self.url + "api/plugin/psucontrol?apikey=" + self.apikey 
        x = requests.post(url, json=myobj)
        return x
        

    def get_printer_info(self):
        if self.client == None:
            self.connect()
        try:             
            info = self.client.job_info();       
            #print(info)
            return info
        except Exception as e:
            print(e)

    def getError(self):
        URL = self.TSDurl + "accounts/login/"
        
        client = requests.session()
        client.get(URL)  # sets cookie
        
        if 'csrftoken' in client.cookies:
            # Django 1.6 and up
            csrftoken = client.cookies['csrftoken']
        else:
            # older versions
            csrftoken = client.cookies['csrf']
        
        post_data = { "csrfmiddlewaretoken": csrftoken, 'login': self.TSDuser, 'password': self.TSDpass}
        headers = {'Referer': URL}
        response = client.post(URL, data=post_data, headers=headers)        
        
        a = client.get( self.TSDurl + "api/v1/printers/" + self.IDa )
        client = None        
        data = json.loads(a.text)        
        return data["normalized_p"]
        

    def getAllFilesAndFolders(self):
       
        r = requests.get(self.url + "api/files?apikey=" + self.apikey + "&recursive=true")          
        return r.text

    def getKlipperStatus(self):
        r = requests.get(self.url[:-1]+":7125/server/info")      
        return r.text

    def selectFile(self, filePath):
        path = "local/" + filePath.replace("@","/")                   
        if(self.client == None):
            self.connect()
        r = self.client.select(path)       
        return "done"

    def deleteFile(self, filePath):
        path = "local/" + filePath.replace("@","/")           
        
        if(self.client == None):
            self.connect()
        r = requests.delete(self.url + "api/files/" + path + "?apikey=" + self.apikey )          
        return r.text

    def createFolder(self, folderPath):          
        if(self.client == None):
            self.connect()            
        path = folderPath.replace("@","/")         
        data = {'foldername': path}
        r = requests.post(self.url + "api/files/local" + "?apikey=" + self.apikey, data = data)    
        return r

    def uploadFile(self, filePath, myfile):  
        if(self.client == None):
            self.connect() 
        path = filePath.replace("@","/")    
        if(path != "local"):      
            dataForm = {'path': path}
        else:
            dataForm = {'path': ""}        
        dataFile = {'file': myfile}               
        
        r = requests.post(self.url + "api/files/local" + "?apikey=" + self.apikey, data = dataForm, files = dataFile)            
        
        return r

    def printSelectedFile(self):       
        
        if(self.client == None):
            self.connect()       
        r = self.client.start()
    
        return r
       
    def print(self, filePath):          
        if(self.client == None):
            self.connect()
        self.selectFile(filePath)
        r = self.client.start()
    
        return r
        
    def toggle(self):          
        if(self.client == None):
            self.connect()       
        r = self.client.toggle()
    
        return r

    def cancel(self):          
        if(self.client == None):
            self.connect()       
        r = self.client.cancel()
    
        return r
   