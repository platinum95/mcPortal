from sqlalchemy import Column, Integer, String
from monitorDb.database import Base
import time as timeImp

class SystemStatusPoint( Base ):
    __tablename__ = 'SystemStatus'

    id = Column( Integer, primary_key=True )
    timestamp = Column( Integer )

    CPU_usage = Column( Integer )

    CPU_PKG_TEMP = Column( Integer )
    CPU_0_TEMP = Column( Integer )
    CPU_1_TEMP = Column( Integer )
    CPU_2_TEMP = Column( Integer )
    CPU_3_TEMP = Column( Integer )

    RAM_usage = Column( Integer )

    def __init__(self, time=None, cpuUsage=None, cpuPkgTemp=None, ramUsage=None ):
        if time == None:
            # Get current epoch
            time = int( timeImp.time() )

        if cpuUsage == None :
            # Invalid cpuUsage
            cpuUsage = 255
            
        if len( cpuPkgTemp ) != 5:
            # invalid cpu temp
            cpuPkgTemp = [ 0, 0, 0, 0, 0 ]
            
        if ramUsage == None:
            ramUsage = 255
        
        self.timestamp = time
        self.CPU_usage = cpuUsage

        self.CPU_PKG_TEMP = cpuPkgTemp[ 0 ]
        self.CPU_0_TEMP = cpuPkgTemp[ 1 ]
        self.CPU_1_TEMP = cpuPkgTemp[ 2 ]
        self.CPU_2_TEMP = cpuPkgTemp[ 3 ]
        self.CPU_3_TEMP = cpuPkgTemp[ 4 ]

        self.RAM_usage = ramUsage
          

#    def __repr__(self):
#        return "<User(id=%d, username='%s', password='%s')>" % (self.id, self.username, self.password)

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp,
            'cpuUsage': self.CPU_usage,
            'cpuTemp' : [ self.CPU_PKG_TEMP, self.CPU_0_TEMP, self.CPU_1_TEMP, self.CPU_2_TEMP, self.CPU_3_TEMP ],
            'ramUsage' : self.RAM_usage
        }
