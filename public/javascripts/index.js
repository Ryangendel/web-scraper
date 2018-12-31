

scrapeArticles();

function loadArticles(saved) {
    let route = '/articles';
    if (saved) {
        route += '?saved=true';
    }

    $("#articles").empty();
    $.getJSON(route, function (data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            $("#articles").prepend(
                `<div class="card border-dark mb-3" data-id=${data[i]._id} style="max-width: 20rem;">
                <a class="articleHeader card-header" href="${data[i].url}"><span style="font-weight: bold">${data[i].header}</span></a>
                <div class="card-body">
               <p class="card-text">${data[i].summary}</p>
               <button data-id=${data[i]._id} class="btn btn-primary btn-notes" id='articleNotes'>Article Notes</button>
            ${ saved
                    ? `<button data-id=${data[i]._id} class="btn btn-outline-secondary" id='articleUnsave'>Unsave Article</button>`
                    : `<button data-id=${data[i]._id} class="btn btn-outline-secondary" id='articleSave'>Save Article</button>`}                   
                </div>
            </div>`
            );
        }
    });
}


function scrapeArticles() {
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(loadArticles());
}


$(document).on("click", "#savedArticles", function () {
    loadArticles(true);
})
$(document).on("click", "#homeLink", function () {
    scrapeArticles();
})




$(document).on("click", "#articleSave", function () {
    const articleId = $(this).data("id")

    $.ajax({
        method: "PATCH",
        url: "/articles/" + articleId,
        data: { saved: true }
    }).then(data => {
        console.log(data);
    })
});


$(document).on("click", "#articleUnsave", function () {
    const articleId = $(this).data("id")

    $.ajax({
        method: "PATCH",
        url: "/articles/" + articleId,
        data: { saved: false }
    }).then(data => {
        console.log(data);
        loadArticles(true);
    })

});


//delete note
$(document).on("click", "#deleteNote", function (note) {
    let noteId = $(this).data("id");
    console.log(noteId);
    // request note delete from the server
    $.ajax({
        method: "DELETE",
        url: "/notes/" + noteId
    })

    // remove note from modal
    $(`#note_${noteId}`).remove();
});

// Whenever someone clicks a p tag
$(document).on("click", "#articleNotes", function () {
    $(".modal").modal()
    // Empty the notes from the note section
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/notes?article=" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);

            $(".modal-body").empty();

            // An input to enter a new title
            $(".modal-body").append("<input id='titleinput' name='title' placeholder='Enter Note Title'>");
            // A textarea to add a new note body
            $(".modal-body").append("<textarea placeholder='Enter Note Body' id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $(".modal-body").append("<button class='btn btn-outline-primary' data-id='" + thisId + "' id='savenote'>Save Note</button>");


            //loop through all notes an render in modal
            data.forEach(note => {
                $(".modal-body").append(`
                <div id="note_${note._id}" class="noteCard card text-white bg-primary mb-3" style="max-width: 20rem;">
                <div class="card-body">
                  <h4 class="card-title">${note.title}</h4>
                  <p class="card-text">${note.body}</p>
                  <button class="btn btn-outline-danger" data-id= ${note._id} id='deleteNote'>Delete Note</button>
                </div>
                `);
            });


        });
});



// When you click the savenote button
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});
