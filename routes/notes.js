var express = require('express');
var router = express.Router();
var db = require('../models');

router.get("/", (req, res) => {
    const articleId = req.query.article;
    //get all the notes with artile = articleId from mongo and return them in the response
    db.Note.find({ article: articleId }).then(notes => res.json(notes));
});

router.delete("/:id", (req, res) => {
    db.Note.findByIdAndRemove(req.params.id, (err, note) => {
        // As always, handle any potential errors:
        if (err) return res.status(500).send(err);
        const response = {
            message: "Note successfully deleted",
            id: note._id
        };
        return res.status(200).send(response);
    });
});
module.exports = router;
