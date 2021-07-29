from django.contrib import admin
from .models import Printer
from .models import TSD_url
from .models import Project
# Register your models here.


@admin.register(Printer)
@admin.register(TSD_url)
@admin.register(Project)
class PrinterAdmin(admin.ModelAdmin):
    pass
