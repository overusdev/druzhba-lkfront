import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const checkIsSignedByCookie = computed(() => getCookie('user') === 'John');
    const adminName = ref('');
    const isSignedIn = computed(() => !!adminName.value);
    const isNotAdmin = ref(false);

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function parseJwt (token) {
        if(!token) {
          window.location.replace('http://localhost:8004');
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
        deleteCookie,
        checkIsSignedByCookie,
        parseJwt,
        adminName,
        isSignedIn,
        isNotAdmin
    }
});