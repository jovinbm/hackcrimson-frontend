import React from 'react'
import { Route } from 'react-router-dom'
import PropTypes from 'prop-types'

class RouteStatus extends React.Component {
  static propTypes = {
    code: PropTypes.number.isRequired,
  }
  
  render() {
    return (
      <Route render={({staticContext}) => {
        if (staticContext) {
          staticContext.status = this.props.code
        }
        return this.props.children
      }}/>
    )
  }
}

export default RouteStatus