#!/bin/bash

function rcon {
    /opt/minecraft/tools/mcrcon/mcrcon -H 127.0.0.1 -P 25575 -p <Put password here> "$1"
}

rcon "save-off"
rcon "save-all"
tar -cvpzf /opt/minecraft/backups/server-$(date +%F_%R).tar.gz /opt/minecraft/server
rcon "save-on"

  ## Delete older backups
find /opt/minecraft/backups/ -type f -mtime +3 -name '*.gz' -delete

## reboot server
sudo systemctl stop minecraft_resurrection
sleep 5
sudo systemctl start minecraft_resurrection



