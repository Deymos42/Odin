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
    username = models.CharField(max_length=120)
    password = models.CharField(max_length=120)

class Printer(models.Model):
    url = models.CharField(max_length=120)
    apikey = models.CharField(max_length=120)
    name = models.CharField(max_length=120)
    IDa = models.CharField(max_length=120)
    urlCam = models.CharField(max_length=120)
    TSDid  = models.CharField(max_length=120)

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


    def waitConnection(self):
        counter = 0
        if(self.getPrinterPowerStatus() == "printer_power_status_off"):           
            return False
        else:            
            self.connect()                       
            while(self.client.connection_info()["current"]["state"] != "Operational" and counter < 30):
                self.client.connect(baudrate=115200)
                counter = counter + 1
                print("conecting..." + self.client.connection_info()["current"]["state"]  + str(counter))
            if counter >= 30:
                return False
            else:
                return True


    def home(self, axes):
        if self.client == None:
            self.connect()
        return self.client.home(axes)

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
    
    def getApiKey(self):
        return self.apikey

    def getUrlCam(self):
        return self.urlCam
  
        
    def toggleLed(self):
        myobj = {'pin': 'r1', 'command': 'update'}
        url = self.url + "api/plugin/octorelay?apikey=" + self.apikey 
        return requests.post(url, json=myobj)
    

    def getLedStatus(self):
        myobj = {'pin': 'r1', 'command': 'getStatus'}
        url = self.url + "api/plugin/octorelay?apikey=" + self.apikey 
        x = requests.post(url, json=myobj)
        dic = json.loads(x.text)
        return dic['status']

    def getPrinterPowerStatus(self):
        myobj = {'command': 'getPSUState'}
        url = self.url + "api/plugin/psucontrol?apikey=" + self.apikey 
        x = requests.post(url, json=myobj)     
        
        dic = json.loads(x.text)
        print(dic)
        if dic['isPSUOn'] == False:
           return "printer_power_status_off"
        elif dic['isPSUOn'] == True:
           return "printer_power_status_on"
   

    def PrinterPowerOn(self):        
        myobj = {'command': "turnPSUOn"}
        url = self.url + "api/plugin/psucontrol?apikey=" + self.apikey 
        return requests.post(url, json=myobj)
      
        
    def printerPowerOFf(self):
        myobj = {'command': "turnPSUOff"}
        url = self.url + "api/plugin/psucontrol?apikey=" + self.apikey 
        return requests.post(url, json=myobj)
        
        

    def getPrinterInfo(self):
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
        errorTSD = False
        try:
            client.get(URL, timeout=3)  # sets cookie      
        except:
            errorTSD = True
            
        if(errorTSD):
           return "TSDerror"
        else:
            csrftoken = client.cookies['csrftoken']       
            post_data = { "csrfmiddlewaretoken": csrftoken, 'login': self.TSDuser, 'password': self.TSDpass}
            headers = {'Referer': URL}
            response = client.post(URL, data=post_data, headers=headers)          
           
            a = client.get( self.TSDurl + "api/v1/printers/" + self.TSDid )
            client = None        
            data = json.loads(a.text)        
            return data["normalized_p"]
        
        

    def getAllFilesAndFolders(self):
       
        r = requests.get(self.url + "api/files?apikey=" + self.apikey + "&recursive=true")          
        return r.text

    def getStatus(self):
        #r = requests.get(self.url[:-1]+":7125/server/info")      
        return None

    def selectFile(self, filePath):
        path = "local/" + filePath.replace("@","/")                   
        if(self.client == None):
            self.connect()
        self.client.select(path)       
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
        return requests.post(self.url + "api/files/local" + "?apikey=" + self.apikey, data = data)    
        

    def uploadFile(self, filePath, myfile):  
        if(self.client == None):
            self.connect() 
        path = filePath.replace("@","/")    
        if(path != "local"):      
            dataForm = {'path': path}
        else:
            dataForm = {'path': ""}        
        dataFile = {'file': myfile}               
        
        return requests.post(self.url + "api/files/local" + "?apikey=" + self.apikey, data = dataForm, files = dataFile)            
        
         

    def printSelectedFile(self):       
        
        if(self.client == None):
            self.connect()       
        return  self.client.start()
    
        
       
    def print(self, filePath):          
        if(self.client == None):
            self.connect()
        self.selectFile(filePath)
        return self.client.start()
    
        
        
    def toggle(self):          
        if(self.client == None):
            self.connect()       
        return self.client.toggle()
    
        

    def cancel(self):          
        if(self.client == None):
            self.connect()       
        return self.client.cancel()
    
         
   
    def jog(self, x, y, z):
        if(self.client == None):
            self.connect()       
            self.client.jog(x, y, z)
        return "done"