'use strict';

//AUTHENTICATION - USER LOGIN/SIGNUP

function signInUser(event) {
    toggleSpinner();
    event.preventDefault();
    var email = $('.signin.modal input.email').val();
    var password = $('.signin.modal input.password').val();
    console.log(email, password);
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
    }).then(function (response) {
        if (response.status == 200) {
            localStorage.access_token = response.data.access_token;
            console.log(response.data.access_token);
            showMessage('<img src="img/emojis/happy.svg"><div class="emoji-text">Login Successful!</div>');
            toggleModal('.signin.modal');
            localStorage.signedIn = 'true';
            getUser();
            changeSignInStatus();
            createLocalDbFromRemoteDb();
        }
        toggleSpinner();
    }).catch(function (error) {
        showMessage('<img src="img/emojis/sad.svg"><div class="emoji-text">Unable to login</div>');
        toggleSpinner();
    });
}

function logoutUser() {

    toggleSpinner();
    axios({
        method: 'post',
        url: pikachu + '/api/logout',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.access_token
        },
        data: {
            client_id: client_id
        }
    }).then(function (response) {
        console.log(response.data);
        localStorage.signedIn = 'false';
        localStorage.access_token = ' ';
        showMessage('Logged Out');
        changeSignInStatus();
        updateUserDetailsView();

        db.remoteTasks.remove({}, { multi: true }, function (err, numRemoved) {});
        db.notebooks.remove({}, { multi: true }, function (err, numRemoved) {
            displayNotebooks();
        });
        db.notes.remove({}, { multi: true }, function (err, numRemoved) {
            displayQuickNotes();
        });

        var d = new Date();
        var date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();

        var obj = {
            title: 'Notebook One',
            summary: 'This is the default notebook. All the untagged posts are stored here.',
            cover: 'img/1.jpg',
            time: date
        };

        db.notebooks.insert(obj, function (err, newDoc) {
            doThisLater('CREATE_NOTEBOOK', 'Notebook One', 'This is the default notebook. All the untagged posts are stored here.', 'img/1.jpg', date);
        });
        toggleSpinner();
    });
}