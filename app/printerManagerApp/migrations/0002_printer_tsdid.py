# Generated by Django 3.1.7 on 2021-03-26 12:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('printerManagerApp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='printer',
            name='TSDid',
            field=models.CharField(default=1, max_length=120),
            preserve_default=False,
        ),
    ]