from django.contrib import admin
from .models import Printer
from .models import TSD_url
# Register your models here.


@admin.register(Printer)
@admin.register(TSD_url)
class PrinterAdmin(admin.ModelAdmin):
    pass
