#!/bin/sh

set -e

python manage.py collectstatic --noinput -c
#django-admin.py collectstatic


uwsgi --socket :8000 --master --enable-threads --module printerManager.wsgi