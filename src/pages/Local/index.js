import React, { Component } from 'react'
import './index.css'
import { Tab, Tabs } from '@blueprintjs/core'
import Polls from './Polls'
import Poll from './Poll'
import { Switch, Route } from 'react-router-dom'
import RedirectWithStatus from '../../components/RedirectWithStatus'
import RouteNotFound from '../../components/RouteNotFound'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

class Local extends Component {
  state = {
    tab: this.props.match.params.localTab,
  }
  
  handleTabChange = (tab) => {
    this.setState({tab})
    this.props.history.push(`/local/${tab}`)
  }
  
  render() {
    return (
      <div className="Local">
        <div className={'tabDiv'}>
          <Tabs id="tabs" onChange={this.handleTabChange} selectedTabId={this.state.tab} large={true}>
            <Tab id="polls" title="Polls"/>
            <Tabs.Expander/>
          </Tabs>
        </div>
        <Switch>
          <Route exact path="/local/polls" component={Polls}/>
          <Route exact path="/local/polls/:pollId" component={Poll}/>
          <RedirectWithStatus from={'/local'} to={'/local/polls'} status={301}/>
          <Route component={RouteNotFound}/>
        </Switch>
      </div>
    )
    
  }
}

export default compose(withRouter)(Local)