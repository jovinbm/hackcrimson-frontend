import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import './index.css'
import { Navbar, NavbarGroup, NavbarHeading } from '@blueprintjs/core'
import { compose } from 'recompose'

class Index extends Component {
  render() {
    return (
      <Navbar>
        <NavbarGroup>
          <NavbarHeading>LVote</NavbarHeading>
        </NavbarGroup>
      </Navbar>
    )
  }
}

export default compose(
  withRouter,
)(Index)