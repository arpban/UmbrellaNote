import React, { Component } from 'react';
import './styles/modals.css';
import $ from 'jquery'

class CreateNotebookModal extends Component {


	constructor(props) {
	  	super(props)
	  	this.state = {
	
	  	}

	  	this.createNotebook = this.createNotebook.bind(this)
	}

	createNotebook(e){
		let that = this
		e.preventDefault()
		let days = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
		let months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
		let title = $('.create-notebook-modal form input[name=title]').val();
	    console.log(title);
	    let summary = $('.create-notebook-modal form textarea').val();
	    let cover_image = $('.cover-checkbox:checked').val();
	    var d = new Date();
	    let date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getUTCFullYear();
	
	    var obj = {
	        title: title,
	        summary: summary,
	        cover: cover_image,
	        time: date
	    };

	    window.db.notebooks.findOne({title: title}, (err, doc)=>{
	        if(err){
	            window.postman('<img src="img/emojis/sad.svg"><div class="emoji-text">Error. Try again later.</div>');
	        }
	        else{
	            if(doc == null)
	                window.db.notebooks.insert(obj, function(err,newDoc){
	                    if(err){
	                    	window.postman('<img src="img/emojis/sad.svg"><div class="emoji-text">Error. Try again later.</div>')
	                    }
	                    else{
	                        that.props.deactivateModals()
	                        window.postman('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');
	                        that.props.initNewNotebook()
	                    }
	                })
	            else
	                window.postman('Notebook already exists!')
	        }
	    })

	}

  	render() {

  		console.log('going to render CreateNotebookModal')

	  	let covers = [
		    "img/1.jpg",
		    "img/2.jpeg",
		    "img/3.jpg",
		    "img/4.png",
		    "img/13.jpeg",
		    "img/14.jpeg",
		    "img/15.jpeg",
		    "img/16.jpeg",
		    "img/17.jpeg",
		    "img/18.jpeg",
		    "img/19.jpeg",
		    "img/20.jpeg",
		    "img/21.jpg",
		]

		let covers_li = []

		for(let i=0; i<covers.length; i++){
			covers_li.push(
				<li><input type="checkbox" className="cover-checkbox" value={covers[i]} id={"cb"+i} /><label for={"cb"+i}><img src={covers[i]} /></label></li>
			)
		}

	    return (
	    	<div className={this.props.active ? 'create-notebook-modal modal open' : 'create-notebook-modal modal' }>
				<div className="body">
					<div className="close"><button onClick={() => {this.props.deactivateModals()}}><svg className="" viewBox="0 0 24 24"><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/><path d="M0 0h24v24h-24z" fill="none"/></svg></button></div>
					<div className="main">
						<p>New Notebook</p>
						<form onSubmit={(e) => {this.createNotebook(e)}} className="form-group" >
							<label>Title</label>
							<input className="form-item" type="text" name="title" required />
							<label>Description</label>
							<textarea className="form-item" name="summary"></textarea>
							<div className="covers">
								<div>Select A Cover Image</div>
								<ul>
									{covers_li}
								</ul>
							</div>
							<input type="submit" value="Create" className="btn1" />
						</form>
					</div>
				</div>
			</div>
	    );
  	}
}

export default CreateNotebookModal;
