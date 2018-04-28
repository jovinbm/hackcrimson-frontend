import React, { Component } from 'react'
import './index.css'
import { Tab, Tabs } from '@blueprintjs/core'
import Admin from '../Admin'
import Local from '../Local'
import { Switch, Route } from 'react-router-dom'
import RedirectWithStatus from '../../components/RedirectWithStatus'
import RouteNotFound from '../../components/RouteNotFound'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

class Home extends Component {
  state = {
    tab: this.props.match.params.rootTab,
  }
  
  handleTabChange = (tab) => {
    this.setState({tab})
    this.props.history.push(`/${tab}`)
  }
  
  render() {
    return (
      <div className="Home">
        <div className={'tabDiv'}>
          <Tabs id="tabs" onChange={this.handleTabChange} selectedTabId={this.state.tab} large={true}>
            <Tab id="admin" title="Admin"/>
            <Tab id="local" title="Local"/>
            <Tabs.Expander/>
          </Tabs>
        </div>
        <Switch>
          <Route path="/admin" component={Admin}/>
          <Route path="/admin/:adminTab" component={Admin}/>
          <Route path="/local" component={Local}/>
          <Route path="/local/:localTab" component={Local}/>
          <RedirectWithStatus from={'/'} to={'/admin'} status={301}/>
          <Route component={RouteNotFound}/>
        </Switch>
      </div>
    )
    
  }
}

export default compose(withRouter)(Home)