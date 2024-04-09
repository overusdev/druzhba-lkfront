import { createApp, provide, h } from 'vue'
import { createPinia } from 'pinia'
import router from "./router";
import { Quasar } from 'quasar';

import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css';
import '@quasar/extras/material-icons-round/material-icons-round.css';
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css';

// A few examples for animations from Animate.css:
import '@quasar/extras/animate/fadeIn.css';
import '@quasar/extras/animate/fadeOut.css';

import apolloClients from "./modules/apollo.setup";
import { ApolloClients } from "@vue/apollo-composable";

// Import Quasar css
import 'quasar/src/css/index.sass';
import App from './App.vue';
const pinia = createPinia();
// const app = createApp(App);

const app = createApp({
  setup() {
    provide(ApolloClients, apolloClients);
    // provide(ApolloClients, {
    //   default: apolloClient,
    // })
  },
  render: () => h(App),
});

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
  /*
  config: {
    brand: {
      // primary: '#e46262',
      // ... or all other brand colors
    },
    notify: {...}, // default set of options for Notify Quasar plugin
    loading: {...}, // default set of options for Loading Quasar plugin
    loadingBar: { ... }, // settings for LoadingBar Quasar plugin
    // ..and many more (check Installation card on each Quasar component/directive/plugin)
  }
  */
});

app.use(pinia);
app.use(router);
app.mount('#app');

