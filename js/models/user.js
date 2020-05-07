var mongoose      			= require('mongoose')
var passportLocalMongoose	= require('passport-local-mongoose')

var userSchema = new mongoose.Schema({
	username:String,
	password:String,
	apiresults:[
			{
				type:mongoose.Schema.Types.ObjectId,
				ref:'Response'
			}

	]
},{capped:true,size:1024,max:5000},{collection: 'data'});




userSchema.plugin(passportLocalMongoose)

module.exports	=	mongoose.model('User',userSchema);
