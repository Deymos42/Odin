from django.shortcuts import render
from django.views import generic
from .models import Printer
from django.http import HttpResponse, Http404
from django.shortcuts import render
from django.conf import settings
from django.shortcuts import redirect
from django.core.files.storage import FileSystemStorage
from django.contrib.auth import authenticate, user_logged_in
from django.contrib import messages
import json
import time
import requests
# Create your views here.

LIMITED_USER = "alumnes"

 # -----------------------------------------------------------------------PAGES---------------------------------------------------------------------------------

def index(request):
    #allPrinters = Printer.objects.all()
    #context = { 'my_printer_list': allPrinters } 
    if request.user.is_authenticated:
        return redirect("/dashboard") 
    else:
        return redirect("/accounts/login")

def login(request):
   
    if request.method == "POST":
        username = request.POST.get["username"]
        password = request.POST.get["password"]
        user = authenticate(request, username=username,password=password)
        if user is not None:
            if user.is_active:
                login(request,user)
                return redirect("/dashboard")
            else:
                return HttpResponse("<h1>Dissabled acount</h1>")
        else:
            context = {
              "error": "User or password invalid",             
            }
            return redirect('/accounts/login', context)
    else:
        pass
    context = {
              "error": "User or password invalid",             
            }
    return render(request, "printerManagerApp/registration/login.html", extra_context={'test':"CACA"} ) 
   

def printerOffline(request):
    if request.user.is_authenticated:
        allPrinters = Printer.objects.all()
        printersOffline = list()
        for printer in allPrinters:
            try:
                requests.get(printer.url, timeout=3)        
            except:
                printersOffline.append(printer.name)
        print("printers:")
        print(printersOffline)
        context = { 'my_printer_list': allPrinters, 'printersOffline': printersOffline} 
        return render(request, "printerManagerApp/printerOffline.html", context) 
    else:
        return redirect("/accounts/login")

def test(request):
    if request.user.username == "notAdmin":
        context = {
            "first_name": "YES",
            "last_name": "Batta",
            "address": "Hyderabad, India"
        }
    else:
        context = {
            "first_name": "NOT",
            "last_name": "Batta",
            "address": "Hyderabad, India"
        }
    return render(request, "printerManagerApp/printerOffline.html", context)

def printer(request, printer_pk):
    if request.user.is_authenticated:
        if request.method == 'POST' and request.FILES['myfile']:
            myfile = request.FILES['myfile']
            path = request.POST['filePath']
            printer_object = Printer.objects.get(IDa=printer_pk)
            printer_object.uploadFile(path, myfile)
        
        printer_object = Printer.objects.get(IDa=printer_pk)
        name = printer_object.getName()
        url = printer_object.getUrl()
        urlCam = printer_object.getUrlCam()
        allPrinters = Printer.objects.all()
        #verify that raspy is online
        try:
            requests.get(url, timeout=3)
            online = True        
        except:
            print("exepct")
            online = False

        if online:
            ledStatus = printer_object.getLedStatus()     
            printerPowerStatus = printer_object.getPrinterPowerStatus()   
            apikey = printer_object.getApiKey()

            context = {'PrinterName': name, 'id': printer_pk, 'url': url, 'urlCam': urlCam , 'ledStatus': ledStatus, 'apikey': apikey, 'username': request.user.username, 'printerPowerStatus':printerPowerStatus, 'my_printer_list': allPrinters } 
    
            return render(request, "printerManagerApp/printer.html",context)
        else:        
            return redirect("/printerOffline")
    else:
        return redirect("/accounts/login")

     
     

def dashboard(request):   
    if request.user.is_authenticated:      
        allPrinters = Printer.objects.all()        
        context = {'my_printer_list': allPrinters,'username': request.user.username }     
        return render(request, "printerManagerApp/dashboard.html",context)
    else:
        return redirect("/accounts/login")


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

def homePrinter(request, printer_pk, axes):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            data = printer_object.home(axes)             
            return HttpResponse(data, content_type = 'application/json')

def extrude(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            data = printer_object.extrude()             
            return HttpResponse(data, content_type = 'application/json')

def retract(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            data = printer_object.retract()             
            return HttpResponse(data, content_type = 'application/json')

def preheat(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)

            data = printer_object.setToolTemp(205)
            data = printer_object.setBedTemp(60)
            d = json.dumps(data)  
            return HttpResponse(d, content_type = 'application/json')

def getPrinterInfo(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)        
        info = printer_object.getPrinterInfo() 

        info["error"] = printer_object.getError()     
        info["toolTemp"] = printer_object.getToolTemp()
        info["bedTemp"] = printer_object.getBedTemp()
        info["id"] = printer_object.getId()
        #print(info)  
        data = json.dumps(info)    
        return HttpResponse(data, content_type = 'application/json')
    else:
        raise Http404

def setToolTemp(request, printer_pk, temp):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():        
            printer_object = Printer.objects.get(IDa=printer_pk)  
            data = printer_object.setToolTemp(temp)       
            d = json.dumps(data)  
            return HttpResponse(d, content_type = 'application/json')

def setBedTemp(request, printer_pk, temp):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
         printer_object = Printer.objects.get(IDa=printer_pk)     
         data = printer_object.setBedTemp(temp)       
         d = json.dumps(data)  
         return HttpResponse(d, content_type = 'application/json')

def getPrinterPowerStatus(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        response = printer_object.getPrinterPowerStatus()   
        return HttpResponse(response, content_type = 'text/html')

def toggleLed(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            response = printer_object.toggleLed()   
            return HttpResponse(response, content_type = 'application/json')

def getLedStatus(request, printer_pk):
    if request.is_ajax():
        printer_object = Printer.objects.get(IDa=printer_pk)
        response = printer_object.getLedStatus()   
        data = json.dumps(response)
        return HttpResponse(data, content_type = 'application/json')


def printerPowerOn(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            response = printer_object.PrinterPowerOn()             
            conected = printer_object.waitConnection()       
            return HttpResponse(conected, content_type = 'text/html')

def printerPowerOff(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            response = printer_object.printerPowerOFf()         
            return HttpResponse(response, content_type = 'text/html')


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
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            data = printer_object.selectFile(filename)     
            return HttpResponse(data, content_type = 'text/html')
        else:
            raise Http404

def deleteFile(request, printer_pk, filename):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            jsonObject = printer_object.deleteFile(filename)        
            data = json.dumps(jsonObject)  
            
            return HttpResponse(data, content_type = 'application/json')
        else:
            raise Http404

def printSelectedFile(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
        
            data = printer_object.printSelectedFile()
            
            return HttpResponse(data, content_type = 'text/html')
        else:
            raise Http404

def printFile(request, printer_pk, filename):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            jsonObject = printer_object.print(filename)      
            
            return HttpResponse(jsonObject, content_type = 'text/html')
        else:
            raise Http404

def jog(request, printer_pk, x, y, z):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            jsonObject = printer_object.jog(int(x), int(y), int(z))     
            
            return HttpResponse(jsonObject, content_type = 'text/html')
        else:
            raise Http404

def toggle(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            jsonObject = printer_object.toggle()
            
            return HttpResponse(json.dumps(jsonObject), content_type = 'application/json')
        else:
            raise Http404

def cancel(request, printer_pk):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)
            jsonObject = printer_object.cancel()
            return HttpResponse(json.dumps(jsonObject), content_type = 'application/json')
        else:
            raise Http404

def createFolder(request, printer_pk, folderPath):
    if request.user.username != LIMITED_USER:
        if request.is_ajax():
            printer_object = Printer.objects.get(IDa=printer_pk)        
            jsonObject = printer_object.createFolder(folderPath)
            
            return HttpResponse(jsonObject, content_type = 'application/json')
        else:
            raise Http404

 # -----------------------------------------------------------------------camera_actions---------------------------------------------------------------------------------
