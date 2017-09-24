var express = require("express");
var bodyParser = require("body-parser");
var morgan = require('morgan');
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var Article = require ("./models/Article.js")

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

// -------
// routes
// ______


app.get("/scrape", function (req, res){
  request("https://www.nytimes.com/",function(error, response, html){
    var $ = cheerio.load(html);
    $("article h2").each(function(i,element){
        var result= {};
        
        result.title = $(this).children("a").text();
        result.link = $(this).children("a").attr("href");
        

        var entry = new Article(result);

        entry.save(function(err, doc){
          if (err){
            console.log("entry error")
          }
          else {
            console.log("Article saved!")
          }
        });
    });
  });
  res.send("scrape complete")
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function (req, res){
    Article.findOne({"_id": req.params.id})
    .exec(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
    

  })

app.listen(3000, function() {
    console.log("App running on port 3000!");
  });