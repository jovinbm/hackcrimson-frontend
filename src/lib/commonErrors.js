import * as toaster from './toaster'

function resolveStructuredError(error) {
  toaster.warn({
    message: error.message,
  })
}

export async function resolveGraphQLErrors(d) {
  if (!d) {
    // this is a non-ideal state, better just return
  } else if (d.graphQLErrors && d.graphQLErrors.length > 0) {
    // we've got ourselves graphql errors, handle them
    [d.graphQLErrors[0]].map(error => {
      if ('msg' in error) {
        // this is one of our structured error from the backend
        resolveStructuredError(error)
      } else if (/.*was\snot\sprovided.*/.test(error.message)) {
        // some fields might be missing
        toaster.warn({
          message: 'Some fields not provided',
        })
      } else if (/.*got\sinvalid\svalue.*/.test(error.message)) {
        // some fields might be invalid
        toaster.warn({
          message: 'Invalid values on some fields',
        })
      } else {
        // situation not ideal, but what can we do? we really don't want to show
        // the users cryptic errors, but we don't have a choice
        toaster.warn({
          message: error.message,
        })
      }
      return true
    })
    console.error(d.graphQLErrors)
  } else if (d.networkError) {
    // this might be a network error. Apollo will put an
    // empty networkError object
    toaster.danger({
      message: 'A network error has occurred.',
    })
    console.error(d.networkError)
  }
}
