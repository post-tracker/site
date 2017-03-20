#!/usr/bin/env bash

# Something's fucky
echo "nameserver 8.8.8.8" | tee /etc/resolv.conf > /dev/null

apt-get update
apt-get upgrade

# Installing node.js
curl -sL https://deb.nodesource.com/setup_6.x | -E bash -
apt-get install -y nodejs

apt-get install -y nginx
rm -r /usr/share/nginx/html
ln -s /vagrant/dist /usr/share/nginx/html

apt-get install -y php-fpm php-sqlite3 php-apcu php-xml

# Setup /etc/nginx/sites-available/default
rm /etc/nginx/sites-available/default
cp /vagrant/config/server.conf /etc/nginx/server.conf
cp /vagrant/config/ssl.conf /etc/nginx/ssl.conf
cp /vagrant/config/gzip.conf /etc/nginx/gzip.conf
cp /vagrant/config/vagrant.conf /etc/nginx/vagrant.conf
ln -s /vagrant/config/nginx-vagrant /etc/nginx/sites-available/default

sed -i -e 's/display_errors = Off/display_errors = On/g' /etc/php/7.0/fpm/php.ini
sed -i -e 's/error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT/error_reporting = E_ALL/g' /etc/php/7.0/fpm/php.ini

apt-get install -y lynx

# SSL Stuff
if [ ! -d /etc/nginx/ssl ]; then
    mkdir /etc/nginx/ssl
fi

if [ ! -f /etc/nginx/ssl/dhparam.pem ]; then
    openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048
fi

if [ ! -f /etc/nginx/ssl/key.pem ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost" -keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem
fi

# CouchDB
apt-get install -y couchdb
curl localhost:5984

sed -i -e 's/;bind_address = 127.0.0.1/bind_address = 0.0.0.0/g' /etc/couchdb/local.ini

systemctl reload nginx
systemctl restart php7.0-fpm
systemctl restart couchdb
