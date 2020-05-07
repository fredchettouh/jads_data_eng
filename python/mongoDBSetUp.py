# this script should only be run once before the service is set up
# it makes sure that the database has the appropriate set up, i.e. has capped collections
# this is only a place holder since the implementation in Node did not work

# importing the required packages
import time
import numpy
from pymongo import MongoClient
import pymongo


#setting the configuration
mongoClient=MongoClient('localhost:27017')
db=mongoClient.sensor

#dropping eventual collections
try:
	db.users.drop()
	db.recordings.drop()
	db.responses.drop()


except  e:
        print('nothing to drop')
print('collections successfully wiped')

# creating collections in the correct format

db.create_collection('users',capped=True, size= 100000000 )
db.create_collection('recordings',capped=True, size= 100000000 )

users=db.users
recordings=db.recorings

mongoClient.close()

print('capped collections successfully set up')