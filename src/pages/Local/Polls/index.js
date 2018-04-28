import './index.css'
import React, { Component } from 'react'
import { Spinner, NonIdealState } from '@blueprintjs/core'
import { DateInput } from '@blueprintjs/datetime'
import PropTypes from 'prop-types'
import debounce from 'debounce'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { compose, withProps, branch, renderComponent } from 'recompose'
import fuzzy from 'fuzzy'
import truncate from 'truncate'
import { updateSearchQueries } from '../../../lib/location/updateQueryString'
import moment from 'moment/moment'
import Pagination from '../../../components/Pagination'
import { withRouter } from 'react-router-dom'

const pollsQuery = gql`
  query getPolls ($token: String!, $body: PollFindParams!){
    polls(token: $token, body: $body){
      page,
      quantity,
      totalResults,
      items {
        id,
        name,
        description,
        entities {
          page,
          totalResults
        }
        createdDate,
        updatedDate,
      }
    }
  }
`

class Polls extends Component {
  static propTypes = {
    polls: PropTypes.array.isRequired,
    refetchPolls: PropTypes.func.isRequired,
  }
  
  constructor() {
    super()
    const searchParams = new URLSearchParams(window.location.search)
    this.state = {
      filtered: [],
      filter: {
        name: searchParams.get('name') || '',
        numberOfEntities: searchParams.get('numberOfEntities') || '',
        createdDate: searchParams.get('createdDate') || '',
        updatedDate: searchParams.get('updatedDate') || '',
      },
      createPoll: {
        isOpen: false,
      },
      updatePoll: {
        isOpen: false,
        id: void 0,
      },
    }
  }
  
  filter = (polls = this.props.polls) => {
    updateSearchQueries(this.state.filter)
    const {name, createdDate, updatedDate, numberOfEntities} = this.state.filter
    let filtered = polls
    
    if (name) {
      const fuzzyOptions = {
        extract: el => el.name || '',
      }
      filtered = fuzzy.filter(name, filtered, fuzzyOptions).map(j => j.original)
    }
    
    if (createdDate) {
      filtered = filtered.filter(poll => {
        return moment(createdDate).format('DD MM YY') === moment(poll.createdDate).format('DD MM YY')
      })
    }
    
    if (updatedDate) {
      filtered = filtered.filter(poll => {
        return moment(updatedDate).format('DD MM YY') === moment(poll.updatedDate).format('DD MM YY')
      })
    }
    
    if (numberOfEntities) {
      filtered = filtered.filter(poll => {
        return poll.entities.totalResults === numberOfEntities
      })
    }
    
    this.setState({
      filtered,
    })
  }
  
  filterDebounced = debounce((...args) => {
    this.filter(...args)
  }, 200)
  
  onFilterInput = (key, event) => {
    let value
    if (key === 'createdDate' || key === 'updatedDate') {
      value = event ? new Date(event).toISOString() : ''
    } else {
      value = event.target.value
    }
    this.setState({
      filter: {
        ...this.state.filter,
        [key]: value,
      },
    }, () => {
      this.filterDebounced()
    })
  }
  
  onNewPollClick = () => {
    this.setState({
      createPoll: {
        ...this.state.createPoll,
        isOpen: true,
      },
    })
  }
  
  onPollClick = (id) => {
    this.props.history.push(`/local/polls/${id}`)
  }
  
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.polls !== nextProps.polls) {
      this.filter(nextProps.polls)
    }
  }
  
  componentDidMount() {
    this.filter()
  }
  
  render() {
    const $thead =
      <thead>
      <tr>
        <th>
          <label className="pt-label">
            Name
            <div className="pt-input-group">
              <span className="pt-icon pt-icon-search"/>
              <input id="name" className="pt-input" type="search" placeholder="Search Names" dir="auto" value={this.state.filter.name} onChange={this.onFilterInput.bind(this, 'name')}/>
            </div>
          </label>
        </th>
        <th>
          <label className="pt-label">
            Number of Entities
            <div className="pt-input-group">
              <span className="pt-icon pt-icon-search"/>
              <input id="noOfEntities" className="pt-input" type="number" placeholder="Search number of entities" dir="auto" value={this.state.filter.numberOfEntities} onChange={this.onFilterInput.bind(this, 'numberOfEntities')}/>
            </div>
          </label>
        </th>
        <th>
          <label className="pt-label">
            Created Date
            <div className="pt-input-group">
              <DateInput closeOnSelection={false}
                         showActionsBar={true}
                         inputProps={{readOnly: true}}
                         formatDate={date => moment(date).format('MM/DD/YYYY')}
                         parseDate={string => moment(string, 'MM/DD/YYYY').toISOString()}
                         placeholder={'MM/DD/YY'}
                         value={this.state.filter.createdDate ? new Date(this.state.filter.createdDate) : new Date()}
                         onChange={this.onFilterInput.bind(this, 'createdDate')}/>
            </div>
          </label>
        </th>
        <th>
          <label className="pt-label">
            Updated Date
            <div className="pt-input-group">
              <DateInput closeOnSelection={false}
                         showActionsBar={true}
                         inputProps={{readOnly: true}}
                         formatDate={date => moment(date).format('MM/DD/YYYY')}
                         parseDate={string => moment(string, 'MM/DD/YYYY').toISOString()}
                         placeholder={'MM/DD/YY'}
                         value={this.state.filter.updatedDate ? new Date(this.state.filter.updatedDate) : new Date()}
                         onChange={this.onFilterInput.bind(this, 'updatedDate')}/>
            </div>
          </label>
        </th>
      </tr>
      </thead>
    
    const $trows = this.state.filtered.map(poll => {
      return (
        <tr key={poll.id}>
          <td onClick={this.onPollClick.bind(this, poll.id)}>{truncate(poll.name, 20)}</td>
          <td onClick={this.onPollClick.bind(this, poll.id)}>{poll.entities.totalResults}</td>
          <td onClick={this.onPollClick.bind(this, poll.id)}>{moment(poll.createdDate).format('MM/DD/YY HH:mm:ss')}</td>
          <td onClick={this.onPollClick.bind(this, poll.id)}>{moment(poll.updatedDate).format('MM/DD/YY HH:mm:ss')}</td>
        </tr>
      )
    })
    
    const $tbody =
      <tbody>
      {$trows}
      </tbody>
    
    const $table = this.props.pollsData.loading ?
      <div style={{
        textAlign: 'center',
      }}>
        <div className={'spinner'}>
          <Spinner className={'pt-large'}/>
        </div>
      </div> :
      <div className={'table'}>
        <table className="pt-html-table pt-html-table-striped pt-html-table-bordered pt-interactive">
          {$thead}
          {$tbody}
        </table>
        <Pagination page={this.props.pollsData.polls.page}
                    totalResults={this.props.pollsData.polls.totalResults}
                    quantityPerPage={this.props.pollsData.polls.quantity}
                    onNavigate={this.props.goToPage}/>
      </div>
    
    return (
      <div className="Polls">
        {$table}
      </div>
    )
  }
}

export default compose(
  withRouter,
  withProps(() => {
    return {
      getPollsQueryVariables: () => {
        return {
          token: 'abcde',
          body: {
            page: 1,
            quantity: 20,
            sort: ['createdDateDESC'],
          },
        }
      },
    }
  }),
  graphql(pollsQuery, {
    fetchPolicy: 'cache-and-network',
    name: 'pollsData',
    options: (props) => {
      return {
        variables: props.getPollsQueryVariables(),
      }
    },
  }),
  withProps(props => {
    const pollsData = props.pollsData
    let polls = []
    if (pollsData && pollsData.polls && pollsData.polls.items) {
      polls = pollsData.polls.items
    }
    return {
      polls: polls,
      refetchPolls: pollsData.refetch,
      goToPage: async(page) => {
        const variables = props.getPollsQueryVariables()
        return props.pollsData.fetchMore({
          variables: {
            ...variables,
            ...{
              body: {
                ...variables.body,
                page,
              },
            },
          },
          updateQuery: (prev, {fetchMoreResult}) => {
            if (!fetchMoreResult) {
              return prev
            }
            return {
              ...prev,
              ...fetchMoreResult,
            }
          },
        })
      },
    }
  }),
  branch(
    (props) => {
      return props.pollsData.loading === false && !props.pollsData.polls
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
)(Polls)
