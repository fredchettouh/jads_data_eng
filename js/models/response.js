var mongoose      			= require('mongoose')
var passportLocalMongoose	= require('passport-local-mongoose')

var responseSchema = new mongoose.Schema({
	author:{id:{type:mongoose.Schema.Types.ObjectId,ref: 'User'},username:String},
	content:String,
	timeStamp : {
		year : Number,
		month : Number,
		day : Number
	},
		newsApiResponse : {
		status : String,
		totalResults : Number,
		articles : [{
			source:{
				id:String,
				name:String},
			author:String,
			title:String,
			description:String,
			url:String,
			urlToImage:String,
			publishedAt:String,
			content:String}]
		},recording:{
			id:{type:mongoose.Schema.Types.ObjectId,ref: 'Recording'}
	}
})



// responseSchema.plugin(passportLocalMongoose)

module.exports	=	mongoose.model('Response',responseSchema);
