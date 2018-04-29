module.exports = {
  apiUrl: process.env.REACT_APP_API_URL || 'https://lvote-api-staging.herokuapp.com/api',
  // graphqlUrl: process.env.REACT_APP_API_URL || 'https://lvote-api-staging.herokuapp.com/graphql',
  graphqlUrl: 'http://localhost:5000/graphql',
  graphqlWSUrl: 'ws://localhost:5000/subscriptions',
  siteURL: process.env.REACT_APP_URL || 'https://lvote-api-staging.herokuapp.com',
}