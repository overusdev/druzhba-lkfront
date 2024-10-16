import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from "apollo-link-context";

const cache = new InMemoryCache();
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql',
});

const authLink = setContext((_, { headers }) => {
  const jwt = getCookie('dr_access_token');

  return {
    headers: {
      ...headers,
      authorization: jwt ? `Bearer ${jwt}` : "",
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export default {
    default: apolloClient,
};