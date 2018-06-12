import React, { Component } from 'react';
import './styles/SettingsPage.css';
import SigninModal from './SigninModal'
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;
const dialog = electron.remote.dialog

class SettingsPage extends Component {

	constructor(props) {
	  	super(props);
	
	  	this.state = {
	  		notebooks: [],
	  		username: ''
	  	}

	  	this.visitWebsite = this.visitWebsite.bind(this)
	  	this.selectFolder = this.selectFolder.bind(this)
	  	this.changeDbPath = this.changeDbPath.bind(this)
	}

	componentDidMount(){
		document.getElementById('db-location-tag').textContent = localStorage.db_location
		let that = this
		let notebooks = []
		window.db.notebooks.find({},(err,docs) => {
	        if(err){
	            console.log(err);
	        }
	        else{
	            for(let i=0; i<docs.length; i++){
	                let y = docs[i];

	                notebooks.push(
						<button key={y._id}>{y.title}</button>                	
	                )

	            }
	            that.setState({
	            	notebooks: notebooks
	            })
	        }
	    });
	}

	componentWillReceiveProps(nextProps){

		console.log('componentWillRecieveProps in settings-page')

    	let that = this
		let notebooks = []
		window.db.notebooks.find({},(err,docs) =>{
	        if(err){
	            console.log(err);
	        }
	        else{
	            for(let i=0; i<docs.length; i++){
	                let y = docs[i];

	                notebooks.push(
						<button key={y._id}>{y.title}</button>                	
	                )

	            }
	            that.setState({
	            	notebooks: notebooks
	            })
	        }
	    });

	    if(nextProps.login_status){
	    	this.setState({
	    		username: localStorage.username
	    	})
	    }

	}

	visitWebsite(e){
	    e.preventDefault()
	    ipcRenderer.send('visit-website')
	}

	selectFolder(){
		let path = dialog.showOpenDialog({properties: ['openDirectory']})
		return path
	}

	changeDbPath(){
		let path = this.selectFolder()
		localStorage.db_location = path
		document.getElementById('db-location-tag').textContent = localStorage.db_location
		window.setUpDatabases()
	}

  render() {
  	console.log('going to render Settings')
  	console.log(this.props.login_status)
    return (
		<div id="settings-page" className={this.props.active ? '' : 'hidden' } >
			<header>Settings</header>
			<div className="user">
				<div className="username">{this.state.username}</div>
				<div className="email"></div>
			</div>

			<div className="auth">
				<div className={this.props.login_status ? "hidden" : ""}>
					<button onClick={() => {this.props.activateModal(1)}}>Sign In</button>
					<button>Sign Up</button>
				</div>
				<div className={this.props.login_status ? "" : "hidden"}>
					<button onClick={() => {this.props.changeSigninStatus(false)}}>Log out</button>
				</div>
			</div>

			<SigninModal deactivateModals={this.props.deactivateModals} 
			changeSigninStatus={this.props.changeSigninStatus} active={this.props.signin} />


			<div className="content">
				<div className="fonts">
					<p className="strong">Fonts</p>
					<select>
						<option value="default-font">Default</option>
						<option value="lato-tnr">Lato - Times New Roman</option>
						<option value="consolas-lato">Consolas - Lato</option>
					</select>
				</div>
				<div className="themes">
					<p className="strong">Themes</p>
					<select>
						<option value="blue_theme">Blue</option>
						<option value="grey_theme">Light</option>
						<option value="dark_theme">Dark</option>
					</select>
				</div>
				<div className="path-wrap">
					<p className="strong">Data Location</p>
					<p id="db-location-tag"></p>
					<button onClick={this.changeDbPath} className="btn3 a">Change</button>
				</div>
				<p className="strong">Edit/Delete Notebooks</p>
				<div className="notebooks-list">
					{this.state.notebooks}
				</div>
			</div>
			<footer>Visit <a onClick={(event) => {this.visitWebsite(event)}} href="https://umbrellanote.com">Umbrella Note</a></footer>	
		</div>
    );
  }
}

export default SettingsPage;
