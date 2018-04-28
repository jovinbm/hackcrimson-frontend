import './index.css'
import React, { Component } from 'react'
import { Button, Intent, Spinner, Popover, PopoverInteractionKind, NonIdealState, TextArea } from '@blueprintjs/core'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { compose, withProps, renderComponent, branch } from 'recompose'
import shallowEqual from 'shallowequal'
import * as toaster from '../../../lib/toaster'

class Root extends Component {
  render() {
    return (
      <div className="EntityPublish">
        {this.props.children}
      </div>
    )
  }
}

const entityQuery = gql`
  query getEntity ($token: String!, $id: MongooseObjectId!){
    entity(token: $token, id: $id){
      id,
      name,
      description,
    }
  }
`

const createEntityMutation = gql`
  mutation createEntity($token: String!, $body: entityCreateBody!){
    entityCreate(token: $token, body: $body){
      id,
      name,
      description,
    }
  }
`

const updateEntityMutation = gql`
  mutation updateEntity($token: String!, $body: entityUpdateBody!){
    entityUpdate(token: $token, body: $body){
      id,
      name,
      description,
    }
  }
`

const deleteEntityMutation = gql`
  mutation deleteEntity($token: String!, $body: entityDeleteBody!){
    entityDelete(token: $token, body: $body){
      id,
    }
  }
`

class EntityPublish extends Component {
  static propTypes = {
    action: PropTypes.oneOf(['create', 'update']).isRequired,
    pollId: PropTypes.string.isRequired,
    id: function(props, propName, componentName) {
      if (props.action === 'update' && !props[propName]) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. ${propName} required during update.`)
      }
    },
    entityData: PropTypes.object,
    createEntity: PropTypes.func,
    updateEntity: PropTypes.func,
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
  
  createEntity = async(event) => {
    this.busy(true)
    event.preventDefault()
    try {
      toaster.info({
        message: 'Creating entity...',
      })
      const {data: {entityCreate: entity}} = await this.props.createEntity({
        variables: {
          token: 'abcde',
          body: {
            name: this.state.name,
            description: this.state.description,
            pollId: this.props.pollId,
          },
        },
      })
      toaster.success({
        message: 'Entity created!',
      })
      this.busy(false)
      await this.props.onSubmit(entity.id)
    } catch (e) {
      this.busy(false)
      console.error(e)
    }
  }
  
  updateEntity = async(event) => {
    event.preventDefault()
    this.busy(true)
    try {
      toaster.info({
        message: 'Updating entity...',
      })
      const {data: {entityUpdate: entity}} = await this.props.updateEntity({
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
        message: 'Entity updated!',
      })
      this.busy(false)
      await this.props.onSubmit(entity.id)
    } catch (e) {
      this.busy(false)
      console.error(e)
    }
  }
  
  deleteEntity = async(event) => {
    event.preventDefault()
    this.busy(true)
    try {
      toaster.info({
        message: 'Deleting entity...',
      })
      await this.props.deleteEntity({
        variables: {
          token: 'abcde',
          body: {
            id: this.props.id,
          },
        },
      })
      toaster.success({
        message: 'Entity deleted!',
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
    // be waiting for the entity to come from the server
    // when it comes back, update state
    if (nextProps.action === 'update') {
      const nextEntity = nextProps.entityData.entity
      const thisEntity = this.props.entityData.entity
      if (!shallowEqual(nextEntity, thisEntity)) {
        this.setState({
          name: nextEntity.name || '',
          dorm: nextEntity.description || '',
        })
      }
    }
  }
  
  componentDidMount() {
    // if update, set entity details in state
    if (this.props.action === 'update') {
      const thisEntity = this.props.entityData.entity
      if (thisEntity) {
        this.setState({
          name: thisEntity.name || '',
          description: thisEntity.description || '',
        })
      }
    }
  }
  
  render() {
    const $body =
      <div>
        <form id="entityPublish" onSubmit={this.createEntity}>
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
            <p>You are about to delete this entity!</p>
            <Button
              className="pt-button pt-fill"
              intent={Intent.DANGER}
              text="Confirm Delete"
              disabled={this.state.busy}
              onClick={this.deleteEntity}/>
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
            <p>You are about to save this entity!</p>
            <Button
              className="pt-button pt-fill"
              intent={Intent.PRIMARY}
              text={this.props.action === 'create' ? 'Confirm Create' : 'Confirm Update'}
              disabled={this.state.busy}
              type="submit"
              form="entityPublish"
              onClick={this.props.action === 'create' ? this.createEntity : this.updateEntity}/>
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
  graphql(entityQuery, {
    fetchPolicy: 'cache-and-network',
    name: 'entityData',
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
  graphql(createEntityMutation, {
    name: 'createEntityMutation',
  }),
  graphql(updateEntityMutation, {
    name: 'updateEntityMutation',
  }),
  graphql(deleteEntityMutation, {
    name: 'deleteEntityMutation',
  }),
  withProps(props => {
    return {
      createEntity: async(...args) => {
        return props.createEntityMutation(...args)
      },
      updateEntity: async(...args) => {
        return props.updateEntityMutation(...args)
      },
      deleteEntity: async(...args) => {
        return props.deleteEntityMutation(...args)
      },
    }
  }),
  branch(
    (props) => {
      return props.action === 'update' && props.entityData.loading
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
      return props.action === 'update' && !props.entityData.entity
    },
    renderComponent((props) => {
      return <Root>
        <NonIdealState title={'Entity not found'}
                       description={`Entity with id ${props.id} not found`}
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
)(EntityPublish)
