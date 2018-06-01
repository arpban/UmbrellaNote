import React, { Component } from 'react';
import './styles/App.css';
import TitleBar from './TitleBar'
import Sidebar from './Sidebar'
import HomePage from './HomePage'
import SettingsPage from './SettingsPage'
import CreateNotebookModal from './CreateNotebookModal'
import InitPage from './InitPage'
import NotebookPage from './NotebookPage'
import EditorView from './EditorView'

import feather from 'feather-icons'
import $ from 'jquery'

class App extends Component {

	constructor(props) {
	  	super(props)
	  	this.state = {
	  		views: [true, false, false, false], //[homepage, settingspage, notebookpage, editorview]
	  		modalsStatus: [false], //[create-notebook-modal,]
	  		isAppInitialized: false,
	  		newNotebookAvailable: false,
	  		activeNotebook: 'Notebook One',
	  		editing_note: '', //id of note which needs to be updated
	  	}
	  	this.changeView = this.changeView.bind(this)
	  	this.activateModal = this.activateModal.bind(this)
	  	this.deactivateModals = this.deactivateModals.bind(this)
	  	this.initUmbrella = this.initUmbrella.bind(this)
	  	this.initNewNotebook = this.initNewNotebook.bind(this)
	  	this.openNotebook = this.openNotebook.bind(this)
		this.toggleEditor = this.toggleEditor.bind(this)
		this.doneInitNewNotebook = this.doneInitNewNotebook.bind(this)
		this.editNote = this.editNote.bind(this)
	}

	componentWillMount(){
		if(localStorage.db_location === undefined || localStorage.db_location === ''){
			this.setState({
				isAppInitialized: false
			})	
		}else{
			this.setState({
				isAppInitialized: true
			})
		}
	}

	componentDidMount(){
		feather.replace()
		window.initUmbrella()
		window.Mousetrap.bind('f', ()=>{
            // console.log('f is pressed at homePage')
            this.changeView(3)
        })
        window.Mousetrap.bind('j', ()=>{
            // console.log('j is pressed at homePage')
            this.changeView(3)
        })
	}

	openNotebook(title){
		console.log('open notebook', title)
		this.setState({
			activeNotebook: title
		})
		this.changeView(2)
	}

	changeView(page_index){
		let views = [false, false, false, false] //[homepage, settingspage, notebookpage, editorview]
		views[page_index] = true
		this.setState({
			views: views
		})
		

		if(page_index === 0){
			$('.notebook-page .column-2').html('')
		}

		switch(page_index){
	        case 0:
	            window.Mousetrap.reset()
	            window.Mousetrap.bind('f', ()=>{
	                this.changeView(3)
	            })
	            window.Mousetrap.bind('j', ()=>{
	                this.changeView(3)
	            })
	            break
	        case 3:
	        	// $('.editor-view .main-editor').html('') 
	         //    window.Mousetrap.reset()
	         //    window.Mousetrap.bind('esc', ()=>{
	         //        this.changeView(2)
	         //        window.setUpNotebookPage()
	         //    })
	         //    let umbrella_editor = document.getElementsByClassName('main-editor')
	         //    var writer_mousetrap = new window.Mousetrap(umbrella_editor[0]);
	         //    writer_mousetrap.bind(['ctrl+s', 'command+s'], ()=>{
	         //        // console.log('inside writepage section of setUpKeyboardShortcuts')
	         //        // console.log('submiting the writepage form')
	         //        // $('#writePage form').submit()
	         //        // writer_mousetrap.unbind(['ctrl+s','command+s'])
	         //        // clearEditors()
	         //    });
	         //    writer_mousetrap.bind('esc', ()=>{
	         //        this.changeView(2)
	         //        window.setUpNotebookPage()
	         //        writer_mousetrap.unbind(['esc', 'ctrl+s', 'command+s'])
	         //    });
	         //    break
	        // case 'editorPage':
	        //     Mousetrap.reset()
	        //     Mousetrap.bind('esc', ()=>{
	        //         // console.log('esc is pressed at editorpage')
	                
	        //         openPage(notebookPage)
	        //         clearEditors()
	        //     })
	        //     umbrella_editor = document.getElementsByClassName('main-editor')
	        //     var editor_mousetrap = new Mousetrap(umbrella_editor[1]);
	        //     editor_mousetrap.bind(['ctrl+s', 'command+s'], ()=>{
	        //         console.log('submiting the edit note form ')
	        //         $('#editPage form').submit()
	        //         editor_mousetrap.unbind(['ctrl+s','command+s'])
	        //         clearEditors()
	        //     });
	        //     editor_mousetrap.bind('esc', ()=>{
	        //         // console.log('esc pressed at editorpage in tinymce')
	                
	        //         openPage(notebookPage)
	        //         editor_mousetrap.unbind(['esc', 'ctrl+s', 'command+s'])
	        //         clearEditors()
	        //     });
	        //     // console.log('editor page is opened')
	        //     break
	        case 2: 
	            
	            window.Mousetrap.bind('f', ()=>{
	                this.changeView(3)
	            })
	            window.Mousetrap.bind('j', ()=>{
	                this.changeView(3)
	            })
	            window.Mousetrap.bind('esc', ()=>{
	                this.changeView(0)
	            })
	            break
	    }

	}

	activateModal(i){
		let modalsStatus = [false]
		modalsStatus[i] = true
		this.setState({
			modalsStatus: modalsStatus
		})
	}

	deactivateModals(){
		this.setState({
			modalsStatus: [false]
		})
	}

	initUmbrella(){
		this.setState({
			isAppInitialized: true
		})
	}

	initNewNotebook(){
		console.log('going to run initNewNotebook')
		this.setState({
			newNotebookAvailable: ! this.state.newNotebookAvailable
		})
	}

	doneInitNewNotebook(){
		this.setState({
			newNotebookAvailable: false
		})
	}

	toggleEditor(){

	}

	editNote(id){
		this.setState({
			editing_note: id
		})
		this.changeView(3)
	}

	render() {

		console.log('going to render App')

		let v = []

		if(this.state.isAppInitialized === false){
			
			v.push(
				<div className="just-another-div">
					<InitPage initUmbrella={this.initUmbrella} />
				</div>
			)
		}else{
			v.push(
				<div className="just-another-div">
					<TitleBar notebook={this.state.activeNotebook} pages={this.state.views} />
					<Sidebar activateModal={this.activateModal} changeView={this.changeView} />
					<HomePage editorState={this.state.isEditorActive} openNotebook={this.openNotebook} newNotebookAvailable={this.state.newNotebookAvailable} active={this.state.views[0]} />
					<SettingsPage active={this.state.views[1]} />
					<CreateNotebookModal initNewNotebook={this.initNewNotebook} deactivateModals={this.deactivateModals} active={this.state.modalsStatus[0]} />
					<NotebookPage changeView={this.changeView} notebook={this.state.activeNotebook} editNote={this.editNote} active={this.state.views[2]} />
					<EditorView changeView={this.changeView} notebook={this.state.activeNotebook} noteId={this.state.editing_note} changeView={this.changeView} active={this.state.views[3]} />
					<button onClick={() => {this.changeView(3)}} id="feather-button" class="write icon">
							<i data-feather="feather"></i>
					</button>
				</div>
			)
		}

		return (
			<div className="App">

				{v}					
				
			</div>
		);
	}
}

export default App;
