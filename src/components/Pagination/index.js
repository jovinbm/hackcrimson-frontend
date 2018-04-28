import './Pagination.css'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, ButtonGroup, Classes } from '@blueprintjs/core'

class First extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    onNavigate: PropTypes.func.isRequired,
  }
  
  navigate = (e) => {
    e.preventDefault()
    return this.props.onNavigate(1)
  }
  
  render() {
    return (
      <Button disabled={this.props.page === 1} onClick={this.navigate}>First</Button>
    )
  }
}

class Next extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    totalResults: PropTypes.number.isRequired,
    quantityPerPage: PropTypes.number.isRequired,
    onNavigate: PropTypes.func.isRequired,
  }
  
  navigate = (e) => {
    e.preventDefault()
    return this.props.onNavigate(this.props.page + 1)
  }
  
  render() {
    const totalPages = Math.ceil(this.props.totalResults / this.props.quantityPerPage)
    return (
      <Button disabled={this.props.page >= totalPages} onClick={this.navigate}>Next</Button>
    )
  }
}

class Prev extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    onNavigate: PropTypes.func.isRequired,
  }
  
  navigate = (e) => {
    e.preventDefault()
    return this.props.onNavigate(this.props.page - 1)
  }
  
  render() {
    return (
      <Button disabled={this.props.page === 1} onClick={this.navigate}>Prev</Button>
    )
  }
}

class Last extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    totalResults: PropTypes.number.isRequired,
    quantityPerPage: PropTypes.number.isRequired,
    onNavigate: PropTypes.func.isRequired,
  }
  
  navigate = (e) => {
    e.preventDefault()
    return this.props.onNavigate(Math.ceil(this.props.totalResults / this.props.quantityPerPage))
  }
  
  render() {
    const totalPages = Math.ceil(this.props.totalResults / this.props.quantityPerPage)
    return (
      <Button disabled={this.props.page >= totalPages} onClick={this.navigate}>Last</Button>
    )
  }
}

class PageNumber extends React.Component {
  static propTypes = {
    pageNumber: PropTypes.number.isRequired,
    onNavigate: PropTypes.func.isRequired,
  }
  
  navigate = (e) => {
    e.preventDefault()
    return this.props.onNavigate(this.props.pageNumber)
  }
  
  render() {
    const classes = ['PageNumber']
    if (this.props.pageNumber === this.props.page) {
      classes.push('active')
    }
    return (
      <Button className={classes.join(' ')} onClick={this.navigate}>{this.props.pageNumber}</Button>
    )
  }
}

class Pagination extends React.Component {
  static defaultProps = {
    visiblePages: 10,
  }
  
  static propTypes = {
    page: PropTypes.number.isRequired,
    totalResults: PropTypes.number.isRequired,
    quantityPerPage: PropTypes.number.isRequired,
    visiblePages: PropTypes.number,
    onNavigate: PropTypes.func.isRequired,
  }
  
  render() {
    if (this.props.totalResults <= this.props.quantityPerPage) {
      return false
    }
    const totalPages = Math.ceil(this.props.totalResults / this.props.quantityPerPage)
    const $pageNumbers = []
    const minPageNumber = Math.max(1, this.props.page - Math.ceil(this.props.visiblePages / 2))
    const maxPageNumber = Math.min(minPageNumber + this.props.visiblePages - 1, totalPages)
    for (let i = minPageNumber; i <= maxPageNumber; i++) {
      $pageNumbers.push(
        <PageNumber key={i}
                    page={this.props.page}
                    pageNumber={i}
                    onNavigate={this.props.onNavigate}/>
      )
    }
    return (
      <div className="Pagination">
        <ButtonGroup className={Classes.ALIGN_LEFT}>
          <First page={this.props.page}
                 totalResults={this.props.totalResults}
                 quantityPerPage={this.props.quantityPerPage}
                 onNavigate={this.props.onNavigate}/>
          <Prev page={this.props.page}
                totalResults={this.props.totalResults}
                quantityPerPage={this.props.quantityPerPage}
                onNavigate={this.props.onNavigate}/>
          <Next page={this.props.page}
                totalResults={this.props.totalResults}
                quantityPerPage={this.props.quantityPerPage}
                onNavigate={this.props.onNavigate}/>
          {$pageNumbers}
          <Last page={this.props.page}
                totalResults={this.props.totalResults}
                quantityPerPage={this.props.quantityPerPage}
                onNavigate={this.props.onNavigate}/>
        </ButtonGroup>
      </div>
    )
  }
}

export default Pagination