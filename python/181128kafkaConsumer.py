# general package import

import numpy
from pymongo import MongoClient
import pymongo
from kafka import KafkaConsumer
import nltk
from nltk import word_tokenize
from nltk.corpus import stopwords
from newsapi import NewsApiClient
import time
import json
from bson.objectid import ObjectId



#detailing the connection
mongoClient=MongoClient('localhost:27017')
db=mongoClient.sensor
responses=db.responses

# setting up kafka consumer
kafkaTopic='sensor_debugging_1'
consumer = KafkaConsumer(
                        bootstrap_servers='localhost:9092',
                        auto_offset_reset='latest',  # Reset partition offsets upon OffsetOutOfRangeError
                        group_id='test',   # must have a unique consumer group id 
                        consumer_timeout_ms=1000)  
                                # How long to listen for messages - we do it for 10 seconds 
                                # because we poll the kafka broker only each couple of hours

consumer.subscribe(kafkaTopic)



# configuring the newsapi client
api_key='efc736cc01f94762b06e919f972dbe47'
newsapi = NewsApiClient(api_key=api_key)
daysPast=2



#setting up nltk 

stop_words = stopwords.words('english')
tag_list=['NN','NNS','NNP','NNPS']



def decode(byteMessage):
    return json.loads(byteMessage.decode())



#function to get the query words out of the transcript 
def get_nouns(string):
    strTokenize=word_tokenize(string)
    stopWordsRemoved=[word for word in strTokenize if word not in stop_words]
    queryWords=[tup[0] for tup in  nltk.pos_tag(stopWordsRemoved) if tup[1] in tag_list]
    return queryWords



#this function takes a dictionary as as received from kafka and runs the query 



def constructQuery(recordDict,daysPast):
    return newsapi.get_everything(
    q="".join([word+' AND ' for word in get_nouns(recordDict['content'])]).strip('AND '),
    from_param='-'.join([str(recordDict['timeStamp']['year']),
                        str(recordDict['timeStamp']['month']),
                        str(recordDict['timeStamp']['day']-daysPast)]),
    to='-'.join([str(recordDict['timeStamp']['year']),
                        str(recordDict['timeStamp']['month']),
                        str(recordDict['timeStamp']['day'])]),
    language='en',
    sort_by='relevancy',
    page=1)
    



#for every message in the consumer we do:

while True:
    for message in consumer:
        print(type(message))
        #decode the message into a json object
        decodedMessage=decode(message.value)
        #construct the query based on the nouns in the transcript 
        decodedMessage['newsApiResponse']=constructQuery(decodedMessage,daysPast)
        #turn the id's back into object ids for mongo and append the recording reference
        decodedMessage['recording']={'id':ObjectId(decodedMessage['_id']['$oid'])}
        decodedMessage.pop('_id')
        #insert it into mongo
        decodedMessage['author']['id']=ObjectId(decodedMessage['author']['id']['$oid'])
        responses.insert_one(decodedMessage)
        print('successfully inserted a result')
    time.sleep(1)

        