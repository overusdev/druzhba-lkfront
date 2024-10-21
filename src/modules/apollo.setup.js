import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from "apollo-link-context";
import { onError } from '@apollo/client/link/error';
import { logErrorMessages } from '@vue/apollo-util';
import { ApolloLink, Observable } from 'apollo-link';


const cache = new InMemoryCache();
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql'
});

// Handle errors
const errorLink = onError(error => {
  if(error.response.errors[0].message === 'Unauthorized') {
    window.location.replace('http://localhost:8004');
  }
  if (process.env.NODE_ENV !== 'production') {
    logErrorMessages(error);
  }
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
  link: ApolloLink.from([
    errorLink,
    authLink,
    httpLink
  ]),
  credentials: 'include',
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