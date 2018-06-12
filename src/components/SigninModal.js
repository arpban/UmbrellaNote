import React, { Component } from 'react';
import './styles/modals.css';
import $ from 'jquery'
import Config from '../umbrella-config'
import axios from 'axios'

class SigninModal extends Component {


	constructor(props) {
	  	super(props)
	  	this.state = {
	
	  	}

	  	this.Signin = this.Signin.bind(this)
	}

	Signin(e){

		e.preventDefault()
		let email = document.getElementById('signin-email').value
		let password = document.getElementById('signin-password').value
		
		//call the spinner
		document.getElementById('spinner').className='active'

		axios({
			method : 'post',
			url : Config.backend_url + '/signin',
			headers : {
				'Accept' : 'application/json',
			},
			data : {
				email : email,
				password : password
			}
		}).then((response) => {

			if(response.data.success){
				console.log('login successful')
				//TODO call postman and show this msg to user
				window.postman('Welcome back '+ response.data.name)
				localStorage.setItem('email', email)
				localStorage.setItem('access_token', response.data.access_token)
				localStorage.setItem('isLoggedIn', true)
				localStorage.setItem('username', response.data.name)
				this.props.changeSigninStatus(true)
			}else{
				window.postman(response.data.msg)
			}

			//hide the spinner now
			document.getElementById('spinner').className=''
		}).catch((error) => {
			//hide the spinner
			document.getElementById('spinner').className=''
			window.postman('Please try again later')
		})

		this.props.deactivateModals()

	}

  	render() {

  		console.log('going to render SigninModal')

	    return (
	    	<div className={this.props.active ? 'signin-modal modal open' : 'signin-modal modal' }>
				<div className="body">
					<div className="close"><button onClick={() => {this.props.deactivateModals()}}><svg className="" viewBox="0 0 24 24"><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/><path d="M0 0h24v24h-24z" fill="none"/></svg></button></div>
					<div className="main">
						<p>Sign In</p>
						<form onSubmit={(e) => {this.Signin(e)}} className="form-group" >
							<label>Email</label>
							<input id="signin-email" className="form-item" type="email" name="email" required />
							<label>Password</label>
							<input id="signin-password" className="form-item" type="password" name="password" required />
							<input type="submit" value="Submit" className="btn1" />
						</form>
					</div>
				</div>
			</div>
	    );
  	}
}

export default SigninModal;
