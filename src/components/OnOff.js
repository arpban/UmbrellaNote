import React, { Component } from 'react';
import './styles/OnOff.css'
class OnOff extends Component {
  
  	constructor(props) {
	  	super(props)
	  	this.state = {
			checked: false
	  	}

	  	this.handleClick = this.handleClick.bind(this)
	}

	componentWillMount(){
		// this.setState({
		// 	checked: this.props.checked
		// })

	}

  	handleClick = (e) => {

  		console.log(e.target.checked)

  		// this.setState({
  		// 	checked: e.target.checked
  		// })

    	this.props.handleOnOffSwitch(e.target.checked)
  	}

  	render() {
	  	console.log('going to render onoff toggle switch')
	    return (
	    	<div className="toggle-group">
	    		<div className="title">{this.props.title}</div>
	    		<div className="switch-container">
				    <input onClick={this.handleClick} checked={this.props.checked} type="checkbox" name="on-off-switch" id="on-off-switch" tabindex="1" />
				    <label for="on-off-switch">
				        <span className="aural">Show:</span>
				    </label>
				    <div className="onoffswitch pull-right" aria-hidden="true">
				        <div className="onoffswitch-label">
				            <div className="onoffswitch-inner"></div>
				            <div className="onoffswitch-switch"></div>
				        </div>
				    </div>
	    		</div>
			</div>
	    );
  	}
}

export default OnOff;
