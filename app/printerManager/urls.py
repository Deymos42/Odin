"""printerManager URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings

from printerManagerApp import views

urlpatterns = [
    #-------------------general_links------------------------------------------
    path('admin/', admin.site.urls),
    path('', views.index),
    path('test', views.test),
    path('accounts/', include('django.contrib.auth.urls')), 
    path('printer/<int:printer_pk>', views.printer),
    path('cameras', views.allCamerasView.as_view()),
    path('projects', views.projects),
    path('dashboard', views.dashboard),
    path('printerOffline', views.printerOffline),

    #-------------------printer_actions------------------------------------------   
 
    path('printer/<int:printer_pk>/toggleLed', views.toggleLed, name='ledOff'),
    path('printer/<int:printer_pk>/getLedStatus', views.getLedStatus, name='ledStatus'),
    path('printer/<int:printer_pk>/getPrinterPowerStatus', views.getPrinterPowerStatus, name='getPowerStatus'),
    path('printer/<int:printer_pk>/printerPowerOn', views.printerPowerOn, name='printerOn'),
    path('printer/<int:printer_pk>/printerPowerOff', views.printerPowerOff, name='printerOff'),
    path('printer/<int:printer_pk>/getInfo', views.getPrinterInfo, name='ajax_test'),
    path('printer/<int:printer_pk>/homePrinter/<str:axes>', views.homePrinter, name='homePrinter'),
    path('printer/<int:printer_pk>/preheat', views.preheat, name='preheat'),
    path('printer/<int:printer_pk>/extrude', views.extrude, name='extrude'),
    path('printer/<int:printer_pk>/retract', views.retract, name='retract'),
    path('printer/<int:printer_pk>/setToolTemp/<int:temp>', views.setToolTemp, name='setToolTemp'),
    path('printer/<int:printer_pk>/setBedTemp/<int:temp>', views.setBedTemp, name='setbedTemp'),
    path('printer/<int:printer_pk>/getAllFilesAndFolders', views.getAllFilesAndFolders, name='getAkkfiles'),    
    path('printer/<int:printer_pk>/getStatus', views.getStatus, name='gerKlipperStatys'),
    path('printer/<int:printer_pk>/select/<str:filename>', views.selectFile, name='select'),
    path('printer/<int:printer_pk>/printSelectedFile', views.printSelectedFile, name='printSelectedFile'),
    path('printer/<int:printer_pk>/deleteFile/<str:filename>', views.deleteFile, name='deleteFile'),
    path('printer/<int:printer_pk>/toggle', views.toggle, name='toggle'),
    path('printer/<int:printer_pk>/cancel', views.cancel, name='cancel'),
    path('printer/<int:printer_pk>/print/<str:filename>', views.printFile, name='print'),
    path('printer/<int:printer_pk>/createFolder/<str:folderPath>', views.createFolder, name='print'), 
    path('printer/<int:printer_pk>/jog/<str:x>/<str:y>/<str:z>', views.jog, name='jog'), 
    path('printer/<int:printer_pk>/moveFile/<str:actualPath>/<str:newPath>', views.moveFile, name='moveFile'), 

    #-------------------projects------------------------------------------
     path('projects/category/<str:id>', views.projectCategory),
     path('projects/category/<str:idCat>/<str:idProj>', views.viewProject),
    
] 
 