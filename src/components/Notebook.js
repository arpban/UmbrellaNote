import React, { Component } from 'react';

class Notebook extends Component {
  
  handleClick = () => {
    this.props.openNotebook(this.props.data.title);
  }

  render() {
  	console.log('going to render Notebook')
    return (
		<div onClick={this.handleClick} className="notebook">
			<a>
				<div className="cover">
					<img src={this.props.data.cover} />
				</div>
				<div className="description">
					<div className="title">{this.props.data.title}</div>
					<div className="created">{this.props.data.time}</div>
					<div className="summary">{this.props.data.summary}</div>
					<button className="btn1">Open</button>
				</div>
			</a>
		</div>
    );
  }
}

export default Notebook;
