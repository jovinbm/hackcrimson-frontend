import ApolloClient from 'apollo-client'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
import config from '../../config'
import { resolveGraphQLErrors } from '../../lib/commonErrors'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

const wsLink = new WebSocketLink({
  uri: config.graphqlWSUrl,
  options: {
    reconnect: true,
  },
})

const httpLink = new HttpLink({
  uri: config.graphqlUrl,
})

const link = split(
  // split based on operation type
  ({query}) => {
    const {kind, operation} = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const cache = new InMemoryCache()

const resolveErrorsLink = onError(async data => {
  await resolveGraphQLErrors(data)
})

const client = new ApolloClient({
  link: resolveErrorsLink.concat(link),
  cache,
})

export default client