'use strict';

var axios = require('axios');
var fs = require('fs');
var $ = require('jquery');

var _require = require('electron'),
    ipcRenderer = _require.ipcRenderer;

var app = require('electron').remote.app;

var dialog = require('electron').remote.dialog;

var months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
var days = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
var covers = ["img/1.jpg", "img/2.jpeg", "img/3.jpg", "img/4.png", "img/13.jpeg", "img/14.jpeg", "img/15.jpeg", "img/16.jpeg", "img/17.jpeg", "img/18.jpeg", "img/19.jpeg", "img/20.jpeg", "img/21.jpg"];
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
// let data_path = app.getPath("appData")
var data_path = null;

setTimeout(toggleSpinner, 1000);

initUmbrella();

function setUpDatabases() {
    console.log('setting up databases');
    data_path = localStorage.db_location;
    db = {};
    db.notebooks = new Datastore({
        filename: data_path + '/umbrella-note/umbrella-notebooks.db'
    });
    db.notes = new Datastore({ filename: data_path + '/umbrella-note/umbrella-notes.db' });
    db.remoteTasks = new Datastore({ filename: data_path + '/umbrella-note/remote-tasks.db' });

    db.notes.loadDatabase(function (e) {
        if (e) {
            console.log("some error, loading notes db again");
            setUpDatabases();
            displayNotebooks();
        }
    });
    db.remoteTasks.loadDatabase(function (e) {
        if (e) {
            console.log("some error, loading remote db again");
            setUpDatabases();
            displayNotebooks();
        }
    });
    db.notebooks.loadDatabase(function (e) {
        if (e) {
            console.log("some error, loading notebooks db again");
            setUpDatabases();
            displayNotebooks();
        }
    });

    console.log('databases are set');
}

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
                var intro_note = "<h1>Welcome to the Umbrella Note</h1>\n<p>To create new notebook click the notebook icon on your left. To write in a particular notebook, just open the notebook and click the feather icon at the lower right corner.</p>\n<h2>Keyboard Shortcuts</h2>\n<p><span style=\"background-color: inherit;\"><strong>Up, Down</strong> arrow keys for changing notes.</span></p>\n<p><strong>'f' or 'j'</strong> key for new note.</p>\n<p><strong>'esc'</strong> &nbsp;for returning back.</p>\n<p><strong>'ctrl+d'</strong> to delete a note.&nbsp;</p>\n<p><strong style=\"background-color: inherit;\">'command+d'</strong><span style=\"background-color: inherit;\"> to delete a note on mac</span></p>\n<p><strong>'e'</strong>&nbsp;to edit a note</p>\n<p>'<strong>ctrl+s'</strong>&nbsp; to save the note</p>\n<h2>&nbsp;How to save and sync data with dropbox, google drive or one drive</h2>\n<ol>\n<li>Install dropbox or google drive to your computer.</li>\n<li>Set the umbrella note data folder to the dropbox( or google drive ) folder in the settings.</li>\n</ol>";
                addNote('Notebook One', date, d.toLocaleTimeString(), intro_note);
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
            console.log('opened home page!');
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
            $('.path-wrap .db-location-tag').html(localStorage.db_location);
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
                    var x = '<button onclick="toggleModal(\'.edit-notebook.modal\'); editNotebookModal(\'' + y._id + '\')" class="btn3 a">' + y.title + ' </button>';
                    notebooks_list.append(x);
                }
            });
            break;
    }
}

function editNotebookModal(notebook_id) {
    db.notebooks.findOne({ _id: notebook_id }, function (err, doc) {
        if (err) {
            showMessage('Please try again later');
        } else {
            $('.edit-notebook.modal p').text(doc.title);
            $('.edit-notebook.modal input[type=hidden]').val(doc.title);
        }
    });
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

function selectFolder(x) {
    var path = dialog.showOpenDialog({ properties: ['openDirectory'] });
    $(x).val(path);
}

function initializerModal(x) {
    switch (x) {
        case 'yes':
            $('.view1').hide();
            $('#initializer-yes').show();
            break;
        case 'no':
            $('.view1').hide();
            $('#initializer-no').show();
            break;
        case 'back':
            $('.view2').hide();
            $('.view1').show();
            break;
    }
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
                // $('#notebookPage .posts').html('');
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
                // $('#notebookPage .posts').html('');
                openPage(notebookPage);
                writer_mousetrap.unbind('esc');
            });
            break;
        case 'editorPage':
            Mousetrap.reset();
            Mousetrap.bind('esc', function () {
                // console.log('esc is pressed at editorpage')
                // $('#notebookPage .posts').html('');
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
                // $('#notebookPage .posts').html('');
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
            Mousetrap.bind(['ctrl+d', 'command+d'], function () {
                console.log('delete');
                deleteNote(pointer_id_current_note);
            });
            break;
    }
}

function initNewUser(event) {
    event.preventDefault();
    toggleModal('.initializer-modal');
    var path = $('#initializer-yes input.db-location').val();
    console.log(path);
    var user_name = $('#initializer-yes input[name="user_name"]').val();
    console.log(user_name);
    localStorage.db_location = path;
    localStorage.name = user_name;
    showMessage('Welcome ' + user_name);
    initUmbrella();
}

function initOldUser(event) {
    event.preventDefault();
    toggleModal('.initializer-modal');
    var path = $('#initializer-no input.db-location').val();
    console.log(path);
    var user_name = $('#initializer-no input[name="user_name"]').val();
    console.log(user_name);
    localStorage.db_location = path;
    localStorage.name = user_name;
    showMessage('Welcome ' + user_name);
    initUmbrella();
}
function changeDbLocation(event) {
    event.preventDefault();
    toggleModal('.change-db-path-modal');
    var path = $('.change-db-path-modal input.db-location').val();
    console.log(path);
    var user_name = $('.change-db-path-modal input[name="user_name"]').val();
    console.log(user_name);
    localStorage.db_location = path;
    localStorage.name = user_name;
    showMessage('Welcome ' + user_name);
    initUmbrella();
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
    if (localStorage.db_location == null || localStorage.db_location == '') {
        toggleModal('.initializer-modal');
    } else {
        setUpDatabases();
        // changeSignInStatus() 
        updateUserDetailsView();
        quicknotesInit();
        openPage(homePage);
        // displayNotebooks();
        // if(navigator.onLine && (localStorage.signedIn=='true')){
        //     setTimeout(syncDatabaseUp,5000)
        // }
        initFonts();
        initThemes();

        // $('#notebookPage .column-2').click(()=>{
        //     openEditorPage(pointer_id_current_note)        
        // })        
    }
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