from database import init_db
from models import SystemStatusPoint
import psutil
import sys
import time 

#sys.stdout = open( '/opt/minecraft/monitorDb.log', 'w' )

db = init_db()

cat = lambda file: open(file, 'r').read().strip()

#temp1 to temp5

mcProcInfo = [ proc for proc in psutil.process_iter() if proc.name() == "java" ]
if not mcProcInfo:
    sys.exit( 0 )

mcProcInfo = mcProcInfo[ 0 ]
mcRamUsage = mcProcInfo.memory_info().rss
mcCpuUsage = int( mcProcInfo.cpu_percent() )
print( mcCpuUsage )

numPolls = 10
pollInterval = 1

base = "/sys/class/hwmon/hwmon1/temp%i_input"
cpuTemps = [ 0 ] * 6
for i in range( 0, numPolls ):
    for cId in range( 0, 5 ):
        hwmonId = cId + 1
        hwmonTemp = float( cat( base % hwmonId ) ) / 1000.0
        cpuTemps[ cId ] = cpuTemps[ cId ] + int( hwmonTemp / numPolls )
    time.sleep( pollInterval )


cpuTemps = [ int( cpuTemps[ i ] ) for i in range( 0, 5 ) ]
print( cpuTemps )

db.add_all( [ SystemStatusPoint( cpuUsage=mcCpuUsage, cpuPkgTemp=cpuTemps, ramUsage=mcRamUsage ) ] )
db.commit()

