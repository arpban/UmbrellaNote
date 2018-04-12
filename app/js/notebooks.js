'use strict';

//NOTEBOOK FUNCTIONS

function createNotebook(event) {
    event.preventDefault();
    var title = $('.create-notebook-modal form input[name=title]').val();
    console.log(title);
    var summary = $('.create-notebook-modal form textarea').val();
    var coverImage = $('.cover-checkbox:checked').val();
    var d = new Date();
    var date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
    addNotebook(title, summary, coverImage, date);
}

function addNotebook(notebookTitle, notebookSummary, coverUrl, createdOn) {
    var obj = {
        title: notebookTitle,
        summary: notebookSummary,
        cover: coverUrl,
        time: createdOn
    };

    db.notebooks.findOne({ title: notebookTitle }, function (err, doc) {
        if (err) {
            showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error. Try again later.</div>');
        } else {
            if (doc == null) db.notebooks.insert(obj, function (err, newDoc) {
                if (err) {
                    showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error. Try again later.</div>');
                } else {
                    createNotebookModal();
                    openPage(homePage);
                    showMessage('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');

                    // if(navigator.onLine && (localStorage.signedIn=='true')){
                    //     createNotebookRemote(notebookTitle, notebookSummary, coverUrl, createdOn)
                    // }else{
                    //     doThisLater('CREATE_NOTEBOOK', notebookTitle, notebookSummary, coverUrl, createdOn)
                    // }
                }
            });else showMessage('You cannot make two notebooks with same name');
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
                var y = docs[i];
                var slashes_title = addslashes(y.title);
                var x = '<div class="notebook"><a onclick="openNotebook(\'' + y._id + '\')"><div class="cover"><img src=' + y.cover + '></div><div class="description"><div class="title">' + y.title + '</div><div class="created">' + y.time + '</div><div class="summary">' + y.summary + '</div><button class="btn1">Open</button></div></a></div>';
                notebooksView.append(x);
            }
        }
    });
}

function openNotebook(notebook_id) {
    db.notebooks.findOne({ _id: notebook_id }, function (err, doc) {

        if (err) {
            showMessage('Cannot open this notebook. Try again later.');
        } else {
            notebook_pointer = doc.title;
            openPage(notebookPage);
        }
    });
}

function closeNotebook() {
    notebook_pointer = 'Notebook One';
    $('#notebookPage .column-2').html(' ');
    setEditorToNotebook(notebook_pointer);
}

function deleteNotebook(event) {
    event.preventDefault();
    var title = $('.edit-notebook.modal input[type=hidden]').val();

    db.notebooks.remove({ title: title }, {}, function (err, numRemoved) {});
    db.notes.remove({ notebook: title }, { multi: true });
    showMessage('Notebook deleted');
    displayNotebooks();
    openPage(settingsPage);

    toggleModal('.edit-notebook.modal');
}

function editNotebook(event) {
    event.preventDefault();
    var old_title = $('.edit-notebook.modal input[type=hidden]').val();
    var new_title = $('.edit-notebook.modal input[type=text]').val();

    db.notebooks.update({ title: old_title }, { $set: { title: new_title } });
    db.notes.update({ notebook: old_title }, { $set: { notebook: new_title } }, { multi: true });
    showMessage('Notebook updated');
    displayNotebooks();
    openPage(settingsPage);

    toggleModal('.edit-notebook.modal');
}