import React, { Component } from 'react';
import $ from 'jquery'

class Note extends Component {
  
  handleClick = (e) => {
  	e.preventDefault()
    this.props.openNote(this.props.data._id);
    $('.notebook-page .post').removeClass('active')
  	e.currentTarget.className = "post active"
  	// console.log('key ', e.currentTarget)
  }

  componentWillMount(){
  	if(this.props.first){
  		this.props.openNote(this.props.data._id);
  	}
  }


  render() {
  	console.log('going to render Note')
  	
    return (

		<a onClick={this.handleClick} className={this.props.first	 ? "post active" : "post"}>
			<div className="time">{this.props.data.time}</div>
			<div className="date">{this.props.data.date}</div>
			<div className="excerpt">{this.props.excerpt}</div>
		</a>

    );
  }
}

export default Note;
