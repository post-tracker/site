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

systemctl reload nginx
systemctl restart php7.0-fpm
