module.exports = {
  apiUrl: process.env.REACT_APP_API_URL || 'https://lvote-api-staging.herokuapp.com/api',
  // graphqlUrl: process.env.REACT_APP_API_URL || 'https://lvote-api-staging.herokuapp.com/graphql',
  graphqlUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/graphql',
  siteURL: process.env.REACT_APP_URL || 'https://lvote-api-staging.herokuapp.com',
}