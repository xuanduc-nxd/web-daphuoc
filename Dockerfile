FROM php:8.2-apache

RUN apt-get update && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY . /var/www/html/
COPY apache-security.conf /etc/apache2/conf-available/site-security.conf
RUN a2enconf site-security
RUN sed -i 's#DocumentRoot /var/www/html#DocumentRoot /var/www/html/public#' /etc/apache2/sites-available/000-default.conf
RUN printf 'upload_max_filesize=5M\npost_max_size=7M\nexpose_php=Off\n' > /usr/local/etc/php/conf.d/site.ini

RUN chown -R www-data:www-data /var/www/html

# Render routes web requests to port 10000 by default.
RUN sed -i 's/Listen 80/Listen 10000/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:10000>/' /etc/apache2/sites-available/000-default.conf

EXPOSE 10000

CMD ["apache2-foreground"]
