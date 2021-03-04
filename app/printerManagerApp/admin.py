from django.contrib import admin
from .models import Printer
# Register your models here.


@admin.register(Printer)
class PrinterAdmin(admin.ModelAdmin):
    pass
