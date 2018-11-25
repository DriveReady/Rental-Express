var express = require('express');
var router = express.Router();
var monk = require('monk');
const nodemailer = require('nodemailer');
var db = monk('localhost:27017/rentalexpress');
var users = db.get('users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { userData:req.session.userData });
});

//signin function begins here
router.post('/signin',function(req, res, next){
	var email = req.body.email;
	var password = req.body.password;
	users.findOne({"email":email},function(err,docs){
		if (err) {
			console.log(err);
		}
		else if(!docs){
			var message = {status: true, msg: "Sorry your email is not registerd"};
			res.send(message);
		}
		else{
			if (docs.password==password) {
				req.session.userData = {userName: docs.userName, password: docs.password};
				console.log(req.session.userData);
				var message = {status: false, msg: "Successfully logged in."};
				res.send(message);
			}
			else{
				var message = {status: true, msg: "Plz check the password you entered"}
				res.send(message);
			}
		}
	});
});

/*signup function*/
router.post('/sign-up',function(req,res,next){
	// console.log('hello');
	// console.log(req.body.userName);
	var data = {
		userName : req.body.userName,
		password : req.body.password,
		email : req.body.email,
		updatesCheckBox : req.body.updatesCheckBox,
		otp : req.body.seq,
		userState : 0,
	}

	users.findOne({"email":req.body.email},function(err,docs){
			if (err) {
				console.log("error");
			}
			else if (!docs) {
				users.insert(data,function(err,data){
					if(err){
						console.log(err);
					}
					else{
						sendMail(data.email,data.otp);
						console.log('user Successfully created');
						console.log(data.email);
						res.send('user Successfully created');
					}
				});
			}
			else{
				res.send('user with email already exist');	
			}

	});


});

function sendMail(email,otp) {

			// Generate test SMTP service account from ethereal.email
			// Only needed if you don't have a real mail account for testing
			nodemailer.createTestAccount((err, account) => {
			    // create reusable transporter object using the default SMTP transport
			    let transporter = nodemailer.createTransport({
			        host: 'smtp.gmail.com',
			        port: 465,
			        secure: true, // true for 465, false for other ports
			        auth: {
			            user: 'suryapalla449@gmail.com', // generated ethereal user
			            pass: 'Boss@2015' // generated ethereal password
			        }
			    });

			    // setup email data with unicode symbols
			    let mailOptions = {
			        from: '"Surya 👻" <suryapalla449@gmail.com.com>', // sender address
			        to: email, // list of receivers
			        subject: 'Hi Welcome to the Rental Express', // Subject line
			        text: 'Your one time password is: ', // plain text body
			        html: '<b> Your one time password is: '+otp+'</b>' // html body
			    };

			    // send mail with defined transport object
			    transporter.sendMail(mailOptions, (error, info) => {
			        if (error) {
			            return console.log('message not sent');
			        }
			        console.log('Message sent');
			        console.log(email);
			        // Preview only available when sending through an Ethereal account

			        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
			        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
			    });
			});

}

/* post form page Update details into db. */
router.post('/validate-otp', function(req, res, next) {
	var data = {
		userState : 1
	};
	users.findOne({"email":req.body.email,"otp":req.body.otp},function(err,docs){
		if(docs){
			users.update({"email":req.body.email},{$set:data},function(err,data) {
				if(err){
					console.log(err);
				}
				else{
					res.send("User Successfully created");
				}
			});
		}
		else{
			res.send("Please enter the valid OTP");
		}
	});
  
});

module.exports = router;
