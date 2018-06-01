import React, { Component } from 'react';
import './styles/SettingsPage.css';
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

class SettingsPage extends Component {

	constructor(props) {
	  	super(props);
	
	  	this.state = {
	  		
	  	}

	  	this.visitWebsite = this.visitWebsite.bind(this)

	}

	visitWebsite(e){
	    e.preventDefault()
	    ipcRenderer.send('visit-website')
	}

  render() {
  	console.log('going to render Settings')
    return (
		<div id="settings-page" className={this.props.active ? '' : 'hidden' } >
			<header>Settings</header>
			<div className="user">
				<div className="username">Arpit bansal</div>
				<div className="email"></div>
			</div>
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
					<p className="db-location-tag"></p>
					<button className="btn3 a">Change</button>
				</div>
				<p className="strong">Edit/Delete Notebooks</p>
				<div className="notebooks-list"></div>
			</div>
			<footer>Visit <a onClick={(event) => {this.visitWebsite(event)}} href="https://umbrellanote.com">Umbrella Note</a></footer>	
		</div>
    );
  }
}

export default SettingsPage;
