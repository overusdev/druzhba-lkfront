import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { decodeProtectToken } from './../modules/decodeProtectToken'

export const useAuthStore = defineStore('auth', () => {
    const checkIsSignedByCookie = computed(() => getCookie('user') === 'John');
    const adminData = reactive({
      name: '',
      isAdmin: '',
    });
    const domainAuth = import.meta.env.MODE === 'production'
      ? 'https://auth.druzba-nn.ru'
      : 'http://localhost:8004/';

    function getCookie(name) {
      console.log('NAME', name);
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        console.log('MATCHES', matches);
        console.log('document.cookie', document.cookie);
        console.log('document', document);
        console.log('window', window);
        return matches
          ? decodeProtectToken({ apiToken: decodeURIComponent(matches[1]) })
          : undefined;
    }

    function getCookie1(name) {
      const fullCookieString = '; ' + document.cookie;
      const splitCookie = fullCookieString.split('; ' + name + '=');
      return splitCookie.length === 2 ? decodeProtectToken({ apiToken: decodeURIComponent(splitCookie.pop().split(';').shift()) }) : null;
    }

    function parseJwt (token) {
        if(!token) {
          console.log('Token not provided');
          window.location.replace(domainAuth);
          return;
        }
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        console.log(JSON.parse(jsonPayload));
    
        return JSON.parse(jsonPayload);
    }

    function deleteCookie(name) {
      setCookie(name, "", {
        'max-age': -1
      })
    }
    
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

    return {
        setCookie,
        getCookie,
        getCookie1,
        deleteCookie,
        checkIsSignedByCookie,
        parseJwt,
        adminData,
    }
});