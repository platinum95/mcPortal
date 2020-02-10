#!/bin/bash

cd /var/mcportal/www/
source ./venv/bin/activate
python3 ./updateMonitorDb.py
