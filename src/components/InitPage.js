import React, { Component } from 'react';
import './styles/InitPage.css';
import $ from 'jquery';
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;
const dialog = electron.remote.dialog;

class InitPage extends Component {
  
	constructor(props) {
	  	super(props);
	
	  	this.state = {
	  		active: [true, false, false] //[startview, yesview, noview]
	  	}

	  	this.visitWebsite = this.visitWebsite.bind(this)
	  	this.selectFolder = this.selectFolder.bind(this)
	  	this.initNewUser = this.initNewUser.bind(this)
	  	this.initOldUser = this.initOldUser.bind(this)
	}

	visitWebsite(e){
	    e.preventDefault()
	    ipcRenderer.send('visit-website')
	}

	changeView(i){
		let x = [false, false, false]
		x[i] = true
		this.setState({
			active: x
		})
	}

	selectFolder(e, i){
		e.preventDefault()
	    let path = dialog.showOpenDialog({properties: ['openDirectory']})
	    let el
	    switch(i){
	    	case 'yes':
	    		el = document.getElementById('init-page-yes-select-folder')
	    		break
	    	case 'no':
	    		el = document.getElementById('init-page-no-select-folder')
	    		break
	    }
	    el.value = path
	}

	initNewUser(e){
		e.preventDefault()
		let user_name = $('#init-page .view-yes input[name=user_name]').val()
		let db_location = $('#init-page-yes-select-folder').val()
		localStorage.user_name = user_name
		localStorage.db_location = db_location
		
		//TODO show message : welcome

		this.props.initUmbrella()

	}

	initOldUser(e){
		e.preventDefault()
		let user_name = $('#init-page .view-no input[name=user_name]').val()
		let db_location = $('#init-page-no-select-folder').val()
		localStorage.user_name = user_name
		localStorage.db_location = db_location
		
		//TODO show message : welcome
		this.props.initUmbrella()		
	}

  render() {
  	console.log('going to render InitPage')
    return (
		<div id="init-page">
			<div className="wrap">
				<div className={this.state.active[0] ? "view1" : "view1 hidden"}>
					<header>Hi,</header>
					<header>Welcome to the Umbrella Note</header>
					<p>Are you using Umbrella Note for the first time?</p>
					<button onClick={() => { this.changeView(1) }} className="btn1">Yes</button>
					<button onClick={() => { this.changeView(2) }} className="btn1">No</button>
				</div>
				<div className={this.state.active[1] ? "view-yes" : "view-yes hidden"}>
					<button onClick={() => { this.changeView(0) }} className="svg-button" ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-arrow-left-circle"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></svg></button>
					<form onSubmit={(e) => {this.initNewUser(e)}} className="form-group">
						<label>Your Name</label>
						<input className="form-item" type="text" name="user_name" />
						<label>Please select a location for storing your data.</label>
						<small>We recommend installing cloud storage services like google drive or dropbox and select them as the location for storing your data.</small>
						<input id="init-page-yes-select-folder" placeholder="Select Folder" className="db-location form-item" type="text" name="db_location" />
						<button onClick={(event) => {this.selectFolder(event, 'yes')}} className="browse-folder">Browse</button>
						<input type="submit" value="Continue" className="btn3" />
					</form>
				</div>
				<div className={this.state.active[2] ? "view-no" : "view-no hidden"}>
					<button onClick={() => { this.changeView(0) }} className="svg-button" ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-arrow-left-circle"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></svg></button>
					<form onSubmit={(e) => {this.initOldUser(e)}} className="form-group">
						<label>Your Name</label>
						<input className="form-item" type="text" name="user_name" />
						<label>Please enter the location of your umbrella-note data folder.</label>
						<small>Important : Only enter the path of the directory containing the 'umbrella-note' folder. Don't include 'umbrella-note' in the path.</small>
						<input id="init-page-no-select-folder" placeholder="Select Folder" className="db-location form-item" type="text" name="db_location" />
						<button onClick={(event) => {this.selectFolder(event, "no")}} className="browse-folder">Browse</button>
						<input type="submit" value="Continue" className="btn3" />
					</form>
				</div>

				<footer>
					Visit <a onClick={(event) => {this.visitWebsite(event)}} href="umbrellanote.com">umbrellanote.com</a>
				</footer>
			</div>
			<img className="background" src="img/4.png" />

		</div>
    );
  }
}

export default InitPage;
