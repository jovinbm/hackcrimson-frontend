import React, { Component } from 'react'
import './index.css'
import { Switch, Route } from 'react-router-dom'
import RouteNotFound from '../components/RouteNotFound'
import Home from '../pages/Home'
import Nav from '../navigation'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Nav/>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/:tab" component={Home}/>
          <Route component={RouteNotFound}/>
        </Switch>
      </div>
    )
  }
}

export default App
