var express = require("express");
var app = express();
var MongoClient = require('mongodb').MongoClient;
//var formidable = require('formidable');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require("body-parser");
var session = require('express-session');

app.use(bodyParser.json()); // for parsing application/json
app.use(express.static(".")); // serve static files
// app.engine('html', require('ejs').renderFile);

var mongodbUrl = "mongodb://localhost:27017/planningPoker";


var sessionMiddleware = session({
    secret: "keyboard cat", cookie: { maxAge: 5 * 60 * 1000 } // sets maximum time for session
});

io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);

var sess;

var userAPI = require("./appUsers.js"),
    userStoryAPI = require("./appUserStory.js")
socketAPI = require("./appSocket.js");
/******************create Database and design docs ********************* */

/********************************************************** */

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/Client/index.html');
});

userAPI.addRoutes(app, MongoClient, mongodbUrl);
userStoryAPI.addRoutes(app, MongoClient, mongodbUrl);
socketAPI.addSocket(io, MongoClient, mongodbUrl);

app.get("/api", function (req, res) {
    var doc = "<table><th>Method</th><th>Path</th>";
    app._router.stack.forEach(function (element) {
        if (element.route !== undefined) {
            for (var key in element.route.methods) {
                if (key) {
                    doc += "<tr><td>" + key + "</td><td>" + element.route.path + "</td></tr>";
                }
            }
        }
    }, this);
    doc += "</table>";
    //console.log(doc);
    res.send(doc);
});

app.get('/*', function (req, res) {
    res.redirect("/");
});


http.listen(7000, function () {
    console.log('PlanningPoker app listening on port 7000!');
});