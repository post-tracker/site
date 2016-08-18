#!/usr/bin/env bash

sudo apt-get update
sudo apt-get upgrade

sudo apt-get install -y nginx
sudo rm -r /usr/share/nginx/html
sudo ln -s /vagrant/web /usr/share/nginx/html

sudo apt-get install -y php-fpm php-sqlite3

# Setup /etc/nginx/sites-available/default
sudo rm /etc/nginx/sites-available/default
sudo ln -s /vagrant/default /etc/nginx/sites-available/

sudo service reload nginx
