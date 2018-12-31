var express = require('express');
var router = express.Router();
var db = require('../models');
var request = require('request');

var cheerio = require('cheerio')


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

// Routes

// A GET route for scraping the  website
router.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  request.get("https://techcrunch.com/", function (error, response, body) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(body);


    $(".post-block").each(function (index, articleDiv) {
      var result = {};
      try {
        result.header = $(this).children("header").children("h2").children("a").text().trim();
        result.url = $(this).children("header").children("h2").children("a").attr("href").trim();
        result.summary = $(this).children("div")[0].firstChild.data.trim();

        // Create a new Article using the `result` object built from scraping
        db.Article.findOne({ url: result.url }).then(existingArticle => {
          if (existingArticle === null) {
            // Only save if new
            db.Article.create(result)
              .then(function (dbArticle) {
                // View the added result in the console
                console.log("Added article: " + dbArticle);
              })
              .catch(function (err) {
                // If an error occurred, send it to the client
                return res.json(err);
              });
          }
        })

      } catch (error) {
        console.error("Unable to scrape article at index: ", index);
      }

    });

    res.send("Scrape Complete");
  });

});

router.patch("/articles/:id", function (req, res) {
  // update in mongo
  db.Article.findByIdAndUpdate(
    // the id of the item to find
    req.params.id,

    // the change to be made. Mongoose will smartly combine your existing 
    // document with this change, which allows for partial updates too
    req.body,

    // an option that asks mongoose to return the updated version 
    // of the document instead of the pre-updated one.
    { new: true },

    // the callback function
    (err, article) => {
      // Handle any possible database errors
      if (err) return res.status(500).send(err);
      return res.send(article);
    }
  )
})

// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
  // /articles
  let query = {}
  // /articles?saved=true
  if (req.query.saved === 'true') {
    //query = { saved: true }
    query.saved = true;
  }

  // Grab every document in the Articles collection
  db.Article.find(query)
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  const noteData = {
    title: req.body.title,
    body: req.body.body,
    article: req.params.id
  }
  db.Note.create(noteData)
    .then(function (dbnote) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbnote);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

module.exports = router;







