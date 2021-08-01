# Generated by Django 3.1.7 on 2021-07-28 14:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('printerManagerApp', '0004_auto_20210719_1545'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='ID',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='project',
            name='category',
            field=models.CharField(choices=[('---', '---------'), ('music', 'music '), ('science', 'science '), ('social science', 'social science '), ('math', 'math '), ('tecnology', 'tecnology '), ('physics', 'physics '), ('chemistry', 'chemistry '), ('Crafts', 'Crafts '), ('Art history', 'Art history ')], default='1', max_length=20),
        ),
    ]