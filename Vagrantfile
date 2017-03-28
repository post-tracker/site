# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure(2) do |config|
    config.vm.box = "ubuntu/xenial64"
    config.vm.provision :shell, path: "scripts/vagrant-bootstrap.sh"
    config.vm.network "forwarded_port", guest: 80, host: 3000
    config.vm.network "forwarded_port", guest: 443, host: 8443
    config.vm.network "forwarded_port", guest: 5984, host: 5984

    config.vm.provider "virtualbox" do |vb|
        vb.memory = 1024
    end
end
