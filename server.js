//Imports
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
const flash = require("express-flash");
mongoose.Promise = global.Promise;

//Config
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(flash());
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({useNewUrlParser: true}));
app.use(session({
    secret: "messages",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));


//Database
mongoose.connect("mongodb://localhost/MessageBoard");

const CommentSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Your name is required!"], minlength: 3},
    comment: {type: String, required: [true, "Comment field can not be left blank!"], minlength: 3},
    }, {timestamps: true})

const MessageSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Your name is required!"], minlength: 3},
    message: {type: String, required: [true, "Message field can not be left blank!"], minlength: 3},
    comments: [CommentSchema]
    }, {timestamps: true})

    mongoose.model("Comment", CommentSchema);
    mongoose.model("Message", MessageSchema);

    var Comment = mongoose.model("Comment");
    var Message = mongoose.model("Message");

//Routes
app.get('/', function(req, res) {
	Message.find({}, function(err, msg_array) {
		if (err) {
			console.log("Error finding messages")
			res.render("index", {'err': err})
		}else {
			console.log(msg_array)
			res.render("index", {messages: msg_array})
		}
	})
})
// post route for adding a user
app.post('/message', function(req, res) {
	console.log("POST DATA", req.body);
	Message.create(req.body, function(err, data) {
		if (err) {
			console.log("Error creating message")
			res.redirect("/")
		}else{
			console.log("Succesffuly added message")
			// const all_messages= Message.find({})
			// console.log(all_messages)
			res.redirect("/")
		}
	})
})
app.post('/comment', function(req, res) {
	// console.log("POST DATA", req.body);
	Comment.create({comment: req.body.comment, name: req.body.name}, function(err, data) {
		if (err) {
			console.log("Error creating Comment")
			
			res.redirect("/")
		}else{
			Message.findOneAndUpdate({_id: req.body.msg_id}, {$push: {comments: data}}, function(err, data){
				if(err){
					console.log("Error adding comment to message", err.message)
					res.redirect("/")
				}else {
					console.log("Successfully added comment to message")
					res.redirect("/")
				}
			})
		}
	})
})


//Port
app.listen(8000, function(){
    console.log("Listening on port: 8000");
});



