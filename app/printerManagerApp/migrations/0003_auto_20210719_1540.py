# Generated by Django 3.1.7 on 2021-07-19 13:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('printerManagerApp', '0002_printer_tsdid'),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('---', '---------'), ('music', 'music '), ('math', 'math '), ('tecnology', 'tecnology ')], default='1', max_length=20)),
                ('name', models.CharField(max_length=120)),
                ('descriptiopn', models.TextField()),
                ('imgPath', models.CharField(max_length=120)),
            ],
        ),
        migrations.DeleteModel(
            name='Document',
        ),
    ]
