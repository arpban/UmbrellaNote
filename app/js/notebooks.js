'use strict';

//NOTEBOOK FUNCTIONS

function addNotebook(notebookTitle, notebookSummary, coverUrl, createdOn) {
    var obj = {
        title: notebookTitle,
        summary: notebookSummary,
        cover: coverUrl,
        time: createdOn
    };

    db.notebooks.insert(obj, function (err, newDoc) {
        if (err) {
            showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error</div>');
        } else {
            // console.log("Insertion in DB successful");
            createNotebookModal();
            displayNotebooks();
            showMessage('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');

            if (navigator.onLine && localStorage.signedIn == 'true') {
                createNotebookRemote(notebookTitle, notebookSummary, coverUrl, createdOn);
            } else {
                doThisLater('CREATE_NOTEBOOK', notebookTitle, notebookSummary, coverUrl, createdOn);
            }
        }
    });
}

function setEditorToNotebook(i) {
    $('#writePage form input.notebookTitle').val(i);
    $('#writePage .header').html(i);
}

function displayNotebooks() {
    notebooksView.html('');
    db.notebooks.find({}, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < docs.length; i++) {
                // console.log(docs[i]);
                var y = docs[i];
                var slashes_title = addslashes(y.title);
                var x = '<div class="notebook"><a onclick="openNotebook(\'' + slashes_title + '\',' + i + ')"><div class="cover"><img src=' + y.cover + '></div><div class="description"><div class="title">' + y.title + '</div><div class="created">' + y.time + '</div><div class="summary">' + y.summary + '</div><button class="btn1">Open</button></div></a></div>';
                notebooksView.append(x);
            }
            // callAfterDisplayNotes()
        }
    });
}

function openNotebook(notebookTitle, index) {
    notebook_pointer = notebookTitle;
    openPage(notebookPage);
}

function closeNotebook() {
    notebook_pointer = 'Notebook One';
    $('#notebookPage .column-2').html(' ');
    setEditorToNotebook(notebook_pointer);
}