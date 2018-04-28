import React from 'react'
import RouteStatus from '../RouteStatus'
import { NonIdealState, Button } from '@blueprintjs/core'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

class RouteNotFound extends React.Component {
  render() {
    return (
      <RouteStatus code={404}>
        <div style={{
          padding: '15px',
        }}>
          <NonIdealState title={'Page not found'}
                         description={'This page is not available. Please contact administrators if you think this is an error.'}
                         visual={'graph-remove'}
                         action={
                           <Button
                             className="pt-button"
                             text="Home"
                             onClick={() => this.props.history.push('/')}/>
                         }/>
        </div>
      </RouteStatus>
    )
  }
}

export default compose(
  withRouter
)(RouteNotFound)