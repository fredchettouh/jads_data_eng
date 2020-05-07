# this file will constantly asks Mongo for new Data and send it out to google for transcription. 
# Afer it will take the transcript and send it via kafka to the consumer

#installing packages
import os
import io
import numpy
from pymongo import MongoClient
import pymongo
from google.cloud import speech
from google.cloud.speech import enums
from google.cloud.speech import types
# used to search mongodb objects using the object ID 
from bson.objectid import ObjectId
import base64
from kafka import KafkaProducer
import time
import datetime
from bson import json_util 
import json 



# set up for the  google cloud services, has to run for every session 
#i.e. everytime the terminal is shut down
path="/Users/frederikchettouh/GoogleDrive/University/JADS_drive/1_Semester/181018_Data-engineering/sensor/python/My_Project-36118423d33f.json"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=path

#creating a client for interaction with the API
googleClient = speech.SpeechClient()


#detailing the connection
mongoClient=MongoClient('localhost:27017')
db=mongoClient.sensor
users=db.users
recordings=db.recordings

producer = KafkaProducer(bootstrap_servers='localhost:9092')
kafkaTopic='sensor_debugging_1'


#defining the function that converts the string
def base64_to_wav(base_64_string):
    processed_string=base_64_string.split('wav;base64,').pop()
    return base64.b64decode(processed_string)




#sending a message out to the kafk consumer
#because Kafka only takes bytes we have to encode the Mongo Response
#into a bytes object

def send_message(message,topic):
    producer.send(topic, json.dumps(message, default=json_util.default).encode())
    return




# defining the API call
def speech_to_text(wav_file):
    audio = types.RecognitionAudio(content=wav_file)
    config = types.RecognitionConfig(
    encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
    sample_rate_hertz=44100,
    language_code='en-UK')
    response = googleClient.recognize(config, audio)
    for result in response.results:
        print('Transcript: {}'.format(result.alternatives[0].transcript))
        
    return response


def getDate(timestamp):
    return{'year':timestamp.year,'month':timestamp.month,'day':timestamp.day}










#implementing the listener for mongo
x=1
# cursor = recordings.find(cursor_type=pymongo.CursorType.TAILABLE)
while True:
    x=1
    cursor = recordings.find(cursor_type=pymongo.CursorType.TAILABLE)
    while cursor.alive:
        print('this is iteration number {}'.format(x))
        x=x+1
        try:
            recording = cursor.next()
            recording['timeStamp']=getDate(datetime.datetime.now())
            sound_file=recording['content']
            binary_sound_file=base64_to_wav(sound_file)
            transcripts=speech_to_text(binary_sound_file)
            if len(transcripts.results):
                print(transcripts.results)
                recording['content']=transcripts.results[0].alternatives[0].transcript
                send_message(recording,kafkaTopic)
        except StopIteration:
            time.sleep(2)
    time.sleep(5)








