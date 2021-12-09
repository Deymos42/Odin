from django.contrib import admin
from .models import Printer
from .models import Project
from .models import Images
# Register your models here.


@admin.register(Printer)
@admin.register(Project)
@admin.register(Images)
class PrinterAdmin(admin.ModelAdmin):
    pass
