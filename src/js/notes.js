function newNote(event) {
    event.preventDefault();
    var d = new Date();
    let notebook = $('#writePage form input.notebookTitle').val();
    let date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
    let time = d.toLocaleTimeString();
    let note = tinymce.activeEditor.getContent();
    addNote(notebook, date, time, note);
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
            openPage(notebookPage);
            // if(navigator.onLine && (localStorage.signedIn=='true')){
            //     createNoteRemote(notebookTitle, noteDate, noteTime, noteBody, newDoc._id, timestamp)
            // }else{
            //     doThisLater('CREATE_NOTE', notebookTitle, noteDate, noteTime, noteBody, newDoc._id, timestamp)
            // }
        }
    });
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
            // if(navigator.onLine && (localStorage.signedIn=='true')){
            //     editNoteRemote(id, note)
            // }else{
            //     doThisLater('EDIT_NOTE', id, note)
            // }
        }
    })
    openPage(notebookPage);
    $('#sidebar .icon').css('color','#FAFAFA')
}

function displayNotes() {
    
    $('#notebookPage .posts').html('');
    db.notes.find({ notebook : notebook_pointer }).sort({timestamp: 1}).exec((err,docs)=>{
        if(err){
            console.log(err);
        }
        else{
            for(let i=docs.length-1; i>=0; i--){
                // console.log(docs[i]);
                let y = docs[i];
                let excerpt = html2text(y.note).slice(0,100)
                let x = '<a class="post" onclick="openNote(\'' + y._id + '\')"><div class="time">' + y.time + '</div><div class="date">' + y.date + '</div><div class="excerpt">'+excerpt+'</div></a>';                
                $('#notebookPage .posts').append(x);
                
            }
            addColors(docs.length)
            callAfterDisplayNotes()
        }
    });
}

function html2text( html ) {
    var d = document.createElement( 'div' );
    d.innerHTML = html;
    return d.textContent;
}

function openNote(id){ //this function displays the note in the column2 of the notebookPage
    
    db.notes.findOne({_id: id}, function(err,doc){
        $('#notebookPage .column-2').html(doc.note)
    })
    pointer_id_current_note = id

}



function deleteNote(id){
    db.notes.remove({ _id: id }, {}, function(err,numRemoved){
        if(err){
            console.log(err)
        }else{
            // console.log(numRemoved)
            // if(navigator.onLine && (localStorage.signedIn=='true')){
            //     deleteNoteRemote(id)
            // }else{
            //     doThisLater('DELETE_NOTE', id)
            // }
        }
    })
    
    displayNotes()

}

function callAfterDisplayNotes(){
    feather.replace()
    $('#notebookPage .post').click(function(){
        // $('#notebookPage .post').css("border-color", "#efefef")
        $('#notebookPage .post').removeClass('active')
        // $(this).css("border-color", "#338fff")
        $(this).addClass('active')
    })
    notePointer = $('.post').first()
    notePointer.click()
    // whenever user opens a notebook, keyboard keys up and down are binded with a function to change notes.
    Mousetrap.bind('down', ()=>{
        console.log('down is pressed')
        if(notePointer.next()[0] == null){
            return 
        }
        notePointer = notePointer.next()
        notePointer.click()
    })
    Mousetrap.bind('up', ()=>{
        console.log('up is pressed')
        if(notePointer.prev()[0] == null){
            return 
        }
        notePointer = notePointer.prev()
        notePointer.click()
    })
}

