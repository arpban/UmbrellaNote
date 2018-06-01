import React, { Component } from 'react';
import './styles/NotebookPage.css';
import Note from './Note'
import $ from 'jquery'

class NotebookPage extends Component {
	
	constructor(props) {
	  	super(props);
	
	  	this.state = {
			notes : [],
			note_pointer: ''
	  	}

	  	this.html2text = this.html2text.bind(this)
	  	this.openNote = this.openNote.bind(this)
		this.deleteNote = this.deleteNote.bind(this)	
	}

	openNote(id){
		let that = this
		console.log('opening note', id)
	    window.db.notes.findOne({_id: id}, function(err,doc){
	        $('.notebook-page .column-2').html(doc.note)
	    })
	    this.setState({
	    	note_pointer: id
	    })

	}

	componentWillMount(){
		console.log('ran componentWillMount in NotebookPage')
	}

	componentDidUpdate(prevProps){
		
		

		console.log('ran componentDidUpdate in NotebookPage')
		// window.setUpNotebookPage()
	}

	componentDidMount(){
		

	}

	componentWillReceiveProps(nextProps){
		
		let that = this
		let notes = []

		window.db.notes.find({ notebook : nextProps.notebook }).sort({timestamp: 1}).exec((err,docs) => {
	        if(err){
	            console.log(err);
	        }
	        else{

	            for(let i=docs.length-1; i>=0; i--){
	                let y = docs[i];
                    let excerpt = that.html2text(y.note).slice(0,100)
	                if(i==docs.length-1){
	                	that.setState({
	                		note_pointer: y._id
	                	})
	                	notes.push(	                	
		                	<Note key={y._id} first={true} openNote={this.openNote} data={y} excerpt={excerpt} />
		                )
	                }else{
		                notes.push(	                	
		                	<Note key={y._id} first={false} openNote={this.openNote} data={y} excerpt={excerpt} />
		                )
	                }
	            }
	            that.setState({
	            	notes: notes
	            })
	        }
	    });

	    if(this.props.active === false && nextProps.active === true){
	    	
            window.Mousetrap.bind('e', () => {
                this.props.editNote(this.state.note_pointer)
            })
            
            window.Mousetrap.bind(['ctrl+d', 'command+d'], () => {
                console.log('delete')
                this.deleteNote(this.state.note_pointer)                
            })
	    }

		console.log('ran componentWillReceiveProps in NotebookPage')
	}

	deleteNote(id){
		let that = this
		window.db.notes.remove({ _id: id }, {}, function(err,numRemoved){
	        if(err){
	            console.log(err)
	        }else{
	        	that.props.changeView(0)
	        	// window.setUpNotebookPage()
	        	window.postman('<img src="img/emojis/trash.png"><div class="emoji-text">Note Deleted</div>');
	        }
	    })
	}

	html2text( html ) {
	    var d = document.createElement( 'div' );
	    d.innerHTML = html;
	    return d.textContent;
	}

	render() {
		
		console.log('going to render NotebookPage')
		

		return (
			<div className={this.props.active ? 'notebook-page' : 'notebook-page hidden' }>
				<div className="column-1">
					<div className="posts">
						{this.state.notes}
					</div>
				</div>
				<div className="column-2">
						
				</div>
			</div>
		);
	}
}

export default NotebookPage;
