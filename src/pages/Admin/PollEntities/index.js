import './index.css'
import React, { Component } from 'react'
import { Button, Intent, Dialog, Spinner, NonIdealState } from '@blueprintjs/core'
import { DateInput } from '@blueprintjs/datetime'
import PropTypes from 'prop-types'
import debounce from 'debounce'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { compose, withProps, branch, renderComponent } from 'recompose'
import fuzzy from 'fuzzy'
import EntityPublish from '../EntityPublish'
import truncate from 'truncate'
import { updateSearchQueries } from '../../../lib/location/updateQueryString'
import moment from 'moment/moment'
import Pagination from '../../../components/Pagination'
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

class PollEntities extends Component {
  static propTypes = {
    // id is the id of the poll
    poll: PropTypes.object,
    refetchPoll: PropTypes.func.isRequired,
  }
  
  constructor() {
    super()
    const searchParams = new URLSearchParams(window.location.search)
    this.state = {
      filtered: [],
      filter: {
        name: searchParams.get('name') || '',
        createdDate: searchParams.get('createdDate') || '',
        updatedDate: searchParams.get('updatedDate') || '',
      },
      createEntity: {
        isOpen: false,
      },
      updateEntity: {
        isOpen: false,
        id: void 0,
      },
    }
  }
  
  filter = (entities) => {
    if (!entities) {
      entities = this.props.poll ? this.props.poll.entities.items : []
    }
    updateSearchQueries(this.state.filter)
    const {name, createdDate, updatedDate} = this.state.filter
    let filtered = entities
    
    if (name) {
      const fuzzyOptions = {
        extract: el => el.name || '',
      }
      filtered = fuzzy.filter(name, filtered, fuzzyOptions).map(j => j.original)
    }
    
    if (createdDate) {
      filtered = filtered.filter(entity => {
        return moment(createdDate).format('DD MM YY') === moment(entity.createdDate).format('DD MM YY')
      })
    }
    
    if (updatedDate) {
      filtered = filtered.filter(entity => {
        return moment(updatedDate).format('DD MM YY') === moment(entity.updatedDate).format('DD MM YY')
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
  
  onNewEntityClick = () => {
    this.setState({
      createEntity: {
        ...this.state.createEntity,
        isOpen: true,
      },
    })
  }
  
  onNewEntitySubmit = () => {
    this.setState({
      createEntity: {
        ...this.state.createEntity,
        isOpen: false,
      },
    }, this.props.refetchPoll)
  }
  
  onNewEntityCancel = () => {
    this.setState({
      createEntity: {
        ...this.state.createEntity,
        isOpen: false,
      },
    })
  }
  
  onEntityClick = (id) => {
    this.setState({
      updateEntity: {
        ...this.state.updateEntity,
        isOpen: true,
        id,
      },
    })
  }
  
  onUpdateEntitySubmit = () => {
    this.setState({
      updateEntity: {
        ...this.state.updateEntity,
        isOpen: false,
        id: void 0,
      },
    }, this.props.refetchPoll)
  }
  
  onUpdateEntityCancel = () => {
    this.setState({
      updateEntity: {
        ...this.state.updateEntity,
        isOpen: false,
        id: void 0,
      },
    })
  }
  
  onEntityDelete = () => {
    this.setState({
      updateEntity: {
        ...this.state.updateEntity,
        isOpen: false,
        id: void 0,
      },
    }, this.props.refetchPoll)
  }
  
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.poll !== nextProps.poll) {
      this.filter(nextProps.poll ? nextProps.poll.entities.items : [])
    }
  }
  
  componentDidMount() {
    this.filter()
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
          <th>
            Actions
          </th>
        </tr>
        </thead>
      
      const $trows = this.state.filtered.map(entity => {
        return (
          <tr key={entity.id}>
            <td>{truncate(entity.name, 20)}</td>
            <td>{moment(entity.createdDate).format('MM/DD/YY HH:mm:ss')}</td>
            <td>{moment(entity.updatedDate).format('MM/DD/YY HH:mm:ss')}</td>
            <td>
              <Button
                className="pt-button pt-small"
                text="Update"
                onClick={this.onEntityClick.bind(this, entity.id)}/>
            </td>
          </tr>
        )
      })
      
      const $tbody =
        <tbody>
        {$trows}
        </tbody>
      
      const $table =
        <div className={'table'}>
          <table className="pt-html-table pt-html-table-striped pt-html-table-bordered pt-interactive">
            {$thead}
            {$tbody}
          </table>
          <Pagination page={this.props.poll.entities.page}
                      totalResults={this.props.poll.entities.totalResults}
                      quantityPerPage={this.props.poll.entities.quantity}
                      onNavigate={this.props.goToPage}/>
        </div>
      
      $elem =
        <React.Fragment>
          <h1 className={'poll-heading'}>{this.props.poll.name}</h1>
          <div className="action-buttons">
            <Button className="pt-button" onClick={this.onNewEntityClick} text="New Entity" intent={Intent.PRIMARY}/>
          </div>
          {$table}
          <Dialog
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
            isCloseButtonShown={false}
            isOpen={this.state.createEntity.isOpen}
            title="Create Entity">
            <div className="pt-dialog-body">
              <EntityPublish onSubmit={this.onNewEntitySubmit} onCancel={this.onNewEntityCancel} action={'create'} pollId={this.props.poll.id}/>
            </div>
          </Dialog>
          <Dialog
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
            isCloseButtonShown={false}
            isOpen={this.state.updateEntity.isOpen}
            title="Update Entity">
            <div className="pt-dialog-body">
              <EntityPublish onSubmit={this.onUpdateEntitySubmit} onCancel={this.onUpdateEntityCancel} onDelete={this.onEntityDelete} action={'update'} id={this.state.updateEntity.id} pollId={this.props.poll.id}/>
            </div>
          </Dialog>
        </React.Fragment>
      
    }
    
    return (
      <div className="PollEntities">
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
      goToPage: async(page) => {
        const variables = props.getPollQueryVariables()
        return props.pollData.fetchMore({
          variables: {
            ...variables,
            page,
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
)(PollEntities)
