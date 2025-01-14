import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from "apollo-link-context";
import { onError } from '@apollo/client/link/error';
import { logErrorMessages } from '@vue/apollo-util';
import { ApolloLink, Observable } from 'apollo-link';
import { decodeProtectToken } from './../modules/decodeProtectToken'

const cache = new InMemoryCache();
const domainApi = import.meta.env.MODE === 'production'
  ? 'https://druzba-nn.ru/graphql'
  : 'http://localhost:3001/graphql';
const httpLink = createHttpLink({
  uri: domainApi
});
const domainAuth = import.meta.env.MODE === 'production'
  ? 'https://auth.druzba-nn.ru'
  : 'http://localhost:8004/';

function setCookie(name, value, options = {}) {
    
  options = {
    path: '/',
    // при необходимости добавьте другие значения по умолчанию
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}

// Handle errors
const errorLink = onError(error => {
  if(error.response.errors[0].message === 'Unauthorized') {
    let date = new Date(Date.now());
    let dateNow = date.getTime() / 1000;
    console.log('Unauthorized', dateNow );
    deleteCookie('dr_access_token');
    // localStorage.removeItem('dr_access_token');
    window.location.replace(domainAuth);
  }
  if (process.env.NODE_ENV !== 'production') {
    logErrorMessages(error);
  }
});

const authLink = setContext((_, { headers }) => {
  const jwt = getCookie('dr_access_token');
  // const jwt = localStorage.getItem('dr_access_token');

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
  // credentials: 'include',
  // credentials: 'same-origin',
  fetchOptions: {
    mode: 'no-cors'
  },
  cache,
});

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches
    ? decodeProtectToken({ apiToken: decodeURIComponent(matches[1])})
    : undefined;
}

export default {
    default: apolloClient,
};