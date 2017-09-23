var express = require("express");
var bodyParser = require("body-parser");
// var logger = require ("logger");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
  }));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/times_db");
var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
  });

db.once("open", function() {
   console.log("Mongoose connection successful.");
  });

// use articles
// // done in terminal when comannds: USE NYTimesDB & db
// db
// use times_db

// db.articles.create({"NYT1": "tryisign", "country":"trying", "majorcities": ["try", "12", "123"]})

app.get("/scrape", function (req, res){
  request.apply("https://www.nytimes.com/",function(error, response, html){
    var $=cheerio.load(html);
    $("collection article").each(function(i,element){
        var result= {};
        
        result.title = $(this).children(".story").children(".story-heading").text();
        result.link = $(this).children(".story").children(".story-heading").children("a").attr("href");
        console.log("HHHHHHHHHHHHH", result)

        var entry = new Article(result);

        entry.save(function(err, doc){
          if (err){
            console.log("error")
          }
          else {
            console.log("doc")
          }
        });
    });
  });
  res.send("scrape complete")
});

app.listen(3000, function() {
    console.log("App running on port 3000!");
  });