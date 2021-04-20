FROM 10.0.0.8:5000/nginx:v1.2

COPY nginx.conf /usr/local/nginx/conf.d/nginx.conf

COPY public /data/src

RUN chown -R www-data.www-data /data/src/ && chmod -R 755 /data/src

EXPOSE 80
