'use strict';

var axios = require('axios');
var fs = require('fs');
var $ = require('jquery');

var _require = require('electron'),
    ipcRenderer = _require.ipcRenderer;

var app = require('electron').remote.app;

var months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
var days = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
var covers = ["img/1.jpg", "img/2.jpeg", "img/3.jpg", "img/4.png", "img/13.jpeg", "img/14.jpeg"];
var isModalUsedBefore = false;
var notebooksView = $('#homePage .notebooks');

//PAGES
var homePage = $('#homePage');
var writePage = $('#writePage');
var notebookPage = $('#notebookPage');
var editorPage = $('#editPage');
var settingsPage = $('#settingsPage');
var pages = [homePage, writePage, notebookPage, editorPage, settingsPage];

var notePointer = null; //it points to jquery object of a note
var pointer_id_current_note = null; //it points to id of the current note that notePointer is pointing to. 
var notebook_pointer = 'Notebook One'; //it points to name of currently active notebook
var page_pointer = homePage; //it points to jquery object of current page

var umbrella_editor = null;

var Datastore = require('nedb');
var db = {};
var data_path = app.getPath("appData");
db.notebooks = new Datastore({ filename: data_path + '/umbrella-note-data/umbrella-notebooks.db', autoload: true });
db.notes = new Datastore({ filename: data_path + '/umbrella-note-data/umbrella-notes.db', autoload: true });
db.remoteTasks = new Datastore({ filename: data_path + '/umbrella-note-data/remote-tasks.db', autoload: true });

db.notebooks.ensureIndex({ fieldName: 'title', unique: true });

setTimeout(toggleSpinner, 1000);

function updateNotebookPointer(s) {
    notebook_pointer = s;
}

function addslashes(string) {
    return string.replace(/\\/g, '\\\\').replace(/\u0008/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/'/g, '\\\'').replace(/"/g, '\\"');
}

function getTimestamp() {
    var t = new Date();
    return t.getTime();
}

function quicknotesInit() {
    db.notebooks.find({ title: 'Notebook One' }, function (err, docs) {
        if (err) {
            console.log('error finding the Notebook One file');
        } else {
            if (docs.length == 0) {
                console.log('notebook one does not exist, making new one');
                var d = new Date();
                var date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
                addNotebook('Notebook One', 'This is the default notebook. All the untagged posts are stored here.', 'img/1.jpg', date);
            }
        }
    });
}

$('button.close').on('click', function () {
    ipcRenderer.send('close-window');
});
$('button.maximize').on('click', function () {
    ipcRenderer.send('maximize-window');
    $('.app').addClass('maximized');
});
$('button.minimize').on('click', function () {
    ipcRenderer.send('minimize-window');
});

function postman() {
    $('.postman').toggleClass('open');
}

function showMessage(message) {
    $('.postman .body').html(message);
    postman();
    setTimeout(function () {
        $('.postman').removeClass('open');
    }, 7000);
}

function raven() {
    $('.raven').toggleClass('open');
}

function sendRaven(message) {
    $('.raven .body').html(message);
    raven();
    // setTimeout(() => {
    //     $('.raven').removeClass('open');
    // }, 300000);
}

function openPage(page) {
    //page is a jquery object
    for (var i = 0; i < pages.length; i++) {
        if (pages[i] == page) {
            pages[i].addClass('open');
        } else {
            pages[i].removeClass('open');
        }
    }
    page_pointer = page;
    switch (page) {
        case writePage:
            // $('#writePage .main-editor').html('<p>Write Here</p>')
            $('header .name').html(notebook_pointer);
            setUpKeyboardShortcuts('writePage');
            $('header .name').removeClass('athome');
            tinyMCE.activeEditor.focus();
            break;
        case editorPage:
            setUpKeyboardShortcuts('editorPage');
            $('header .name').removeClass('athome');
            tinyMCE.activeEditor.focus();
            break;
        case homePage:
            $('header .name').addClass('athome');
            $('header .name').html('Umbrella Note');
            displayNotebooks();
            closeNotebook();
            setUpKeyboardShortcuts('homePage');
            console.log('opened home page');
            break;
        case notebookPage:
            $('header .name').html(notebook_pointer);
            $('#notebookPage .posts').html('');
            setEditorToNotebook(notebook_pointer);
            db.notes.find({ notebook: notebook_pointer }).sort({ timestamp: 1 }).exec(function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    for (var _i = docs.length - 1; _i >= 0; _i--) {
                        // console.log(docs[i]);
                        var y = docs[_i];
                        // let x = '<div class="post"><div class="time">' + y.time + '</div><div class="date">' + y.date + '</div><div class="body">' + y.note + '</div><div class="expandButton" onclick="$(this).siblings().toggleClass(\'visible\');"><i data-feather="menu"></i></div><div class="box"><button onclick="openEditorPage(\'' + y._id + '\')" >Edit</button><button onclick="deleteNote(\'' + y._id + '\')">Delete</button></div></div>';
                        // let x = '<a class="post" onclick="openNote(\'' + y._id + '\')"><div class="time">' + y.time + '</div><div class="date">' + y.date + '</div></a>';
                        var excerpt = html2text(y.note).slice(0, 100);
                        var x = '<a class="post" onclick="openNote(\'' + y._id + '\')"><div class="time">' + y.time + '</div><div class="date">' + y.date + '</div><div class="excerpt">' + excerpt + '</div></a>';
                        $('#notebookPage .posts').append(x);
                    }
                    addColors(docs.length);
                    callAfterDisplayNotes();
                }
            });
            // $('#sidebar .icon').css("color","#FAFAFA") 
            setUpKeyboardShortcuts('notebookPage');
            $('header .name').removeClass('athome');
            break;
        case settingsPage:
            var notebooks_list = $('#settingsPage .notebooks-list');
            notebooks_list.html('');
            db.notebooks.find({}, function (err, docs) {
                for (var _i2 = 0; _i2 < docs.length; _i2++) {
                    // console.log(docs[i]);
                    var y = docs[_i2];
                    if (y.title == 'Notebook One') {
                        continue;
                    }
                    var slashed_title = addslashes(y.title);
                    var x = '<button onclick="toggleModal(\'.edit-notebook.modal\'); editNotebookModal(\'' + slashed_title + '\')" class="btn3 a">' + y.title + ' </button>';
                    notebooks_list.append(x);
                }
            });
            break;
    }
}

function editNotebookModal(title) {
    $('.edit-notebook.modal p').text(title);
    $('.edit-notebook.modal input[type=hidden]').val(title);
}

function openEditorPage(id) {
    // $('#notebookPage').removeClass('open')
    // editorPage.addClass('open')
    openPage(editorPage);
    $('#editPage input.noteId').val(id);
    db.notes.findOne({ _id: id }, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            $('#editPage .main-editor').html(doc.note);
            $('#editPage input.notebookTitle').val(doc.notebook);
            $('#editPage .header').html(doc.notebook);
        }
    });
}

function createNotebookModal() {
    if (!isModalUsedBefore) {
        for (var i = 0; i < covers.length; i++) {
            var x = '<li><input type="checkbox" class="cover-checkbox" value=' + covers[i] + ' id="cb' + i + '" /><label for="cb' + i + '"><img src=' + covers[i] + ' /></label></li>';
            $('.create-notebook-modal .covers ul').append(x);
        }
        isModalUsedBefore = true;
    }
    $('.create-notebook-modal').toggleClass('open');
}

function toggleModal(x) {
    $(x).toggleClass('open');
}

function toggleSpinner() {
    $('#loader').toggleClass('visible');
}

function showSignup() {
    ipcRenderer.send('show-signup-in-browser');
}

function setUpKeyboardShortcuts(page) {

    switch (page) {
        case 'homePage':
            Mousetrap.reset();
            Mousetrap.bind('f', function () {
                // console.log('f is pressed at homePage')
                openPage(writePage);
            });
            Mousetrap.bind('j', function () {
                // console.log('j is pressed at homePage')
                openPage(writePage);
            });
            break;
        case 'writePage':
            Mousetrap.reset();
            Mousetrap.bind('esc', function () {
                // console.log('esc is pressed at writePage')
                $('#notebookPage .posts').html('');
                openPage(notebookPage);
            });
            umbrella_editor = document.getElementsByClassName('main-editor');
            var writer_mousetrap = new Mousetrap(umbrella_editor[0]);
            writer_mousetrap.bind(['ctrl+s', 'command+s'], function () {
                // console.log('inside writepage section of setUpKeyboardShortcuts')
                $('#writePage form').submit();
                writer_mousetrap.unbind(['ctrl+s', 'command+s']);
            });
            writer_mousetrap.bind('esc', function () {
                // console.log('esc is pressed at writePage inside tinymce')
                $('#notebookPage .posts').html('');
                openPage(notebookPage);
                writer_mousetrap.unbind('esc');
            });
            break;
        case 'editorPage':
            Mousetrap.reset();
            Mousetrap.bind('esc', function () {
                // console.log('esc is pressed at editorpage')
                $('#notebookPage .posts').html('');
                openPage(notebookPage);
            });
            umbrella_editor = document.getElementsByClassName('main-editor');
            var editor_mousetrap = new Mousetrap(umbrella_editor[1]);
            editor_mousetrap.bind(['ctrl+s', 'command+s'], function () {
                $('#editPage form').submit();
                editor_mousetrap.unbind(['ctrl+s', 'command+s']);
            });
            editor_mousetrap.bind('esc', function () {
                // console.log('esc pressed at editorpage in tinymce')
                $('#notebookPage .posts').html('');
                openPage(notebookPage);
                editor_mousetrap.unbind('esc');
            });
            // console.log('editor page is opened')
            break;
        case 'notebookPage':
            // Mousetrap.reset()
            Mousetrap.bind('f', function () {
                // console.log('f is pressed at homePage')
                openPage(writePage);
            });
            Mousetrap.bind('j', function () {
                // console.log('j is pressed at homePage')
                openPage(writePage);
            });
            Mousetrap.bind('e', function () {
                openEditorPage(pointer_id_current_note);
            });
            Mousetrap.bind('esc', function () {
                openPage(homePage);
                // console.log('esc is pressed at notebookPage')
            });
            Mousetrap.bind(['ctrl+del', 'command+del'], function () {
                console.log('delete');
                deleteNote(pointer_id_current_note);
            });
            break;
    }
}

//GETTING USER INFORMATION
function getUser() {
    axios({
        method: 'get',
        url: pikachu + '/api/user',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.access_token
        }
    }).then(function (response) {
        console.log(response.data);
        localStorage.name = response.data.name;
        localStorage.premium = response.data.premium;
        localStorage.email = response.data.email;
        localStorage.id = response.data.id;
        updateUserDetailsView();
    });
}

//INITIALIZE UMBRELLA

function initUmbrella() {
    changeSignInStatus();
    updateUserDetailsView();
    quicknotesInit();
    displayNotebooks();
    if (navigator.onLine && localStorage.signedIn == 'true') {
        setTimeout(syncDatabaseUp, 5000);
    }

    // $('#sidebar .home').css("color", "#338fff")

    // $('#sidebar .icon').click(function(){
    //     $('#sidebar .icon').css("color", "#FAFAFA");
    //     $(this).css("color", "#338fff")
    // })
    // $('#sidebar .icon').click(function(){ $('#sidebar .icon').css("color", "white"); $(this).css("color", "#338fff")})
    initFonts();
    initThemes();

    $('#notebookPage .column-2').click(function () {
        openEditorPage(pointer_id_current_note);
    });

    console.log('umbrella initialized');
}

function changeSignInStatus() {
    if (localStorage.signedIn == 'true') {
        $('.signin-buttons').hide();
        $('.signout-buttons').show();
    } else {
        $('.signin-buttons').show();
        $('.signout-buttons').hide();
    }
}

function updateUserDetailsView() {
    if (localStorage.signedIn == 'false') {
        $('.username').html('');
        $('.email').html('');
    } else {
        $('.username').html(localStorage.name);
        $('.email').html(localStorage.email);
    }
}

initUmbrella();

//REMOTE FUNCTIONS 

async function doThisLater() {
    //adds tasks that need to be performed when online

    var task_p = await getPriority();

    // console.log('priority: ', task_p)

    var doc = {
        task: arguments[0],
        priority: task_p
    };

    switch (arguments[0]) {
        case 'CREATE_NOTEBOOK':
            doc.title = arguments[1];
            doc.summary = arguments[2];
            doc.cover = arguments[3];
            doc.time = arguments[4];
            break;
        case 'CREATE_NOTE':
            doc.notebook = arguments[1];
            doc.date = arguments[2];
            doc.time = arguments[3];
            doc.note = arguments[4];
            doc.localdb_id = arguments[5];
            doc.timestamp = arguments[6];
            break;
        case 'DELETE_NOTE':
            doc.note_id = arguments[1];
            break;
        case 'EDIT_NOTE':
            doc.note_id = arguments[1];
            doc.note = arguments[2];
    }

    db.remoteTasks.insert(doc, function (err, newDoc) {
        if (err) {
            console.log(err);
        } else {
            console.log(newDoc);
        }
    });
}

function getPriority() {
    return new Promise(function (resolve, reject) {
        db.remoteTasks.find({}, function (err, docs) {
            resolve(docs.length + 1);
        });
    });
}

function deleteThisRemoteTask(id) {
    db.remoteTasks.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) {
            console.log('err in removing the remote task from the local db', err);
        }
    });
}

function syncDatabaseUp() {
    //push changes to the remote server
    return new Promise(function (resolve, reject) {
        db.remoteTasks.find({}).sort({ priority: 1 }).exec(async function (err, docs) {
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                switch (doc.task) {
                    case 'CREATE_NOTEBOOK':
                        await createNotebookRemote(doc.title, doc.summary, doc.cover, doc.time);
                        deleteThisRemoteTask(doc._id);
                        break;
                    case 'CREATE_NOTE':
                        await createNoteRemote(doc.notebook, doc.date, doc.time, doc.note, doc.localdb_id, doc.timestamp);
                        deleteThisRemoteTask(doc._id);
                        break;
                    case 'DELETE_NOTE':
                        await deleteNoteRemote(doc.note_id);
                        deleteThisRemoteTask(doc._id);
                        break;
                    case 'EDIT_NOTE':
                        await editNoteRemote(doc.note_id, doc.note);
                        deleteThisRemoteTask(doc._id);
                }
            }
        });
        showMessage('Data saved to cloud.');
        resolve('data saved to cloud');
    });
}

async function createLocalDbFromRemoteDb() {
    //This function adds all the documents from the remote db to local db after login.
    //ONLY RUN WHEN LOCAL DB IS EMPTY.

    var notebooks = await getNotebooksRemote();

    for (var i = 0; i < notebooks.length; i++) {
        var notebook = notebooks[i];
        var obj = {
            title: notebook.title,
            summary: notebook.summary,
            cover: notebook.cover,
            time: notebook.time
        };

        if (notebook.title == 'Notebook One') {
            db.remoteTasks.remove({ title: 'Notebook One', task: 'CREATE_NOTEBOOK' }, {}, function (err, numRemoved) {
                if (err) {
                    console.log('err in removing the remote task from the local db', err);
                }
            });
            continue;
        }

        db.notebooks.insert(obj, function (err, newDoc) {
            if (err) {
                showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error</div>');
            } else {
                console.log("Insertion of notebook from remotedb to  localdb successful");
            }
        });
    }

    var notes = await getNotesRemote();

    for (var _i3 = 0; _i3 < notes.length; _i3++) {
        var note = notes[_i3];
        var obj = {
            _id: note.localdb_id,
            notebook: note.notebook,
            date: note.date,
            time: note.time,
            note: note.note,
            timestamp: note.timestamp
        };

        db.notes.insert(obj, function (err, newDoc) {
            if (err) {
                showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error</div>');
            } else {
                console.log("Insertion of note from remote db in localdb successful");
            }
        });
    }

    displayNotebooks();
    // displayQuickNotes();
}

function getNotebooksRemote() {
    return new Promise(function (resolve, reject) {
        axios({
            method: 'get',
            url: pikachu + '/api/notebooks',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.access_token
            }
        }).then(function (response) {
            console.log('gettin notebooks from remote server', response.data);
            resolve(response.data);
        }, function (err) {
            reject(err);
        });
    });
}

function getNotesRemote() {
    return new Promise(function (resolve, reject) {
        axios({
            method: 'get',
            url: pikachu + '/api/notes',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.access_token
            }
        }).then(function (response) {
            console.log('gettin notes from remote server', response.data);
            resolve(response.data);
        }, function (err) {
            reject(err);
        });
    });
}

function createNotebookRemote(title, summary, cover, time) {
    return axios({
        method: 'post',
        url: pikachu + '/api/new-notebook',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.access_token
        },
        data: {
            title: title,
            summary: summary,
            cover: cover,
            time: time
        }
    }).then(function (response) {
        console.log(response.data);
        if (response.data == 'success') {
            console.log('insertion successful at remote server');
        } else {
            console.log('some error');
            doThisLater('CREATE_NOTEBOOK', title, summary, cover, time);
        }
    }, function (err) {
        console.log('some error');
        doThisLater('CREATE_NOTEBOOK', title, summary, cover, time);
    });
}

function createNoteRemote(notebook, date, time, note, localdb_id, timestamp) {
    return axios({
        method: 'post',
        url: pikachu + '/api/new-note',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.access_token
        },
        data: {
            notebook: notebook,
            date: date,
            time: time,
            note: note,
            localdb_id: localdb_id, //this is id of note in the localdb
            timestamp: timestamp
        }
    }).then(function (response) {
        console.log(response.data);
        if (response.data == 'success') {
            console.log('insertion successful at remote server');
        } else {
            console.log('some error');
            doThisLater('CREATE_NOTE', notebook, date, time, note, localdb_id);
        }
    }, function (err) {
        console.log('some error');
        doThisLater('CREATE_NOTE', notebook, date, time, note, localdb_id);
    });
}

function deleteNoteRemote(localdb_id) {
    return axios({
        method: 'post',
        url: pikachu + '/api/delete-note',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.access_token
        },
        data: {
            localdb_id: localdb_id
        }
    }).then(function (response) {
        console.log(response.data);
        if (response.data == 'success') {
            console.log('deletion successful at remote server');
        } else {
            console.log('some error in deletion at remote server');
            doThisLater('DELETE_NOTE', localdb_id);
        }
    }, function (err) {
        console.log('some error in deletion at remote server');
        doThisLater('DELETE_NOTE', localdb_id);
    });
}

function editNoteRemote(localdb_id, note) {
    return axios({
        method: 'post',
        url: pikachu + '/api/edit-note',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.access_token
        },
        data: {
            localdb_id: localdb_id,
            note: note
        }
    }).then(function (response) {
        console.log(response.data);
        if (response.data == 'success') {
            console.log('edition successful at remote server');
        } else {
            console.log('some error in edition at remote server');
            doThisLater('EDIT_NOTE', localdb_id, note);
        }
    }, function (err) {
        console.log('some error in edition at remote server');
        doThisLater('EDIT_NOTE', localdb_id, note);
    });
}

function deleteNotebook(event) {
    event.preventDefault();
    var title = $('.edit-notebook.modal input[type=hidden]').val();
    if (localStorage.signedIn == 'false' || localStorage.signedIn == null) {
        db.notebooks.remove({ title: title }, {}, function (err, numRemoved) {});
        db.notes.remove({ notebook: title }, { multi: true });
        db.remoteTasks.remove({ task: 'CREATE_NOTEBOOK', title: title }, {});
        db.remoteTasks.remove({ notebook: title }, {});
        showMessage('Notebook deleted');
        displayNotebooks();
        openPage(settingsPage);
    } else if (navigator.onLine && localStorage.signedIn == 'true') {
        db.notebooks.remove({ title: title }, {}, function (err, numRemoved) {});
        db.notes.remove({ notebook: title }, { multi: true });

        axios({
            method: 'post',
            url: pikachu + '/api/delete-notebook',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.access_token
            },
            data: {
                title: title
            }
        });
        displayNotebooks();
        openPage(settingsPage);
        showMessage('Notebook deleted');
    } else {
        showMessage('You can only delete a notebook when online');
    }
    toggleModal('.edit-notebook.modal');
}

function editNotebook(event) {
    event.preventDefault();
    var old_title = $('.edit-notebook.modal input[type=hidden]').val();
    var new_title = $('.edit-notebook.modal input[type=text]').val();

    if (localStorage.signedIn == 'false') {
        db.notebooks.update({ title: old_title }, { $set: { title: new_title } });
        db.notes.update({ notebook: old_title }, { $set: { notebook: new_title } }, { multi: true });
        db.remoteTasks.update({ title: old_title }, { $set: { title: new_title } }, { multi: true });
        db.remoteTasks.update({ notebook: old_title }, { $set: { notebook: new_title } }, { multi: true });
        showMessage('Notebook deleted');
        displayNotebooks();
        openPage(settingsPage);
    }
    if (navigator.onLine && localStorage.signedIn == 'true') {

        axios({
            method: 'post',
            url: pikachu + '/api/edit-notebook',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.access_token
            },
            data: {
                new_title: new_title,
                old_title: old_title
            }
        }).then(function () {
            db.notebooks.update({ title: old_title }, { $set: { title: new_title } }, function (err, numReplaced) {
                displayNotebooks();
                openPage(settingsPage);
            });
            db.notes.update({ notebook: old_title }, { $set: { notebook: new_title } }, { multi: true });
            db.remoteTasks.update({ title: old_title }, { $set: { title: new_title } }, { multi: true });
            db.remoteTasks.update({ notebook: old_title }, { $set: { notebook: new_title } }, { multi: true });
        }, function (err) {
            showMessage(err);
        });
    } else {
        showMessage('You can only edit a notebook when online');
    }
    toggleModal('.edit-notebook.modal');
}

ipcRenderer.on('message', function (event, text) {
    console.log('Message from app.js:', text);
    if (text == 'update-downloaded') {
        sendRaven('<button class="update" onclick="update()">Update Software</button>');
    }
});

function update() {
    console.log('going to update now.');
    ipcRenderer.send('update-now');
}