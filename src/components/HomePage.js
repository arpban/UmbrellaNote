import React, { Component } from 'react';
import './styles/HomePage.css';
import Notebook from './Notebook'

class HomePage extends Component {

	constructor(props) {
	  	super(props);
	
	  	this.state = {
	  		notebooks : []	
	  	}
	  	
	}

	componentWillReceiveProps(){
		let that = this
		let notebooks = []
		window.db.notebooks.find({},(err,docs)=>{
	        if(err){
	            console.log(err);
	        }
	        else{
	            for(let i=0; i<docs.length; i++){
	                let y = docs[i];

	                notebooks.push(
						<Notebook key={y._id} openNotebook={this.props.openNotebook} data={y} />	                	
	                )

	            }
	            that.setState({
	            	notebooks: notebooks
	            })
	        }
	    });

	    console.log('ran componentWillReceiveProps at HomePage')
	}	

	componentWillMount(){
		window.setUpDatabases()
		let that = this
		let notebooks = []
		window.db.notebooks.find({},(err,docs)=>{
	        if(err){
	            console.log(err);
	        }
	        else{
	            for(let i=0; i<docs.length; i++){
	                let y = docs[i];

	                notebooks.push(
						<Notebook key={y._id} openNotebook={this.props.openNotebook} data={y} />               	
	                )

	            }
	            that.setState({
	            	notebooks: notebooks
	            })
	        }
	    });
	}

	componentDidMount(){
		// window.initUmbrella()
	}

	componentDidUpdate(){
		window.initUmbrella()
	}

	render() {

		console.log('going to render HomePage')

		return (
			<div id="HomePage" className={this.props.active ? '' : 'hidden' }>
				<div className="header">Your Journals</div>
				<div className="notebooks-view">

					{this.state.notebooks}

				</div>
			</div>
		);
	}
}

export default HomePage;
