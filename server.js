var express = require("express"),
    app = express(),
    http = require("http").Server(app),
	  io = require('socket.io')(http),
    // import the mongoose library
    mongoose = require("mongoose");

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo db name is amazerfiic
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);
//just http. no createServer
http.listen(3000, function() {
	console.log("listening on 3000");
});

// ================  Set socket.io listeners.=================================
//(sent(emit) from client, need set socket.on linstener on server side to receive)
io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('clientData', function(data){
    console.log("receive client add item: ", data);
    // broadcast/emit(include itself) the event from the server to all users
    io.emit('broadcastData', data);
  });
});
// ============================================================================

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    console.log("req.body is: ", req.body);
    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
	if (err !== null) {
	    // the element did not get saved!
	    console.log(err);
	    res.send("ERROR");
	} else {
	    // our client expects *all* of the todo items to be returned, so we'll do
	    // an additional request to maintain compatibility
	    ToDo.find({}, function (err, result) {
		if (err !== null) {
		    // the element did not get saved!
		    res.send("ERROR");
		}
		res.json(result);
	    });
	}
    });
});

