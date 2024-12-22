import { createRouter, createWebHistory } from "vue-router";
import TestPage from '../pages/Test.vue';
import MainPage from '../pages/Main.vue';
import UsersPage from '../pages/Users.vue';
import AddUserPage from '../pages/AddUser.vue';
import EditUserPage from '../pages/EditUser.vue';
import NewsPage from '../pages/News.vue';
import DocsPage from '../pages/Docs.vue';
import AdsPage from '../pages/Ads.vue';
import AddNewsPage from '../pages/AddNews.vue';
import AddAdPage from '../pages/AddAd.vue';
import AddDocPage from '../pages/AddDoc.vue';
import EditNewsPage from '../pages/EditNews.vue';
import EditAdPage from '../pages/EditAd.vue';
import EditDocPage from '../pages/EditDoc.vue';
import CreateContactsPage from '../pages/CreateContactsPage.vue';
import EditContactsPage from '../pages/EditContactsPage.vue';
import CompletedContactsPage from '../pages/CompletedContactsPage.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: MainPage,
            name: 'main',
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/test',
            name: 'test',
            component: TestPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/users',
            name: 'users',
            component: UsersPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/add-user',
            name: 'add-user',
            component: AddUserPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/edit-user/:id',
            name: 'edit-user',
            component: EditUserPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/news',
            name: 'news',
            component: NewsPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/docs',
            name: 'docs',
            component: DocsPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/ads',
            name: 'ads',
            component: AdsPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/add-news',
            name: 'add-news',
            component: AddNewsPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/add-ad',
            name: 'add-ad',
            component: AddAdPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/add-doc',
            name: 'add-doc',
            component: AddDocPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/edit-news/:id',
            name: 'edit-news',
            component: EditNewsPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/edit-ad/:id',
            name: 'edit-ad',
            component: EditAdPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/edit-doc/:id',
            name: 'edit-doc',
            component: EditDocPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/contacts-create',
            name: 'contacts-create',
            component: CreateContactsPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/contacts-update',
            name: 'contacts-update',
            component: EditContactsPage,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/completed-contacts-page',
            name: 'completed-contacts-page',
            component: CompletedContactsPage,
            meta: {
                requiresAuth: true
            }
        },
    ],
  });

export default router;