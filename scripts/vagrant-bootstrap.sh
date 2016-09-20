#!/usr/bin/env bash

# Something's fucky
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf > /dev/null

sudo apt-get update
sudo apt-get upgrade

# Installing node.js
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt-get install -y nginx
sudo rm -r /usr/share/nginx/html
sudo ln -s /vagrant/dist /usr/share/nginx/html

sudo apt-get install -y php-fpm php-sqlite3 php-apcu php-xml

# Setup /etc/nginx/sites-available/default
sudo rm /etc/nginx/sites-available/default
sudo ln -s /vagrant/config/nginx-vagrant /etc/nginx/sites-available/default

sudo apt-get install -y lynx

sudo systemctl reload nginx
sudo systemctl restart php7.0-fpm
