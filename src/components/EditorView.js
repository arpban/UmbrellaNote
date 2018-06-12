import React, { Component } from 'react';
import './styles/EditorView.css';
import $ from 'jquery'

class EditorView extends Component {

	constructor(props) {
	  	super(props);
	
	  	this.state = {
			update_mode: false
	  	}

	  	this.createNote = this.createNote.bind(this)
		this.updateNote = this.updateNote.bind(this)	  	
	}
	
	componentDidMount(){
		window.tinymce.init({
			selector: 'div.main-editor',
			theme: 'inlite',
			plugins: 'image media link paste contextmenu textpattern autolink hr',
			insert_toolbar: '',
			selection_toolbar: 'bold italic | quicklink h1 h2 blockquote hr | alignleft aligncenter alignright alignjsutify',
			inline: true,
			paste_data_images: true
		});
		
	}

	componentWillReceiveProps(nextProps){


		if(this.props.active === false && nextProps.active === true){
			$('.editor-view .main-editor').html('') 
            window.Mousetrap.reset()
            window.Mousetrap.bind('esc', ()=>{
                this.props.changeView(2)
                this.setState({
                	update_mode: false
                })
                window.setUpNotebookPage()
            })
            let umbrella_editor = document.getElementsByClassName('main-editor')
            var writer_mousetrap = new window.Mousetrap(umbrella_editor[0]);
            writer_mousetrap.bind(['ctrl+s', 'command+s'], ()=>{
                // console.log('inside writepage section of setUpKeyboardShortcuts')
                // console.log('submiting the writepage form')
                // $('#writePage form').submit()
                // writer_mousetrap.unbind(['ctrl+s','command+s'])
                // clearEditors()
            });
            writer_mousetrap.bind('esc', ()=>{
                this.props.changeView(2)
                window.setUpNotebookPage()
                writer_mousetrap.unbind(['esc', 'ctrl+s', 'command+s'])
                this.setState({
                	update_mode: false
                })
            });
		}

		if(nextProps.noteId !== "" && nextProps.noteId !== this.props.noteId){
			this.setState({
				update_mode: true
			})
			window.db.notes.findOne({_id: nextProps.noteId}, function(err,doc){
		        if(err){
		            console.log(err)
		        }else{
		            $('.editor-view .main-editor').html(doc.note)
		        }
		    })
		}

	}

	componentDidUpdate(){
		
		window.tinymce.activeEditor.focus()
		
	}

	createNote(e){
		e.preventDefault()

		if(this.state.update_mode === true){
			this.updateNote(e)
		}
		else{
			let that = this
			let d = new Date();
			let months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
			let days = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
		    let notebook = this.props.notebook
		    let date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
		    let time = d.toLocaleTimeString();
		    let note = window.tinymce.activeEditor.getContent();
		    let timestamp = d.getTime()
		    var obj = {
		        notebook: notebook,
		        date: date,
		        time: time,
		        note: note,
		        timestamp: timestamp //this is used for sorting notes
		    };

		    window.db.notes.insert(obj, function(err,newDoc){
		        if(err){
		            window.postman('<img src="img/emojis/sad.svg"><div class="emoji-text">Error</div>');
		        }
		        else{
		        	that.props.changeView(0)
		            window.postman('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');
		        }
		    });
		}

	}

	updateNote(e){
		e.preventDefault()
		let that = this

	    let note = window.tinymce.activeEditor.getContent();

	    let id = this.props.noteId

	    this.setState({
	    	update_mode: false
	    })

	    window.db.notes.update({ _id: id }, { $set: {note: note} }, function(err, numReplaced){
	        if(err){
	            console.log(err)
	        }else{
	        	that.props.changeView(0)
	            window.postman('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');
	        }
	    })

	}	

	render() {
		console.log('going to render EditorView')
		return (
			<div className={this.props.active ? 'editor-view' : 'editor-view hidden'}>
				<form onSubmit={(e) => {this.createNote(e)}}>
					<div className="main-editor"></div>
					<button className="save icon" value="submit">
							<i data-feather="check"></i>
					</button>
				</form>		
			</div>
		);
	}
}

export default EditorView;
