# Generated by Django 3.1.7 on 2021-07-19 13:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('printerManagerApp', '0003_auto_20210719_1540'),
    ]

    operations = [
        migrations.RenameField(
            model_name='project',
            old_name='descriptiopn',
            new_name='description',
        ),
    ]
