import './index.css'
import React, { Component } from 'react'
import { Spinner, NonIdealState } from '@blueprintjs/core'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { compose, withProps, branch, renderComponent } from 'recompose'
import { withRouter } from 'react-router-dom'

const pollQuery = gql`
  query getPoll ($token: String!, $id: MongooseObjectId!, $page: Int, $quantity: Int){
    poll(token: $token, id: $id){
      id,
      name,
      description,
      entities(body: {
        page: $page,
        quantity: $quantity
      }) {
        page,
        quantity,
        totalResults,
        items {
          id,
          name,
          description,
          createdDate,
          updatedDate
        }
      }
      createdDate,
      updatedDate,
    }
  }
`

class Poll extends Component {
  static propTypes = {
    // id is the id of the poll
    poll: PropTypes.object,
    refetchPoll: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
  }
  
  state = {
    data: {},
  }
  
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({
        data: nextProps.data,
      })
    }
  }
  
  componentDidMount() {
    this.setState({
      data: this.props.data,
    })
  }
  
  render() {
    let $elem
    if (this.props.pollData.loading) {
      $elem =
        <div style={{
          textAlign: 'center',
        }}>
          <div className={'spinner'}>
            <Spinner className={'pt-large'}/>
          </div>
        </div>
    } else {
      $elem =
        <React.Fragment>
          <h1 className={'poll-heading'}>{this.props.poll.name}</h1>
          <p>Graph Will Be Displayed Here</p>
        </React.Fragment>
      
    }
    
    return (
      <div className="Poll">
        {$elem}
      </div>
    )
  }
}

export default compose(
  withRouter,
  withProps(props => {
    return {
      getPollQueryVariables: () => {
        return {
          token: 'abcde',
          id: props.match.params.pollId,
          page: 1,
          quantity: 20,
        }
      },
    }
  }),
  graphql(pollQuery, {
    fetchPolicy: 'cache-and-network',
    name: 'pollData',
    options: (props) => {
      return {
        variables: props.getPollQueryVariables(),
      }
    },
  }),
  withProps(props => {
    const pollData = props.pollData
    let poll = null
    if (pollData && pollData.poll) {
      poll = pollData.poll
    }
    return {
      poll: poll,
      refetchPoll: pollData.refetch,
    }
  }),
  branch(
    (props) => {
      return props.pollData.loading === false && !props.pollData.poll
    },
    renderComponent(() => {
      return <div style={{
        margin: '15px auto',
        textAlign: 'center',
      }}>
        <NonIdealState title={'Failed to load'}
                       description={'A network error might have occurred. Please refresh this page.'}
                       visual={'graph-remove'}/>
      </div>
    })
  ),
)(Poll)
