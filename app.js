var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var serverPort = 8080;

app.use(express.static("public"));

app.use("/jquery/", express.static("node_modules/jquery/dist"));
app.use("/bootstrap/", express.static("node_modules/bootstrap/dist"));

var colorList = ["#4b9078", "#af66b2", "#dc4c86", "#bec4b4", "#5d3a3f", "#9f98e9", "#4af25c", "#26c6be", "#3c74b5", "#d9d036", "#cec523", "#7f02f8", "#5e322f", "#207fe8", "#d74d4e", "#7eb743", "#a91f25", "#349c67", "#86b210", "#cb66a1", "#9c1040", "#313fb3", "#215222", "#fc13e9", "#4cd0b7", "#41c83a", "#4eeb08", "#93a146", "#01eca1", "#63122d", "#c1a861", "#179a55", "#1e818b", "#2f487c", "#e1525a", "#c25fc4", "#7c11d6", "#19493d", "#37edc5", "#31701f", "#121eca", "#257fdb", "#249daf", "#2a08eb", "#07663e", "#a2a084", "#74538d", "#244953", "#73ac0c", "#ba33d9", "#a4cf9d", "#5cd48f", "#735502", "#e9c230", "#70c622", "#ab747d", "#6582e7", "#26641a", "#27ac66", "#7f2390", "#02a59a", "#15015b", "#ff04c2", "#5b0df8", "#843338", "#9f3670", "#31ce3c", "#f058a3", "#d2d74e", "#131fbd", "#047c45", "#0ca91e", "#9288e5", "#3ff8bf", "#7029de", "#a9dbef", "#6c821d", "#6b34a1", "#6b55ca", "#373bf5", "#67fa08", "#8e0cc8", "#88ef89", "#ea9cf0", "#812bc3", "#5bba49", "#c8731c", "#3abb34", "#923be9", "#bf5031", "#c7e028", "#048a60", "#26f9d5", "#a9cddd", "#5ff968", "#cbdb88", "#8cf09d", "#828149", "#85cac8", "#7d805e"];
var nextColor = 0;

var onlineUsers = {};

io.on("connection", function(socket) {
  var userColor = colorList[nextColor];
  var userID = socket.id;
  nextColor++;
  if(nextColor == colorList.length) nextColor = 0;

  onlineUsers[userID] = userColor;

  console.log(">", "A user has connected ["+userID+"]");
  socket.emit("connection", userID);
  io.emit("connected", {
    "color": userColor,
    "user": socket.id
  });

  socket.on('disconnect', function() {
    console.log(">", "A user has disconnected ["+userID+"]");
    io.emit("disconnected", {
      "color": userColor,
      "user": socket.id
    });

    delete onlineUsers[userID];
  });

  socket.on("video", function(msg) {
    console.log(">>", msg, "["+userColor+"]");
    io.emit("video", {
      "video": msg,
      "color": userColor,
      "user": socket.id
    });
  });
});

setInterval(function(){
  io.emit("online", onlineUsers);
}, 500);

http.listen(serverPort, () => {
  console.log(`Server on port ${serverPort}`);
});
