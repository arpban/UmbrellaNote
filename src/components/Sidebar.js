import React, { Component } from 'react';
import './styles/Sidebar.css';
import feather from 'feather-icons'

class Sidebar extends Component {
	componentDidMount(){
		feather.replace()
	}
  render() {
  	console.log('going to render Sidebar')
    return (
		<div id="sidebar">
			<div className="top"></div>

			<div className="bottom">
				<button onClick={() => {this.props.changeView(0)}} className="home">
					<i data-feather="home"></i>
				</button>
				<button onClick={() => {this.props.activateModal(0)}} className="book">
						<i data-feather="book"></i>
				</button>
				<button onClick={() => {this.props.changeView(1)}} className="settings">
					<i data-feather="settings"></i>
				</button>
			</div>
		</div>
    );
  }
}

export default Sidebar;
