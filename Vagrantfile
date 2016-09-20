# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure(2) do |config|
    # Use custom box from here until major bugs in xenial are fixed
    # Box: https://bugs.launchpad.net/cloud-images/+bug/1565985
    # Bug: https://bugs.launchpad.net/cloud-images/+bug/1605795
    # config.vm.box = "test/yakkety64"
    # config.vm.box_url = "http://people.canonical.com/~dwatkins/livecd.ubuntu-cpc.vagrant.2.box"
    config.vm.box = "ubuntu/xenial64"
    config.vm.provision :shell, path: "scripts/vagrant-bootstrap.sh"
    config.vm.network "forwarded_port", guest: 80, host: 3000
    config.vm.network "forwarded_port", guest: 443, host: 8443
end
