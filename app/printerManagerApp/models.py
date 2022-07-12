from django.db import models
from octorest import OctoRest
import requests
import ast
import json
import queue
from threading import Thread
# Create your models here.


CATEGORYS = [ ('---', '---------'),
    ('music', 'music '),
    ('science', 'science '),
    ('social science', 'social science '),
    ('math', 'math '),
    ('tecnology', 'tecnology '),
    ('physics', 'physics '),
    ('chemistry', 'chemistry '),
     ('Crafts', 'Crafts '),
     ('Art history', 'Art history '),
]



class Project(models.Model):
    category = models.CharField(
        max_length = 20,
        choices = CATEGORYS,
        default = '1'
        )
    name = models.CharField(max_length=120)
    description = models.TextField()
    uniqueId = models.IntegerField()

    def getId(self):
        return self.uniqueId

    def getName(self):
        return self.name

    def getDescription(self):
        return self.description   

    
    def getCategory(self):
        if self.category == "music":
	        return "Música"

        elif self.category == "science":
	        return "Ciencias naturales"

        elif self.category == "social science":
	        return "Ciencias sociales"

        elif self.category == "math":
            return "Matemáticas"

        elif self.category == "tecnology":
            return "Tecnologia"

        elif self.category == "physics":
            return "Física"

        elif self.category == "chemistry":
            return "Química"

        elif self.category == "Crafts":
            return "Visual y plástica"

        elif self.category == "Art history":
            return "Historia del arte"          
        else:
            return "failed"

    def __str__(self):
        return self.name 

class Images(models.Model):
    img = models.ImageField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.img) 
   


class Printer(models.Model):
    url = models.CharField(max_length=120)
    apikey = models.CharField(max_length=120)
    name = models.CharField(max_length=120)
    IDa = models.CharField(max_length=120)
   
    urlCam = models.CharField(max_length=120)

    client = None

    

    def connect(self):
        #print("conect")
        try:
            self.client = OctoRest(url=self.url, apikey=self.apikey)
        except ConnectionError as ex:
            print("..............Connect_error.....................")
            print(ex)


    def waitConnectionThread(self, queue):
        counter = 0
        if(self.getPrinterPowerStatus() == "printer_power_status_off"): 
            queue.put(False)          
            return False
        else:            
            self.connect()                       
            while(self.client.connection_info()["current"]["state"] != "Operational" and counter < 40):
                self.client.connect(baudrate=115200)
                counter = counter + 1
                #print("conecting..." + self.client.connection_info()["current"]["state"]  + str(counter))
            if counter >= 40:
                queue.put(False) 
                return False
            else:
                queue.put(True) 
                return True

    def waitConnection(self):
        q = queue.Queue()
        new_thread = Thread(target=self.waitConnectionThread, args=[q])
        new_thread.start()
        new_thread.join()        
        return q.get()

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
        try:
            if self.client.tool() == {}:
                return {'actual': 0, 'offset': 0, 'target': 0.0}
            else:
                return self.client.tool()["tool0"] 
        except:
            return None

    def setBedTemp(self, t):
        if self.client == None:
            self.connect()
        return self.client.bed_target(t)
    
    def getBedTemp(self):
        if self.client == None:
            self.connect()
        try:
            if self.client.bed() == {}:
                return {'actual': 0, 'offset': 0, 'target': 0.0}
            else:
                return self.client.bed()["bed"] 
        except:
            return None

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
           print("TSDERROR TIMEOPUT")
           return "TSDerror"
        else:
                   
            csrftoken = client.cookies['csrftoken']       
            post_data = { "csrfmiddlewaretoken": csrftoken, 'login': self.TSDuser, 'password': self.TSDpass}
            headers = {'Referer': URL}
            response = client.post(URL, data=post_data, headers=headers)          
            a = client.get( self.TSDurl + "api/v1/printers/" + self.TSDid )
            client = None        
            data = json.loads(a.text)     
            try:   
                return data["normalized_p"]
            except:
                return "TSDERROR"
            
        
        

    def getAllFilesAndFolders(self):
       
        r = requests.get(self.url + "api/files?apikey=" + self.apikey + "&recursive=true")   
        print(self.url + "api/files?apikey=" + self.apikey + "&recursive=true")
        return r.text

    def getStatus(self):
        #r = requests.get(self.url[:-1]+":7125/server/info")      
        return None

    def selectFile(self, filePath):

        path = "local/" + filePath.replace("@","/")                   
        path = "local/" + filePath.replace("*","/")   
                       
        if(self.client == None):
            self.connect()
        path = path.replace("@","/")
        #path = path.replace(" ","_")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" + path) 
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
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")               
        print(self.url + "api/files/local" + "?apikey=" + self.apikey + str(dataFile) + str(dataForm))
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

    def moveFile(self, name, path):
        name = name.replace("@","/")  
        path = path.replace("@","/")     
        if(self.client == None):
            self.connect()       
            return self.client.move(name, path)        
        return self.client.move(name, path)  
       
      

   
     