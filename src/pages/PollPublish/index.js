import './index.css'
import React, { Component } from 'react'
import { Button, Intent, Spinner, Popover, PopoverInteractionKind, NonIdealState, TextArea } from '@blueprintjs/core'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { compose, withProps, renderComponent, branch } from 'recompose'
import shallowEqual from 'shallowequal'
import * as toaster from '../../lib/toaster'

class Root extends Component {
  render() {
    return (
      <div className="PollPublish">
        {this.props.children}
      </div>
    )
  }
}

const pollQuery = gql`
  query getPoll ($token: String!, $id: MongooseObjectId!){
    poll(token: $token, id: $id){
      id,
      name,
      description,
    }
  }
`

const createPollMutation = gql`
  mutation createPoll($token: String!, $body: pollCreateBody!){
    pollCreate(token: $token, body: $body){
      id,
      name,
      description,
    }
  }
`

const updatePollMutation = gql`
  mutation updatePoll($token: String!, $body: pollUpdateBody!){
    pollUpdate(token: $token, body: $body){
      id,
      name,
      description,
    }
  }
`

const deletePollMutation = gql`
  mutation deletePoll($token: String!, $body: pollDeleteBody!){
    pollDelete(token: $token, body: $body){
      id,
    }
  }
`

class PollPublish extends Component {
  static propTypes = {
    action: PropTypes.oneOf(['create', 'update']).isRequired,
    id: function(props, propName, componentName) {
      if (props.action === 'update' && !props[propName]) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. ${propName} required during update.`)
      }
    },
    pollData: PropTypes.object,
    createPoll: PropTypes.func,
    updatePoll: PropTypes.func,
    // when onCancel is provided, the component will show the cancel button
    onCancel: PropTypes.func,
    onDelete: function(props, propName, componentName) {
      if (props.action === 'update' && typeof props[propName] !== 'function') {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. ${propName} required and must be function during update.`)
      }
    },
    onSubmit: PropTypes.func.isRequired,
  }
  
  state = {
    name: '',
    description: '',
    busy: false,
  }
  
  busy = (status) => {
    this.setState({busy: status})
  }
  
  createPoll = async(event) => {
    this.busy(true)
    event.preventDefault()
    try {
      toaster.info({
        message: 'Creating poll...',
      })
      const {data: {pollCreate: poll}} = await this.props.createPoll({
        variables: {
          token: 'abcde',
          body: {
            name: this.state.name,
            description: this.state.description,
          },
        },
      })
      toaster.success({
        message: 'Poll created!',
      })
      this.busy(false)
      await this.props.onSubmit(poll.id)
    } catch (e) {
      this.busy(false)
      console.error(e)
    }
  }
  
  updatePoll = async(event) => {
    event.preventDefault()
    this.busy(true)
    try {
      toaster.info({
        message: 'Updating poll...',
      })
      const {data: {pollUpdate: poll}} = await this.props.updatePoll({
        variables: {
          token: 'abcde',
          body: {
            id: this.props.id,
            name: this.state.name,
            description: this.state.description,
          },
        },
      })
      toaster.success({
        message: 'Poll updated!',
      })
      this.busy(false)
      await this.props.onSubmit(poll.id)
    } catch (e) {
      this.busy(false)
      console.error(e)
    }
  }
  
  deletePoll = async(event) => {
    event.preventDefault()
    this.busy(true)
    try {
      toaster.info({
        message: 'Deleting poll...',
      })
      await this.props.deletePoll({
        variables: {
          token: 'abcde',
          body: {
            id: this.props.id,
          },
        },
      })
      toaster.success({
        message: 'Poll deleted!',
      })
      this.busy(false)
      await this.props.onDelete()
    } catch (e) {
      this.busy(false)
      console.error(e)
    }
  }
  
  onNameChange = (event) => {
    this.setState({
      name: event.target.value,
    })
  }
  
  onDescriptionChange = (event) => {
    this.setState({
      description: event.target.value,
    })
  }
  
  UNSAFE_componentWillReceiveProps(nextProps) {
    // if this is an update action, then we will
    // be waiting for the poll to come from the server
    // when it comes back, update state
    if (nextProps.action === 'update') {
      const nextPoll = nextProps.pollData.poll
      const thisPoll = this.props.pollData.poll
      if (!shallowEqual(nextPoll, thisPoll)) {
        this.setState({
          name: nextPoll.name || '',
          dorm: nextPoll.description || '',
        })
      }
    }
  }
  
  componentDidMount() {
    // if update, set poll details in state
    if (this.props.action === 'update') {
      const thisPoll = this.props.pollData.poll
      if (thisPoll) {
        this.setState({
          name: thisPoll.name || '',
          description: thisPoll.description || '',
        })
      }
    }
  }
  
  render() {
    const $body =
      <div>
        <form id="pollPublish" onSubmit={this.createPoll}>
          <label className="pt-label">
            Name
            <span className="pt-text-muted"> (required)</span>
            <input className="pt-input pt-fill" placeholder="Name" value={this.state.name} onChange={this.onNameChange}/>
          </label>
          <label className="pt-label">
            Description
            <span className="pt-text-muted"> (required)</span>
            <TextArea
              className={'pt-fill'}
              large={true}
              intent={Intent.PRIMARY}
              onChange={this.onDescriptionChange}
              value={this.state.description}
            />
          </label>
        </form>
      </div>
    
    const $cancelButton = this.props.onCancel ?
      <Button
        className="pt-button"
        text="Cancel"
        disabled={this.state.busy}
        onClick={this.props.onCancel}/> :
      false
    
    const $deleteButton = this.props.action === 'update' ?
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName="pt-popover-content-sizing"
        rootElementTag={'button'}
        className={'pt-button pt-intent-danger'}
        content={
          <React.Fragment>
            <p>You are about to delete this poll!</p>
            <Button
              className="pt-button pt-fill"
              intent={Intent.DANGER}
              text="Confirm Delete"
              disabled={this.state.busy}
              onClick={this.deletePoll}/>
          </React.Fragment>
        }
        target={
          <div style={{textAlign: 'center'}}>Delete</div>
        }
      /> :
      false
    
    const $publishButton =
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName="pt-popover-content-sizing"
        rootElementTag={'button'}
        className={'pt-button pt-intent-primary'}
        content={
          <React.Fragment>
            <p>You are about to save this poll!</p>
            <Button
              className="pt-button pt-fill"
              intent={Intent.PRIMARY}
              text={this.props.action === 'create' ? 'Confirm Create' : 'Confirm Update'}
              disabled={this.state.busy}
              type="submit"
              form="pollPublish"
              onClick={this.props.action === 'create' ? this.createPoll : this.updatePoll}/>
          </React.Fragment>
        }
        target={
          <div style={{textAlign: 'center'}}>Submit</div>
        }
      />
    
    const $buttons = <div className="pt-button-group pt-fill">
      {$cancelButton}
      {$deleteButton}
      {$publishButton}
    </div>
    
    return (
      <Root>
        {$body}
        {$buttons}
      </Root>
    )
  }
}

export default compose(
  graphql(pollQuery, {
    fetchPolicy: 'cache-and-network',
    name: 'pollData',
    skip: props => props.action === 'create',
    options: (props) => {
      return {
        variables: {
          token: 'abcde',
          id: props.id,
        },
      }
    },
  }),
  graphql(createPollMutation, {
    name: 'createPollMutation',
  }),
  graphql(updatePollMutation, {
    name: 'updatePollMutation',
  }),
  graphql(deletePollMutation, {
    name: 'deletePollMutation',
  }),
  withProps(props => {
    return {
      createPoll: async(...args) => {
        return props.createPollMutation(...args)
      },
      updatePoll: async(...args) => {
        return props.updatePollMutation(...args)
      },
      deletePoll: async(...args) => {
        return props.deletePollMutation(...args)
      },
    }
  }),
  branch(
    (props) => {
      return props.action === 'update' && props.pollData.loading
    },
    renderComponent(() => {
      return <Root>
        <div className={'spinner'}>
          <Spinner className={'pt-large'}/>
        </div>
      </Root>
    })
  ),
  branch(
    (props) => {
      return props.action === 'update' && !props.pollData.poll
    },
    renderComponent((props) => {
      return <Root>
        <NonIdealState title={'Poll not found'}
                       description={`Poll with id ${props.id} not found`}
                       visual={'graph-remove'}
                       action={
                         <Button
                           className="pt-button"
                           text="Close"
                           onClick={props.onCancel}/>
                       }/>
      </Root>
    })
  ),
)(PollPublish)
