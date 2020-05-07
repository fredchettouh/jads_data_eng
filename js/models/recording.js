var mongoose 	=	require('mongoose')


// creating the model
var recordingSchema = new mongoose.Schema({
	author:{id:{type:mongoose.Schema.Types.ObjectId,ref: 'User'},username:String},
	content:String
},{capped:true,size:5242880,max:5000})


// making the model available for the app
module.exports = mongoose.model('Recording',recordingSchema)