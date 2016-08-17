#!/usr/bin/env bash

sudo apt-get update
sudo apt-get upgrade

sudo apt-get install -y nginx
sudo rm -r /usr/share/nginx/html
sudo ln -s /vagrant/web /usr/share/nginx/html

sudo apt-get install -y php5-fpm php5-sqlite php-apc
sudo service php5-fpm restart

# Setup /etc/nginx/sites-available/default
sudo rm /etc/nginx/sites-available/default
sudo ln -s /vagrant/default /etc/nginx/sites-available/

ln -s /usr/share/doc/php5-apcu/apc.php /usr/share/nginx/html/apc.php
# Setup APC password

#mkdir /vagrant/web/data
#touch /vagrant/web/data/arkdevtracker.sqlite
