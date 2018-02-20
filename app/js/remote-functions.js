'use strict';

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

    for (var _i = 0; _i < notes.length; _i++) {
        var note = notes[_i];
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