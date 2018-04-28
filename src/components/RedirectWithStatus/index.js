import React from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-dom'

class RedirectWithStatus extends React.Component {
  static propTypes = {
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
  }
  
  render() {
    return (
      <Route render={({staticContext}) => {
        if (staticContext) {
          staticContext.status = this.props.status
        }
        return <Redirect from={this.props.from}
                         to={this.props.to}/>
      }}/>
    )
  }
}

export default RedirectWithStatus