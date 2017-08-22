var config = {
  "apiKey": "AIzaSyBFQ0N2uZcnCs13IsqmN77LERHfk98f6NI",
  "channelId": "UCXdY60PbXqRuxOQ6jT5usTg"
};

$(document).ready(function() {
  var socket = io();
  var myID;
  var highlightUser = false;

  socket.on("connection", function(msg) {
    myID = msg;
  });

  socket.on("online", function(list) {
    $("#sidebar > ul > li").remove();
    $.each(list, function(userID, userColor) {
      $el = $("<li />");
      $el.css("color", userColor);
      $el.attr("data-user", userID);
      $el.html("&nbsp;");
      if (highlightUser == userID) $el.addClass("highlight");
      else if (highlightUser) $el.addClass("faded");
      $el.click(function() {
        var userID = $(this).attr("data-user");
        $("#videolist .video").css("opacity", 1);
        if (highlightUser == userID) {
          highlightUser = false;
          return;
        }
        highlightUser = userID;
        $("#videolist .video[data-user!=\"" + userID + "\"]").css("opacity", 0.7);
      });
      $("#sidebar > ul").append($el);
    });
  });

  socket.on("connected", function(msg) {
    $el = $("<div />");
    $el
      .addClass("connected")
      .text("A user connected")
      .css("border-color", msg.color);
    $('#videolist').append($el);
  });

  socket.on("disconnected", function(msg) {
    $el = $("<div />");
    $el
      .addClass("disconnected")
      .text("A user disconnected")
      .css("border-color", msg.color);
    $('#videolist').append($el);
  });

  socket.on("video", function(msg) {
    $el = $("<div />");
    $el
      .addClass("video")
      .append('<iframe width="560" height="315" frameborder="0" allowfullscreen></iframe>')
      .find("iframe:last")
      .attr("src", "https://www.youtube.com/embed/" + msg.video + "?autoplay=1&rel=0&controls=0&showinfo=0")
      .parent()
      .css("color", msg.color)
      .attr("data-user", msg.user);
    if (msg.user == myID) $el.addClass("is-me");
    $('#videolist').append($el);
  });

  var searchTimeout = false;
  $("#search-form > input").bind("keyup", function() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
      $.ajax({
        url: "https://www.googleapis.com/youtube/v3/search",
        data: {
          "part": "snippet",
          "channelId": config.channelId,
          "maxResults": 10,
          "type": "video",
          "key": config.apiKey,
          "q": $("#search-form > input").val()
        },
        success: function(json_data) {
          $("#search-results > ul > li").remove();
          $.each(json_data["items"], function(itemID, item) {
            console.log(itemID, item);
            $el = $("<li />");
            $el
              .attr("title", item.snippet.title)
              .attr("data-vid", item.id.videoId)
              .append("<img />")
              .find("img:last")
              .attr("src", item.snippet.thumbnails.medium.url)
              .parent()
              .append("<p />")
              .find("p:last")
              .text(item.snippet.title)
              .parent()
              .click(function() {
                socket.emit("video", $(this).attr("data-vid"));
                $("#search-form > input").val("");
                $("#search-results").hide();
              });
            $("#search-results > ul").append($el);
          });
          $("#search-results").show();
        }
      });
    }, 500);
  });
});
