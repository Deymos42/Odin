from django.shortcuts import render
from django.views import generic
from .models import Printer
from django.http import HttpResponse, Http404
from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

import json
import time

# Create your views here.


 # -----------------------------------------------------------------------PAGES---------------------------------------------------------------------------------

def index(request):
    allPrinters = Printer.objects.all()
    context = { 'my_printer_list': allPrinters } 
    return render(request, "printerManagerApp/index.html", context) 

def test(request):
    return render(request, "static/form-basic.html")

def printer(request, printer_pk):
     if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile']
        path = request.POST['filePath']
        printer_object = Printer.objects.get(IDa=printer_pk)
        printer_object.uploadFile(path, myfile)
    
     printer_object = Printer.objects.get(IDa=printer_pk)
     name = printer_object.getName()
     url = printer_object.getUrl()
     urlCam = printer_object.getUrlCam()
     ledStatus = printer_object.getLedStatus()     
     printerPowerStatus = printer_object.getPrinterPowerStatus()   
     apikey = printer_object.getApiKey()
     allPrinters = Printer.objects.all()
     context = {'PrinterName': name, 'id': printer_pk, 'url': url, 'urlCam': urlCam , 'ledStatus': ledStatus, 'apikey': apikey, 'printerPowerStatus':printerPowerStatus, 'my_printer_list': allPrinters } 
   
     return render(request, "printerManagerApp/printer.html",context)

def dashboard(request):   
     ID = list()
     name = list()
     url = list()
     ledStatus = list()
     printerPowerStatus = list()
     info = list()  
     allPrinters = Printer.objects.all()
     for printer in allPrinters:
        ID.append(printer.getId())
        name.append(printer.getName())
        url.append(printer.url)
        ledStatus.append(printer.getLedStatus())
        printerPowerStatus.append(printer.getPrinterPowerStatus())
        info.append(printer.get_printer_info)   
     
     context = {'PrinterName': name, 'id': ID, 'url': url, 'ledStatus': ledStatus, 'printerPowerStatus':printerPowerStatus, 'my_printer_list': allPrinters } 
 

     return render(request, "printerManagerApp/dashboard.html",context)

class allCamerasView(generic.ListView):
    model = Printer
    context_object_name = 'my_printer_list'
    queryset = Printer.objects.all()
    template_name = "printerManagerApp/cameras.html"
  

 # -----------------------------------------------------------------------Printer_ACTIONS---------------------------------------------------------------------------------

def action_to_do_printer(request, printer_pk, *args, **kwargs):
    printer_object = Printer.objects.get(ID=printer_pk)

    printer_object.get_printer_info()
    return HttpResponse(status=201)

def homePrinter(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        data = printer_object.home()             
        return HttpResponse(data, content_type = 'application/json')

def extrude(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        data = printer_object.extrude()             
        return HttpResponse(data, content_type = 'application/json')

def retract(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        data = printer_object.retract()             
        return HttpResponse(data, content_type = 'application/json')

def preheat(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)

        data = printer_object.setToolTemp(205)
        data = printer_object.setBedTemp(60)
        d = json.dumps(data)  
        return HttpResponse(d, content_type = 'application/json')

def setToolTemp(request, printer_pk, temp):
    if request.is_ajax():        
        printer_object = Printer.objects.get(IDa=printer_pk)  
        data = printer_object.setToolTemp(temp)       
        d = json.dumps(data)  
        return HttpResponse(d, content_type = 'application/json')

def getToolTemp(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
  
        info = printer_object.getToolTemp()
        data = json.dumps(info)
        return HttpResponse(data, content_type = 'application/json')

def setBedTemp(request, printer_pk, temp):
    if request.is_ajax():
       printer_object = Printer.objects.get(IDa=printer_pk)     
       data = printer_object.setBedTemp(temp)       
       d = json.dumps(data)  
       return HttpResponse(d, content_type = 'application/json')

def getBedTemp(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        #printer_object.connect()
        info = printer_object.getBedTemp()        
        data = json.dumps(info)
        return HttpResponse(data, content_type = 'application/json')

def getPrinterPowerStatus(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        response = printer_object.getPrinterPowerStatus()   
        return HttpResponse(response, content_type = 'text/html')

def toggleLed(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        response = printer_object.toggleLed()   
        return HttpResponse(response, content_type = 'application/json')


def printerPowerOn(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        response = printer_object.PrinterPowerOn()             
        conected = printer_object.waitConnection()         
       
        return HttpResponse(conected, content_type = 'text/html')

def printerPowerOff(request, printer_pk):
     if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        response = printer_object.printerPowerOFf()         
        return HttpResponse(response, content_type = 'text/html')


def get_printer_info(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)        
        #printer_object.connect()
        info = printer_object.get_printer_info() 
        info["error"] = printer_object.getError()        
        data = json.dumps(info)    
        print(data)
        return HttpResponse(data, content_type = 'application/json')
    else:
        raise Http404

def getStatus(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)      
        info = printer_object.getStatus()        
        data = json.dumps(info)    
        return HttpResponse(data, content_type = 'application/json')
    else:
        raise Http404


def getAllFilesAndFolders(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
      
        jsonObject = printer_object.getAllFilesAndFolders()      
       
        return HttpResponse(jsonObject, content_type = 'application/json')
    else:
        raise Http404

def selectFile(request, printer_pk, filename):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        data = printer_object.selectFile(filename)     
        return HttpResponse(data, content_type = 'text/html')
    else:
        raise Http404

def deleteFile(request, printer_pk, filename):
    
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        jsonObject = printer_object.deleteFile(filename)        
        data = json.dumps(jsonObject)  
           
        return HttpResponse(data, content_type = 'application/json')
    else:
        raise Http404

def printSelectedFile(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
       
        data = printer_object.printSelectedFile()
        
        return HttpResponse(data, content_type = 'text/html')
    else:
        raise Http404

def printFile(request, printer_pk, filename):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        jsonObject = printer_object.print(filename)      
        
        return HttpResponse(jsonObject, content_type = 'text/html')
    else:
        raise Http404

def toggle(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        jsonObject = printer_object.toggle()
        
        return HttpResponse(jsonObject, content_type = 'application/json')
    else:
        raise Http404

def cancel(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        jsonObject = printer_object.cancel()
        
        return HttpResponse(jsonObject, content_type = 'application/json')
    else:
        raise Http404

def createFolder(request, printer_pk, folderPath):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)        
        jsonObject = printer_object.createFolder(folderPath)
          
        return HttpResponse(jsonObject, content_type = 'application/json')
    else:
        raise Http404

 # -----------------------------------------------------------------------camera_actions---------------------------------------------------------------------------------
