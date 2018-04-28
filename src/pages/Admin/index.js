import React, { Component } from 'react'
import './index.css'
import { Tab, Tabs } from '@blueprintjs/core'
import Polls from './Polls'
import PollEntities from './PollEntities'
import { Switch, Route } from 'react-router-dom'
import RedirectWithStatus from '../../components/RedirectWithStatus'
import RouteNotFound from '../../components/RouteNotFound'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

class Admin extends Component {
  state = {
    tab: this.props.match.params.adminTab,
  }
  
  handleTabChange = (tab) => {
    this.setState({tab})
    this.props.history.push(`/${tab}`)
  }
  
  render() {
    return (
      <div className="Admin">
        <div className={'tabDiv'}>
          <Tabs id="tabs" onChange={this.handleTabChange} selectedTabId={this.state.tab} large={true}>
            <Tab id="polls" title="Polls"/>
            <Tabs.Expander/>
          </Tabs>
        </div>
        <Switch>
          <Route exact path="/admin/polls" component={Polls}/>
          <Route exact path="/admin/polls/:pollId" component={PollEntities}/>
          <RedirectWithStatus from={'/admin'} to={'/admin/polls'} status={301}/>
          <Route component={RouteNotFound}/>
        </Switch>
      </div>
    )
    
  }
}

export default compose(withRouter)(Admin)