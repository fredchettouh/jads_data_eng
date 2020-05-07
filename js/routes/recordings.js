var express		=		require('express');
var router		=		express.Router({mergeParams:true});
var middleware	=		require('../middleware/index.js');
var Response	=		require('./models/response.js')
var Recording 	= 		require('./models/recording.js');




// route to get all recordings

router.get('/recordings',middleware.isLoggedIn,function(req,res){
	if(req.user){
		Response.find({'author.id':new ObjectId(req.user.id)},function(err,foundResponse){
				if(err){
					console.log(err)
				}
				res.render('recordings.ejs',{response:foundResponse})
			});
	}else{
		alert('you search did not yield a result or you have not done a search yet')
		res.redirect('recordings/new')
	}
});


// app to make a new recording
app.get('/recordings/new',middleware.isLoggedIn,function (req,res){
	res.render('new.ejs')
});

// route to post a new recording

app.post('/recordings',middleware.isLoggedIn,function(req,res){
	var form = new multiparty.Form();
    form.parse(req, function(err, file) {
    	if (err){
    		console.log(err)
    	}
        var data=file.data;
	    var author={id:req.user._id,username:req.user.username};
	    newRecording={
	    	author:author,
	    	content:data}
    	Recording.create(newRecording,function(err,Recording){
    		if (err){
    			console.log(err)
        		}
        });
    });
});
