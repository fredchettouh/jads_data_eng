// middleware that checks whether or not the user is logged in 

var middlewareObject={}

middlewareObject.isLoggedIn=function(req,res,next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/login')
}

module.exports = middlewareObject