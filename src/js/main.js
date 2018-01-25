const axios = require('axios')
var fs = require('fs');
let $ = require('jquery')
const {ipcRenderer} = require('electron')
const {app} = require('electron').remote
// const app = electron.app
// let ipcRenderer = electron.ipcRenderer


let months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
let days = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
let covers = [
    "img/1.jpg",
    "img/2.jpeg",
    "img/3.jpg",
    "img/4.png",
    "img/13.jpeg",
    "img/14.jpeg"
];
let isModalUsedBefore = false;
let notebooksView = $('#homePage .notebooks');
let quicknotesView = $('#quicknotesPage .quicknotes');

let activeNotebook = 'Notebook One'

//PAGES
let homePage = $('#homePage')
let writePage = $('#writePage')
let notebookPage = $('#notebookPage')
let editorPage = $('#editPage')
let settingsPage = $('#settingsPage')
let quicknotesPage = $('#quicknotesPage')
let pages = [homePage,writePage,notebookPage,editorPage,settingsPage]

var Datastore = require('nedb')
let db = {};
let data_path = app.getPath("appData")
db.notebooks = new Datastore({ filename: data_path+'/umbrella-note-data/umbrella-notebooks.db', autoload: true });
db.notes = new Datastore({ filename: data_path+'/umbrella-note-data/umbrella-notes.db', autoload: true });
db.remoteTasks = new Datastore({ filename: data_path+'/umbrella-note-data/remote-tasks.db', autoload: true });

db.notebooks.ensureIndex({ fieldName: 'title', unique: true });

setTimeout(toggleSpinner, 2000)

function newNote(event) {
    event.preventDefault();
    var d = new Date();
    let notebook = $('#writePage form input.notebookTitle').val();
    let date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
    let time = d.toLocaleTimeString();
    let note = tinymce.activeEditor.getContent();
    // console.log(note);
    addNote(notebook, date, time, note);
    displayNotes();
}

function createNotebook(event){
    event.preventDefault();
    let title = $('.create-notebook-modal form input[name=title]').val();
    // console.log(title);
    let summary = $('.create-notebook-modal form textarea').val();
    let coverImage = $('.cover-checkbox:checked').val();
    var d = new Date();
    let date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
    addNotebook(title, summary, coverImage, date);
}

function getTimestamp(){
    let t = new Date()
    return t.getTime()
}

async function addNote(notebookTitle, noteDate, noteTime, noteBody) {
    
    let timestamp = getTimestamp()

    var obj = {
        notebook: notebookTitle,
        date: noteDate,
        time: noteTime,
        note: noteBody,
        timestamp: timestamp //this is the position of the note for the purpose of sorting
    };

    db.notes.insert(obj, function(err,newDoc){
        if(err){
            showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error</div>');
        }
        else{
            showMessage('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');
            openPage(homePage);
            if(navigator.onLine && (localStorage.signedIn=='true')){
                createNoteRemote(notebookTitle, noteDate, noteTime, noteBody, newDoc._id, timestamp)
            }else{
                doThisLater('CREATE_NOTE', notebookTitle, noteDate, noteTime, noteBody, newDoc._id, timestamp)
            }
        }
    });
}

function addNotebook(notebookTitle, notebookSummary, coverUrl, createdOn) {
    var obj = {
        title: notebookTitle,
        summary: notebookSummary,
        cover: coverUrl,
        time: createdOn
    };

    db.notebooks.insert(obj, function(err,newDoc){
        if(err){
            showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error</div>');
        }
        else{
            // console.log("Insertion in DB successful");
            createNotebookModal();
            displayNotebooks();
            showMessage('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');

            if(navigator.onLine && (localStorage.signedIn=='true')){
                createNotebookRemote(notebookTitle, notebookSummary, coverUrl, createdOn)
            }else{
                doThisLater('CREATE_NOTEBOOK', notebookTitle, notebookSummary, coverUrl, createdOn)
            }

        }
    });
}

function displayQuickNotes() {
    quicknotesView.html('');
    db.notes.find({ notebook: 'Notebook One' }).sort({timestamp: 1}).exec((err,docs)=>{
        if(err){
            console.log(err);
        }
        else{
            for(let i=docs.length-1; i>=0; i--){
                let y = docs[i];
                let x = '<div class="note"><div class="body">' + y.note + '</div><div class="expandButton" onclick="$(this).siblings().toggleClass(\'visible\');"><i data-feather="menu"></i></div><div class="box"><button onclick="openEditorPage(\'' + y._id + '\')" >Edit</button><button onclick="deleteNote(\'' + y._id + '\')">Delete</button></div></div>';
                quicknotesView.append(x);
            }
            addColorsToQuicknotes(docs.length)
            callAfterDisplayNotes()
        }
    })
}

function displayNotebooks(){
    notebooksView.html('');
    db.notebooks.find({},(err,docs)=>{
        if(err){
            console.log(err);
        }
        else{
            for(let i=0; i<docs.length; i++){
                // console.log(docs[i]);
                let y = docs[i];
                let x = '<div class="notebook"><a onclick="openNotebook(\'' + y.title + '\','+i+')"><div class="cover"><img src=' + y.cover + '></div><div class="description"><div class="title">' + y.title + '</div><div class="created">'+ y.time + '</div><div class="summary">' + y.summary + '</div><button class="btn1">Open</button></div></a></div>';
                notebooksView.append(x);
            }
            callAfterDisplayNotes()
        }
    });
}

function quicknotesInit(){
    db.notebooks.find({ title: 'Notebook One' }, function(err,docs){
        if(err){
            console.log('error finding the Notebook One file');
        }else{
            if( docs.length == 0 ){
                console.log('notebook one does not exist, making new one');
                var d = new Date();
                let date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
                addNotebook('Notebook One', 'This is the default notebook. All the untagged posts are stored here.', 'img/1.jpg',date);
            }
        }
    });        
}

$('button.close').on('click', () => {
    ipcRenderer.send('close-window');
})
$('button.maximize').on('click', () => {
    ipcRenderer.send('maximize-window');
    $('.app').addClass('maximized');
})
$('button.minimize').on('click', () => {
    ipcRenderer.send('minimize-window');
})

function postman() {
    $('.postman').toggleClass('open');
}

function showMessage(message) {
    $('.postman .body').html(message);
    postman();
    setTimeout(() => {
        $('.postman').removeClass('open');
    }, 7000);
}

function raven(){
    $('.raven').toggleClass('open')
}

function sendRaven(message) {
    $('.raven .body').html(message);
    raven();
    // setTimeout(() => {
    //     $('.raven').removeClass('open');
    // }, 300000);
}

function toggleWritePage() {
    // $('#writePage').toggleClass('open');
    // $('#homePage').toggleClass('open');
    openPage(writePage)
    $('#writePage .main-editor').html('<p>Write Here</p>')
}


function openPage(page){
    for(let i=0;i<pages.length;i++){
        if(pages[i]==page){
            pages[i].addClass('open');
        }else{
            pages[i].removeClass('open');
        }
    }
    if(page == homePage)
        setEditorToNotebook('Notebook One');
    if(page == writePage)
        $('#writePage .main-editor').html('<p>Write Here</p>')
    
    callAfterDisplayNotes()

    if(page == settingsPage){
        let notebooks_list = $('#settingsPage .notebooks-list')
        notebooks_list.html('')
        db.notebooks.find({}, function(err,docs){
            for(let i=0; i<docs.length; i++){
                // console.log(docs[i]);
                let y = docs[i];
                if(y.title == 'Notebook One'){
                    continue
                }
                let x = '<button onclick="toggleModal(\'.edit-notebook.modal\'); editNotebookModal(\''+y.title+'\')" class="btn3 a">' + y.title + ' </button>'
                notebooks_list.append(x);
            }
        })
    }

}

function editNotebookModal(title){
    $('.edit-notebook.modal p').text(title)
    $('.edit-notebook.modal input[type=hidden]').val(title)
}

function openEditorPage(id){
    editorPage.addClass('open')
    $('#editPage input.noteId').val(id)
    db.notes.findOne({_id: id}, function(err,doc){
        if(err){
            console.log(err)
        }else{
            $('#editPage .main-editor').html(doc.note)
            $('#editPage input.notebookTitle').val(doc.notebook)
            $('#editPage .header').html(doc.notebook)
        }
    })
}

function editNote(event){
    event.preventDefault()
    let id = $('#editPage input.noteId').val()
    let note = tinymce.activeEditor.getContent()
    let notebook = $('#editPage input.notebookTitle').val()
    db.notes.update({ _id: id }, { $set: {note: note} }, function(err, numReplaced){
        if(err){
            console.log(err)
        }else{
            showMessage('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');
            if(navigator.onLine && (localStorage.signedIn=='true')){
                editNoteRemote(id, note)
            }else{
                doThisLater('EDIT_NOTE', id, note)
            }
        }
    })
    openPage(notebookPage);
    displayNotes();
        
    $('#sidebar .icon').css('color','#FAFAFA')
}

function createNotebookModal() {
    if (!isModalUsedBefore) {
        for (let i = 0; i < covers.length; i++) {
            let x = '<li><input type="checkbox" class="cover-checkbox" value=' + covers[i] + ' id="cb' + i + '" /><label for="cb' + i + '"><img src=' + covers[i] + ' /></label></li>';
            $('.create-notebook-modal .covers ul').append(x);
        }
        isModalUsedBefore = true;
    }
    $('.create-notebook-modal').toggleClass('open');
}


function openNotebook(notebookTitle,index){
    activeNotebook = notebookTitle
    $('#notebookPage .header').html(notebookTitle);
    $('#notebookPage .posts').html('');
    openPage(notebookPage);
    setEditorToNotebook(notebookTitle);
    db.notes.find({ notebook : notebookTitle }).sort({timestamp: 1}).exec((err,docs)=>{
        if(err){
            console.log(err);
        }
        else{
            for(let i=docs.length-1; i>=0; i--){
                // console.log(docs[i]);
                let y = docs[i];
                let x = '<div class="post"><div class="time">' + y.time + '</div><div class="date">' + y.date + '</div><div class="body">' + y.note + '</div><div class="expandButton" onclick="$(this).siblings().toggleClass(\'visible\');"><i data-feather="menu"></i></div><div class="box"><button onclick="openEditorPage(\'' + y._id + '\')" >Edit</button><button onclick="deleteNote(\'' + y._id + '\')">Delete</button></div></div>';                
                $('#notebookPage .posts').append(x);
            }
            addColors(docs.length)
            callAfterDisplayNotes()
        }
    });
    $('#sidebar .icon').css("color","#FAFAFA")        
}

function displayNotes() {
    
    $('#notebookPage .posts').html('');
    db.notes.find({ notebook : activeNotebook }).sort({timestamp: 1}).exec((err,docs)=>{
        if(err){
            console.log(err);
        }
        else{
            for(let i=docs.length-1; i>=0; i--){
                // console.log(docs[i]);
                let y = docs[i];
                let x = '<div class="post"><div class="time">' + y.time + '</div><div class="date">' + y.date + '</div><div class="body">' + y.note + '</div><div class="expandButton" onclick="$(this).siblings().toggleClass(\'visible\');"><i data-feather="menu"></i></div><div class="box"><button onclick="openEditorPage(\'' + y._id + '\')" >Edit</button><button onclick="deleteNote(\'' + y._id + '\')">Delete</button></div></div>';                
                $('#notebookPage .posts').append(x);
                
            }
            addColors(docs.length)
            callAfterDisplayNotes()
        }
    });
}

function setEditorToNotebook(i){
    $('#writePage form input.notebookTitle').val(i); 
    $('#writePage .header').html(i)
}

function deleteNote(id){
    db.notes.remove({ _id: id }, {}, function(err,numRemoved){
        if(err){
            console.log(err)
        }else{
            // console.log(numRemoved)
            if(navigator.onLine && (localStorage.signedIn=='true')){
                deleteNoteRemote(id)
            }else{
                doThisLater('DELETE_NOTE', id)
            }
        }
    })
    
    displayNotes()

}

function callAfterDisplayNotes(){
    feather.replace()
}

function toggleModal(x) {
    $(x).toggleClass('open');
}

function toggleSpinner(){
    $('#loader').toggleClass('visible')
}

function showSignup(){
    ipcRenderer.send('show-signup-in-browser');
}



//AUTHENTICATION - USER LOGIN/SIGNUP

function signInUser(event){
    toggleSpinner()
    event.preventDefault();
    let email = $('.signin.modal input.email').val()
    let password = $('.signin.modal input.password').val()
    console.log(email, password)
    axios({
        method: 'post',
        url: pikachu + '/oauth/token',
        data: {
            grant_type: 'password',
            client_id: client_id,
            client_secret: client_secret,
            username: email,
            password: password,
            scope: ''
        }
    }).then(function(response){
        if(response.status == 200){
            localStorage.access_token = response.data.access_token
            console.log(response.data.access_token)
            showMessage('<img src="img/emojis/happy.svg"><div class="emoji-text">Login Successful!</div>');
            toggleModal('.signin.modal')
            localStorage.signedIn = 'true'
            getUser()
            changeSignInStatus()
            createLocalDbFromRemoteDb()            
        }
        toggleSpinner()
    }).catch((error)=>{
        showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Unable to login</div>')
        toggleSpinner()
    })  
}

function logoutUser(){

    toggleSpinner()
    axios({
        method: 'post',
        url: pikachu + '/api/logout',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+ localStorage.access_token
        },
        data: {
            client_id: client_id
        }
    }).then(function(response){
        console.log(response.data)
        localStorage.signedIn = 'false'
        localStorage.access_token = ' '
        showMessage('Logged Out');
        changeSignInStatus()
        updateUserDetailsView() 

        db.remoteTasks.remove({}, {multi: true}, function(err,numRemoved){

        });
        db.notebooks.remove({}, {multi: true}, function(err,numRemoved){
            displayNotebooks()
        });
        db.notes.remove({}, {multi: true}, function(err,numRemoved){
            displayQuickNotes()
        });

        var d = new Date();
        let date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
        
        var obj = {
            title: 'Notebook One',
            summary: 'This is the default notebook. All the untagged posts are stored here.',
            cover: 'img/1.jpg',
            time: date
        };        

        db.notebooks.insert(obj, function(err,newDoc){
            doThisLater('CREATE_NOTEBOOK', 'Notebook One', 'This is the default notebook. All the untagged posts are stored here.', 'img/1.jpg', date)
        })
        toggleSpinner()
    })    
}

//GETTING USER INFORMATION
function getUser(){
    axios({
        method: 'get',
        url: pikachu + '/api/user',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+ localStorage.access_token
        }
    }).then(function(response){
        console.log(response.data)
        localStorage.name = response.data.name 
        localStorage.premium = response.data.premium 
        localStorage.email = response.data.email
        localStorage.id = response.data.id
        updateUserDetailsView() 
    })
}

//INITIALIZE UMBRELLA

function initUmbrella(){
    changeSignInStatus()
    updateUserDetailsView()
    quicknotesInit();
    displayNotebooks();
    if(navigator.onLine && (localStorage.signedIn=='true')){
        setTimeout(syncDatabaseUp,5000)
    }
    console.log('umbrella initialized')

    $('#sidebar .home').css("color", "#338fff")

    $('#sidebar .icon').click(function(){
        $('#sidebar .icon').css("color", "#FAFAFA");
        $(this).css("color", "#338fff")
    })
    // $('#sidebar .icon').click(function(){ $('#sidebar .icon').css("color", "white"); $(this).css("color", "#338fff")})
    initFonts()
    initThemes()
}

function changeSignInStatus(){
    if(localStorage.signedIn == 'true'){
        $('.signin-buttons').hide()
        $('.signout-buttons').show()
    }else{
        $('.signin-buttons').show()
        $('.signout-buttons').hide()
    }
}

function updateUserDetailsView(){
    if(localStorage.signedIn == 'false'){
        $('.username').html('')
        $('.email').html('')
    }else{
        $('.username').html(localStorage.name)
        $('.email').html(localStorage.email)
    }
}

initUmbrella()

//COLORS
let color_palette_1 = ['#EFBC69','#F1B56C','#F3A86D', '#F49A6E', '#F58D70', '#F67F71','#F77272','#F67F71']
let color_palette_2 = ['#58C2E2', '#5CB3E1', '#60A5DF', '#6596DE', '#6988DC', '#6D79DB']
let color_palette_3 = ['#171019', '#1E1621', '#251B29', '#2D2031', '#342539', '#3B2B41', '#433049', '#513A59', '#604B68','#705D77']
let color_palette_4 = ['#8C3A42', '#A3434D', '#BA4D58', '#D15663', '#E8606E', '#FF6978']
let color_palette_default = ['#FAFAFA', '#ffffff', '#FAFAFA', '#ffffff']

// let palettes = [color_palette_1, color_palette_2, color_palette_3, color_palette_4]
let palettes = [color_palette_default]

// function addColors(n){
//     let y = 0
//     let z
//     let color_palette = palettes[getRndInteger(0,palettes.length)]
//     for(let i=0; i<n; i++){
//         if(y==0){
//             z = 1
//         }
//         if(y==color_palette.length-1){
//             z = -1
//             y = y-2
//         }
//         $('.post').eq(i).css("background", color_palette[y])
//         y = y+z
//     }
// }

function addColors(n){
    for(let i=0; i<n; i=i+2){
        $('.post').eq(i).addClass('color')
    }    
}

function getRndInteger(min, max) { //min included, max excluded
    return Math.floor(Math.random() * (max - min) ) + min;
}

function addColorsToQuicknotes(n){
    let y = 0
    let z
    let color_palette = color_palette_1
    for(let i=0; i<n; i++){
        if(y==0){
            z = 1
        }
        if(y==color_palette.length-1){
            z = -1
            y = y-2
        }
        $('.note').eq(i).css("background", color_palette[y])
        y = y+z
    }
}

//REMOTE FUNCTIONS 

async function doThisLater(){ //adds tasks that need to be performed when online
    
    let task_p = await getPriority()

    // console.log('priority: ', task_p)

    let doc = {
        task: arguments[0],
        priority: task_p
    }

    switch(arguments[0]){
        case 'CREATE_NOTEBOOK':
            doc.title = arguments[1]
            doc.summary = arguments[2]
            doc.cover = arguments[3]
            doc.time = arguments[4]
            break
        case 'CREATE_NOTE':
            doc.notebook = arguments[1]
            doc.date = arguments[2] 
            doc.time = arguments[3]
            doc.note = arguments[4]
            doc.localdb_id = arguments[5]
            doc.timestamp = arguments[6]
            break 
        case 'DELETE_NOTE': 
            doc.note_id = arguments[1]
            break 
        case 'EDIT_NOTE':
            doc.note_id = arguments[1]
            doc.note = arguments[2]                 
    }
    
    db.remoteTasks.insert(doc, (err, newDoc)=>{
        if(err){
            console.log(err)
        }else{
            console.log(newDoc)
        }
    })
}

function getPriority(){
    return new Promise((resolve, reject)=>{
        db.remoteTasks.find({}, (err,docs)=>{
            resolve(docs.length + 1)
        })
    })
}

function deleteThisRemoteTask(id){
    db.remoteTasks.remove({_id: id}, {}, (err,numRemoved)=>{
        if(err){
            console.log('err in removing the remote task from the local db',err)
        }
    })
}

function syncDatabaseUp(){ //push changes to the remote server
    return new Promise((resolve,reject)=>{
        db.remoteTasks.find({}).sort({priority: 1}).exec(async (err,docs)=>{
            for(let i=0; i<docs.length; i++){
                let doc = docs[i]
                switch(doc.task){
                    case 'CREATE_NOTEBOOK':
                        await createNotebookRemote(doc.title, doc.summary, doc.cover, doc.time)
                        deleteThisRemoteTask(doc._id)
                        break
                    case 'CREATE_NOTE':
                        await createNoteRemote(doc.notebook, doc.date, doc.time, doc.note, doc.localdb_id, doc.timestamp)
                        deleteThisRemoteTask(doc._id)
                        break 
                    case 'DELETE_NOTE':
                        await deleteNoteRemote(doc.note_id) 
                        deleteThisRemoteTask(doc._id)
                        break 
                    case 'EDIT_NOTE':
                        await editNoteRemote(doc.note_id, doc.note)
                        deleteThisRemoteTask(doc._id)
                }
            }
        })
        showMessage('Data saved to cloud.')
        resolve('data saved to cloud')
    })
}

async function createLocalDbFromRemoteDb(){
    //This function adds all the documents from the remote db to local db after login.
    //ONLY RUN WHEN LOCAL DB IS EMPTY.

    let notebooks = await getNotebooksRemote()

    for(let i=0; i<notebooks.length; i++){
        let notebook = notebooks[i]
        var obj = {
            title: notebook.title,
            summary: notebook.summary,
            cover: notebook.cover,
            time: notebook.time
        };

        if(notebook.title == 'Notebook One'){
            db.remoteTasks.remove({title: 'Notebook One', task: 'CREATE_NOTEBOOK'}, {}, (err,numRemoved)=>{
                if(err){
                    console.log('err in removing the remote task from the local db',err)
                }
            })
            continue
        }

        db.notebooks.insert(obj, function(err,newDoc){
            if(err){
                showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error</div>');
            }
            else{
                console.log("Insertion of notebook from remotedb to  localdb successful");
            }
        });
    }

    let notes = await getNotesRemote()

    for(let i=0; i<notes.length; i++){
        let note = notes[i]
        var obj = {
            _id: note.localdb_id,
            notebook: note.notebook,
            date: note.date,
            time: note.time,
            note: note.note,
            timestamp: note.timestamp
        };

        db.notes.insert(obj, function(err,newDoc){
            if(err){
                showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Error</div>');
            }
            else{
                console.log("Insertion of note from remote db in localdb successful");
            }
        });
    }

    displayNotebooks()
    // displayQuickNotes();

}

function getNotebooksRemote(){
    return new Promise((resolve,reject)=>{
        axios({
            method: 'get',
            url: pikachu + '/api/notebooks',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+ localStorage.access_token
            }
        }).then(function(response){
            console.log('gettin notebooks from remote server',response.data)
            resolve(response.data)
        }, (err)=>{
            reject(err)
        })
    })
}

function getNotesRemote(){
    return new Promise((resolve,reject)=>{
        axios({
            method: 'get',
            url: pikachu + '/api/notes',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+ localStorage.access_token
            }
        }).then(function(response){
            console.log('gettin notes from remote server',response.data)
            resolve(response.data)
        }, (err)=>{
            reject(err)
        })
    })
}

function createNotebookRemote(title, summary, cover, time){
    return axios({
        method: 'post',
        url: pikachu + '/api/new-notebook',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+ localStorage.access_token
        },
        data: {
            title: title,
            summary: summary,
            cover: cover,
            time: time
        }
    }).then(function(response){
        console.log(response.data)
        if(response.data == 'success'){
            console.log('insertion successful at remote server')
        }else{
            console.log('some error')
            doThisLater('CREATE_NOTEBOOK', title, summary, cover, time)
        }
    }, (err)=>{
        console.log('some error')
        doThisLater('CREATE_NOTEBOOK', title, summary, cover, time)
    })    
}


function createNoteRemote(notebook, date, time, note, localdb_id, timestamp){
    return axios({
        method: 'post',
        url: pikachu + '/api/new-note',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+ localStorage.access_token
        },
        data: {
            notebook: notebook,
            date: date,
            time: time,
            note: note,
            localdb_id: localdb_id, //this is id of note in the localdb
            timestamp: timestamp
        }
    }).then(function(response){
        console.log(response.data)
        if(response.data == 'success'){
            console.log('insertion successful at remote server')
        }else{
            console.log('some error')
            doThisLater('CREATE_NOTE', notebook, date, time, note, localdb_id)
        }
    }, (err)=>{
        console.log('some error')
        doThisLater('CREATE_NOTE', notebook, date, time, note, localdb_id)
    })
}

function deleteNoteRemote(localdb_id){
    return axios({
        method: 'post',
        url: pikachu + '/api/delete-note',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+ localStorage.access_token
        },
        data: {
            localdb_id: localdb_id
        }
    }).then(function(response){
        console.log(response.data)
        if(response.data == 'success'){
            console.log('deletion successful at remote server')
        }else{
            console.log('some error in deletion at remote server')
            doThisLater('DELETE_NOTE', localdb_id)
        }
    }, (err)=>{
        console.log('some error in deletion at remote server')
        doThisLater('DELETE_NOTE', localdb_id)
    })
}

function editNoteRemote(localdb_id, note){
    return axios({
        method: 'post',
        url: pikachu + '/api/edit-note',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+ localStorage.access_token
        },
        data: {
            localdb_id: localdb_id,
            note: note
        }
    }).then(function(response){
        console.log(response.data)
        if(response.data == 'success'){
            console.log('edition successful at remote server')
        }else{
            console.log('some error in edition at remote server')
            doThisLater('EDIT_NOTE', localdb_id, note)
        }
    }, (err)=>{
        console.log('some error in edition at remote server')
        doThisLater('EDIT_NOTE', localdb_id, note)
    })
}

function deleteNotebook(event){
    event.preventDefault()
    let title = $('.edit-notebook.modal input[type=hidden]').val()
    if(localStorage.signedIn == 'false' || localStorage.signedIn == null ){
        db.notebooks.remove({title: title},{}, function(err,numRemoved){})
        db.notes.remove({notebook: title},{multi: true})
        db.remoteTasks.remove({task: 'CREATE_NOTEBOOK', title:title }, {})
        db.remoteTasks.remove({notebook: title}, {})
        showMessage('Notebook deleted')
        displayNotebooks()
        openPage(settingsPage)
    }
    else if(navigator.onLine && (localStorage.signedIn=='true')){
        db.notebooks.remove({title: title},{}, function(err,numRemoved){})
        db.notes.remove({notebook: title},{multi: true})
        
        axios({
            method: 'post',
            url: pikachu + '/api/delete-notebook',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+ localStorage.access_token
            },
            data: {
                title: title
            }
        })
        displayNotebooks()
        openPage(settingsPage)
        showMessage('Notebook deleted')
    }else{
        showMessage('You can only delete a notebook when online')
    }
    toggleModal('.edit-notebook.modal')

}

function editNotebook(event){
    event.preventDefault()
    let old_title = $('.edit-notebook.modal input[type=hidden]').val()
    let new_title = $('.edit-notebook.modal input[type=text]').val()
    
    if(localStorage.signedIn == 'false'){
        db.notebooks.update({title: old_title}, {$set: {title: new_title}})
        db.notes.update({notebook: old_title}, {$set: {notebook: new_title}}, {multi: true})
        db.remoteTasks.update({title: old_title}, {$set: {title: new_title}}, {multi: true})
        db.remoteTasks.update({notebook: old_title}, {$set: {notebook: new_title}}, {multi: true})
        showMessage('Notebook deleted')
        displayNotebooks()
        openPage(settingsPage)
    }
    if(navigator.onLine && (localStorage.signedIn=='true')){
        
        axios({
            method: 'post',
            url: pikachu + '/api/edit-notebook',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+ localStorage.access_token
            },
            data: {
                new_title: new_title,
                old_title: old_title
            }
        }).then(()=>{
            db.notebooks.update({title: old_title}, {$set: {title: new_title}}, function(err,numReplaced){
                displayNotebooks()
                openPage(settingsPage)
            })
            db.notes.update({notebook: old_title}, {$set: {notebook: new_title}}, {multi: true})
            db.remoteTasks.update({title: old_title}, {$set: {title: new_title}}, {multi: true})
            db.remoteTasks.update({notebook: old_title}, {$set: {notebook: new_title}}, {multi: true})
        }, (err)=>{
            showMessage(err)
        })

    }else{
        showMessage('You can only edit a notebook when online')
    }
    toggleModal('.edit-notebook.modal')
}

ipcRenderer.on('message', function (event, text) {
    console.log('Message from app.js:', text);
    if(text == 'update-downloaded'){
        sendRaven('<button class="update" onclick="update()">Update Software</button>')
    }
});

function update(){
    console.log('going to update now.')
    ipcRenderer.send('update-now');
}


// FONTS 

function setFont(i){
    let x = '<link rel="stylesheet" type="text/css" href="css/'+ i +'.css">'
    $('head').append(x);
}

function initFonts(){
    if(localStorage.font == null){
        localStorage.font = 'times-new-roman'
    }
    setFont(localStorage.font)
    $('.fonts select').val(localStorage.font)
}

function changeFont(){
    var i = $('.fonts select').val()
    setFont(i)
    localStorage.font = i
}

//THEMES
function setTheme(i){
    let x = '<link rel="stylesheet" type="text/css" href="css/'+ i +'.css">'
    $('head').append(x);
}

function initThemes(){
    if(localStorage.theme == null){
        localStorage.theme = 'light_theme'
    }
    setTheme(localStorage.theme)
    $('.themes select').val(localStorage.theme)
}

function changeTheme(){
    var i = $('.themes select').val()
    setTheme(i)
    localStorage.theme = i
}