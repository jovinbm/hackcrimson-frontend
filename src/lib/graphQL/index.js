import ApolloClient from 'apollo-client'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
import config from '../../config'
import { resolveGraphQLErrors } from '../../lib/commonErrors'
import { createUploadLink } from 'apollo-upload-client'

const uploadLink = createUploadLink({
  includeExtensions: true,
  uri: config.graphqlUrl,
})
const cache = new InMemoryCache()

const resolveErrorsLink = onError(async data => {
  await resolveGraphQLErrors(data)
})

const client = new ApolloClient({
  link: resolveErrorsLink.concat(uploadLink),
  cache,
})

export default client