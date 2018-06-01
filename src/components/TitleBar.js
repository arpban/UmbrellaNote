import React, { Component } from 'react';
import './styles/TitleBar.css';

class TitleBar extends Component {
	render() {

		let title 

		if(this.props.pages[0]){
			title = (
				<div className="title">Umbrella Note</div>
			)
		}
		else if(this.props.pages[1]){
			title = (
				<div className="title">Umbrella Note</div>
			)	
		}
		else if(this.props.pages[2]){
			title = (
				<div className="title color">{this.props.notebook}</div>
			)
		}
		else if(this.props.pages[3]){
			title = (
				<div className="title color">{this.props.notebook}</div>
			)
		}

		console.log('going to render TitleBar')

		return (

			<div className="title-bar">
				{title}
				<div className="nav">
					<button className="nav-item close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
					<button className="nav-item minimize">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-minus"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
					</button>
					<button className="nav-item maximize">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-maximize-2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
					</button>
				</div>
			</div>
		);
	}
}

export default TitleBar;
