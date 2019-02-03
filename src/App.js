import React, { Component } from 'react';
import './App.css';
import {Switch, Route, withRouter} from 'react-router-dom'
import logo from './logo.svg'

class Editor extends Component {
    render() {
        return (
            <div className="Edit">
                <textarea className="Edit-text">

                </textarea>
            </div>
        );
    }
}

class Menu extends Component {
    onClickNewNote = () => {
        this.props.history.push("/note/" + Math.random().toString(36).substring(7))
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
              <Route path="/note" component={Editor}/>
          </Switch>
      );
  }
}

export default withRouter(App);
