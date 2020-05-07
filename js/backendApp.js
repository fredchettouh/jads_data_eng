var mongoose		=		require('mongoose');
var express 		= 		require('express');
var app				=		express();
var http			= 		require('http');
var port 			=		3000;
var bodyParser		=		require('body-parser');
var multiparty		=		require('multiparty');
var Recording 		= 		require('./models/recording.js');
var fs				=		require('fs');
var LocalStrategy 	=		require('passport-local');
var passport 		=		require('passport');
var User 			=		require('./models/user.js')
var middleware 		=		require('./middleware/index.js')
var Response		=		require('./models/response.js')
var ObjectId 		= 		require('mongoose').Types.ObjectId; 


// Cannot use the seed file since we cannot remove from a capped file
// run python DB setup firs
// var seedDB			=		require('./seed.js')
// seedDB();



app.use(express.static('public'));
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
app.set('view engine', 'ejs');


// bodyParser parser req.body
app.use(bodyParser.urlencoded({extended:true,limit:'50mb'}));

// congfiguring passport

app.use(require('express-session')({
	secret:'Hashing the password',
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// local strategy so that I have access to the user locally

app.use(function(req,res,next){
    res.locals.user=req.user;
    next();
})


app.get('/',function(req,res){
	res.render('home.ejs')
});

// register route 
 app.get('/register', function(req,res){

 	res.render('register.ejs')
 })


// recordings route 

app.get('/recordings',middleware.isLoggedIn,function(req,res){

	if(req.user){
		console.log(req.user.id)
		console.log(req.user.username)
		Response.find({'author':{'id':new ObjectId(req.user.id),
								'username':req.user.username}},function(err,foundResponse){
				if(err){
					console.log(err)
				}
				console.log(foundResponse)
				console.log(typeof(foundResponse))
				res.render('recordings.ejs',{response:foundResponse})
			});
	}else{
		res.render('recordings.ejs')
	}
});


// register post route

 app.post('/register',function(req,res){
 	var newUser = new User({username:req.body.username})

 	User.register(newUser,req.body.password,
 		function(err,createdUser){
 		if (err){
 			console.log(err);
 			res.redirect('/register')
 		}
 		passport.authenticate('local') (req,res,function(){
 			res.redirect('/recordings/new')

 		});	
	});
});


// log in route 
 app.get('/login',function(req,res){
 	res.render('login.ejs')
 })

 app.post('/login',
 	passport.authenticate('local',
 	{
 		successRedirect:'recordings/new',
 		failureRedirect:'/login'
 	}),function(req,res){

 });

// logout route

app.get('/logout', function(req,res){
	req.logout();
	res.redirect('/')
})



// route for a new recording

app.get('/recordings/new',middleware.isLoggedIn,function (req,res){
	res.render('new.ejs')
});



// getting recording and saving to to mongo

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







mongoose.connect("mongodb://localhost:27017/sensor",{ useNewUrlParser: true },function(){
    console.log('database is connected');
});

app.listen(port, function(){
	console.log('sensor server is running')
	});
