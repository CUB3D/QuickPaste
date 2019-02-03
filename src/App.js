import React, { Component } from 'react';
import './App.css';
import {Switch, Route, withRouter} from 'react-router-dom'
import logo from './logo.svg'
import $ from 'jquery'
import Cookies from 'universal-cookie'

// Used to store the note token over routes and reloads
const cookies = new Cookies();

class Viewer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            TextContent: "",
            NoteKey: props.match.params.key
        };

        // Load note contents
        $.ajax({
            url: "http://localhost:8000/api/readNote",
            type: "GET",
            crossDomain: true,
            crossOrigin: true,
            dataType: "json",
            data: "NoteKey=" + this.state.NoteKey,
            success: function (e) {

                if(e.Status === 0) {
                    let content = new Buffer(e.Content, 'base64').toString("utf-8");
                    this.setState({
                        TextContent: content
                    });
                }
            }.bind(this)
        });
    }


    render() {
        return (
            <div className="Edit-Holder">
                <div className="Edit-Status">
                    <p className="Edit-Status-Element">/note/{this.state.NoteKey}</p>
                </div>
                <textarea className="Edit-text Viewer" contentEditable={false} value={this.state.TextContent}/>
            </div>
        );
    }

}


class Editor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            TextContent: "",
            NoteKey: props.match.params.key,
            NoteToken: cookies.get("NoteToken_" + props.match.params.key),
            dirty: false
        };

        // Check to see if reloading the editor
        $.ajax({
            url: "http://localhost:8000/api/readNote",
            type: "GET",
            crossDomain: true,
            crossOrigin: true,
            dataType: "json",
            data: "NoteKey=" + this.state.NoteKey,
            success: function (e) {

                if(e.Status === 0) {
                    let content = new Buffer(e.Content, 'base64').toString("utf-8");
                    this.setState({
                        TextContent: content
                    });
                }
            }.bind(this)
        });
    }

    handleTextChange = (e) => {
        this.setState({
            TextContent: e.target.value,
            dirty: true
        }, function() {
            $.ajax({
                url: "http://localhost:8000/api/saveNote",
                type: "POST",
                crossDomain: true,
                crossOrigin: true,
                dataType: "json",
                data: JSON.stringify({
                    NoteKey: this.state.NoteKey,
                    NoteToken: this.state.NoteToken,
                    Content: new Buffer(this.state.TextContent).toString("base64")
                })
            })
        }.bind(this));
    };

    onKeyPress = (e) => {
        let char = String.fromCharCode(e.which).toLowerCase();

        if(e.ctrlKey && char === "s") {
            e.preventDefault();

            this.setState({
                dirty: false
            });

            $.ajax({
                url: "http://localhost:8000/api/saveNote",
                type: "POST",
                crossDomain: true,
                crossOrigin: true,
                dataType: "json",
                data: JSON.stringify({
                    NoteKey: this.state.NoteKey,
                    NoteToken: this.state.NoteToken,
                    Content: new Buffer(this.state.TextContent).toString("base64")

                })
            });
        }
    };

    render() {
        return (
            <div className="Edit-Holder">
                <div className="Edit-Status">
                    <p className="Edit-Status-Element">/note/{this.state.NoteKey}{this.state.dirty? "*" : ""}</p>
                </div>
            <textarea className="Edit-text" onChange={this.handleTextChange} onKeyDown={this.onKeyPress}
                      contentEditable={true} value={this.state.TextContent}/>
            </div>
        );
    }
}

class Menu extends Component {
    onClickNewNote = () => {
        // Tell server to generate a new note
        $.ajax({
            url: "http://localhost:8000/api/newNote",
            type: "GET",
            crossDomain: true,
            crossOrigin: true,
            success: function(e) {
                this.setState({
                    NoteKey: e.NoteKey,
                    NoteToken: e.NoteToken
                });

                cookies.set("NoteToken_" + e.NoteKey, e.NoteToken);

                this.props.history.push("/edit/" + e.NoteKey);
            }.bind(this)
        });
    };

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <div className="App-newnote" onClick={this.onClickNewNote}>
                        <img src={logo} alt="New Note img"/>
                        <p>New note</p>
                    </div>
                </header>
            </div>
        );
    }
}

class App extends Component {
  render() {
      return (
          <Switch>
              <Route path="/" exact component={Menu}/>
              <Route path="/edit/:key" component={Editor}/>
              <Route path="/view/:key" component={Viewer}/>
          </Switch>
      );
  }
}

export default withRouter(App);
