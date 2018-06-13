import React, { Component } from 'react';
import './styles/modals.css';
import $ from 'jquery'
import OnOff from './OnOff'
import axios from 'axios'
import Config from '../umbrella-config'

class CreateNotebookModal extends Component {


	constructor(props) {
	  	super(props)
	  	this.state = {
			publish_nb_online: false, //publish notebook online or not
	  	}

	  	this.createNotebook = this.createNotebook.bind(this)
	  	this.handleOnOffSwitch = this.handleOnOffSwitch.bind(this)
	}

	createNotebook(e){

		e.preventDefault()
		let that = this
		let days = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
		let months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
		let title = $('.create-notebook-modal form input[name=title]').val();
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

	    window.db.notebooks.findOne({title: title}, (err, doc) =>{
	        if(err){
	            window.postman('<img src="img/emojis/sad.svg"><div class="emoji-text">Error. Try again later.</div>');
	        }
	        else{
	            if(doc == null){

					if(that.state.publish_nb_online){
						
						//calling the spinner
						document.getElementById('spinner').className='active'
						
						axios({
				            method: 'post',
				            url: Config.backend_url + '/api/create-public-notebook',
				            headers: {
				                'Accept': 'application/json',
				                'Authorization': 'Bearer '+ localStorage.access_token
				            },
				            data: {
				            	title : title,
				            	description: summary,
				            	posts: []
				            }
				        }).then(function(response){
				            console.log('creating notebook on the server', response.data)
					        
					        //hiding the spinner
							document.getElementById('spinner').className=''
				            
				            if(response.data.success === true){
				            	obj.remote_id = response.data.res[0]._id
				            	obj.owners_remote_ids = response.data.res[0].owners
				            	window.db.notebooks.insert(obj, function(err,newDoc){
				                    if(err){
				                    	
				                    	//TODO - send ajax req for deleting the notebook created on the server
				                    	
				                    	window.postman('<img src="img/emojis/sad.svg"><div class="emoji-text">Error. Try again later.</div>')
				                    }
				                    else{
				                        that.props.deactivateModals()
				                        window.postman('<img src="img/emojis/happy.svg"><div class="emoji-text">Success!</div>');
				                        that.props.initNewNotebook()
				                    }
				                })	
				            }

				        }, (err)=>{
				        	
				        	//hiding the spinner
							document.getElementById('spinner').className=''
				            
				            window.postman('<img src="img/emojis/sad.svg"><div class="emoji-text">Error. Try again later.</div>')
				        })


					}else{
					
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

					}

	            }else{
	                window.postman('Notebook already exists!')
	            }

	        }
	    })



	}

	handleOnOffSwitch(switch_status){

		if(switch_status){
			if(this.props.login_status){
				this.setState({
					publish_nb_online: true
				})
			}else{
				window.postman("To publish a notebook online, you need to login first.")
				this.setState({
					publish_nb_online: false
				})
			}
		}else{
			this.setState({
				publish_nb_online: false 
			})			
		}

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
							<div className="publish">
								<OnOff checked={this.state.publish_nb_online} handleOnOffSwitch={this.handleOnOffSwitch} title="Publish Notebook Online" />		
								<div className={this.state.publish_nb_online ? "options" : "options hidden"}>

									{/*ADD OPTIONS HERE */}
								
								</div>
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
