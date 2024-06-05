import { createRouter, createWebHistory } from "vue-router";
import TestPage from '../pages/Test.vue';
import MainPage from '../pages/Main.vue';
import AccountSignin from '../pages/AccountSignin.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: MainPage,
        },
        {
            path: '/test',
            component: TestPage,
        },
        {
            path: '/account-signin',
            component: AccountSignin,
            name: 'account-signin',
        },
        // {
        //     path: "/platform/profiles/users/:id/comments",
        //     name: "comments",
        //     component: Profile,
        //     meta: {
        //         roles: [
        //             "ROLE_ADMIN",
        //             "ROLE_USER_ADMIN_READ_ONLY",
        //         ],
        //     },
        // },
    ],
  });

// export default function ({ store /*, ssrContext */ }) {
//     const routes = [
//         {
//           path: '/test',
//           component: TestPage
//         }
//     ];
      
//     // ...
//     // Router.beforeEach((to, from, next) => {
//     //     if (to.matched.some(record => record.meta.requiresAuth) && !store.getters['auth/isSignedIn']) {
//     //     next({ name: 'account-signin', query: { next: to.fullPath } })
//     //     } else {
//     //     next()
//     //     }
//     // })
//     routes
// }

// router.beforeEach((to, from, next) => {
//     if (to.matched.some(record => record.meta.requiresAuth) && !store.getters['auth/isSignedIn']) {
//     next({ name: 'account-signin', query: { next: to.fullPath } })
//     } else {
//     next()
//     }
// })
// router.beforeEach((to, from, next) => {
//     const store = useAuthStore();
//     const { isSignedIn, signIn } = store;
//     if (to.matched.some(record => record.meta.requiresAuth) && !store.isSignedIn) {
//     next({ name: 'account-signin', query: { next: to.fullPath } })
//     } else {
//     next()
//     }
// })

export default router;