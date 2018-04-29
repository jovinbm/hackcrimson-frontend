import './index.css'
import React, { Component } from 'react'
import { Spinner, NonIdealState } from '@blueprintjs/core'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { compose, withProps, branch, renderComponent } from 'recompose'
import { withRouter } from 'react-router-dom'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Pie, PieChart } from 'recharts'

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
          updatedDate,
          votes {
            totalResults
          }
        }
      }
      createdDate,
      updatedDate,
    }
  }
`

const pollSubscription = gql`
  subscription onPollVote {
    pollVote {
      status
    }
  }
`

class Poll extends Component {
  static propTypes = {
    // id is the id of the poll
    poll: PropTypes.object,
    refetchPoll: PropTypes.func.isRequired,
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
    this.props.pollData.startPolling(500)
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
      const data = this.props.poll.entities.items.map(entity => {
        return {
          name: entity.name.split(' ')[0].toLowerCase(),
          value: entity.votes.totalResults,
        }
      })
      console.log(data)
      $elem =
        <React.Fragment>
          <h1 className={'poll-heading'}>{this.props.poll.name}</h1>
          <PieChart width={730} height={250}>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8"/>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d" label/>
          </PieChart>
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
