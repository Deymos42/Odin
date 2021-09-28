# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.8-alpine 
ENV PATH="/scripts:${PATH}"

COPY ./requirements.txt /requirements.txt

RUN apt-get install gcc
RUN apt-get install linux-headers
RUN apt-get install libc-dev
RUN apt-get install jpeg-dev
RUN apt-get install zlib-dev
RUN pip install -r /requirements.txt
RUN apk del .tmp

RUN mkdir /app
COPY ./app /app
WORKDIR /app
COPY ./scripts /scripts

RUN chmod +x /scripts/*


RUN mkdir /var/log/django
RUN touch /var/log/django/myapp.log
RUN a











dduser -D user
RUN chown -R user:user /app
RUN chmod -R 777 /var/log/django/myapp.log
RUN chmod -R 755 /app/printerManagerApp
RUN chmod -R 755 /app/printerManagerApp/static



USER root

CMD ["entrypoint.sh"]