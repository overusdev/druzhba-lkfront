<template>
  <tempalte v-if="!authStore.adminData.isAdmin">
    <div class="no-access text-weight-bold">Отказано в доступе. Вы не являетесь администратором</div>
  </tempalte>
  <tempalte v-else>
    <div v-if="loading" class="loading">
    <q-spinner-puff class="teal" size="5.5em" />
    </div>
    <q-layout v-else view="lHh Lpr lff" container style="height: 100vh" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-cyan-10">
        <q-toolbar>
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
          <q-toolbar-title>Панель администратора</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="drawer"
        show-if-above
        :width="drawerWidth"
        :breakpoint="400"
        class="sidebar"
      > 
        <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
          <q-list padding>
            <router-link to="/users" class="router-link">
              <div
                class="sidebar__item"
                :class="{'sidebar__item--active': route.path === '/users'}"
              >
                <q-item-section avatar>
                <q-icon name="people" color="blue" />
                </q-item-section>
                <div class="sidebar__item-text">
                  Участки <span v-if="areasCount" class="sidebar__count">{{ areasCount }}</span>
                </div>
              </div>
            </router-link>

            <router-link to="/news" class="router-link">
              <div
                class="sidebar__item"
                :class="{'sidebar__item--active': route.path === '/news'}"
              >
                <q-item-section avatar>
                  <q-icon name="newspaper" color="orange" />
                </q-item-section>

                <div class="sidebar__item-text">
                  Новости <span v-if="newsCount" class="sidebar__count">{{ newsCount }}</span>
                </div>
              </div>
            </router-link>

            <router-link to="/ads" class="router-link">
              <div
                class="sidebar__item"
                :class="{'sidebar__item--active': route.path === '/ads'}"
              >
                <q-item-section avatar>
                <q-icon name="description" color="green"/>
                </q-item-section>

                <div class="sidebar__item-text">
                  Объявления <span v-if="adsCount" class="sidebar__count">{{ adsCount }}</span>
                </div>
              </div>
            </router-link>

            <router-link to="/contacts-create" class="router-link disabled">
              <div
                class="sidebar__item"
                :class="{'sidebar__item--active': route.path === '/contacts-create'}"
              >
                <q-item-section avatar>
                    <q-icon name="location_on" color="grey"/>
                </q-item-section>

                <div class="sidebar__item-text">
                  Контакты
                </div>
              </div>
            </router-link>

            <router-link to="/contacts-update" class="router-link">
              <div
                class="sidebar__item"
                :class="{'sidebar__item--active': route.path === '/contacts-update'}"
              >
                <q-item-section avatar>
                  <q-icon name="location_on" color="teal-7"/>
                </q-item-section>

                <div class="sidebar__item-text">
                  Контакты редактировать
                </div>
              </div>
            </router-link>

            <router-link to="/docs" class="router-link">
              <div
                class="sidebar__item"
                :class="{'sidebar__item--active': route.path === '/docs'}"
              >
                <q-item-section avatar>
                  <q-icon name="file_open" color="blue"/>
                </q-item-section>

                <div class="sidebar__item-text">
                  Документы <span v-if="docsCount" class="sidebar__count">{{ docsCount }}</span>
                </div>
              </div>
            </router-link>
            <div
              class="sidebar__item"
            >
              <q-item-section avatar>
                <q-icon name="logout" color="red"/>
              </q-item-section>

              <div class="sidebar__item-text" @click="logOut">
                Выйти
              </div>
            </div>
          </q-list>
        </q-scroll-area>

        <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <component :is="components[currentSheet]" class="sidebar__admin-icon"/>
            </q-avatar>
            <div v-if="authStore.adminData.name" class="text-weight-bold">{{ authStore.adminData.name }}</div>
            <div>Администратор</div>
          </div>
        </q-img>
      </q-drawer>

      <q-page-container>
          <router-view/>
      </q-page-container>
    </q-layout>
  </tempalte>
</template>

<script setup>
import {
  ref, 
  computed, 
  reactive, 
  onMounted, 
  onBeforeMount, 
  watch
} from 'vue';
import gql from 'graphql-tag';
import apolloClients from "./modules/apollo.setup";
import { provideApolloClient, useQuery } from "@vue/apollo-composable";
import { useGeometryStore } from './stores/geometry';
import { useAuthStore } from './stores/auth';
import { useRoute } from "vue-router";
import AdminGirl from './components/icons/admin-girl.vue';
import AdminBoy from './components/icons/AdminBoy.vue';

const components = {
  AdminGirl,
  AdminBoy,
};
const currentSheet = computed(() => authStore.adminData.name === 'Сергей' ? 'AdminBoy' : 'AdminGirl');
const drawer = ref(false);
const loading = ref(false);
const areasCount = ref(0);
const newsCount = ref(0);
const adsCount = ref(0);
const docsCount = ref(0);
const store = useGeometryStore();
const authStore = useAuthStore();
const drawerWidth = computed(() => store.isMobile ? 300 : 400);
const domainAuth = import.meta.env.MODE === 'production'
  ? 'https://auth.druzba-nn.ru'
  : 'http://localhost:8004/';
const route = useRoute();


function logOut() {
  loading.value = true;
  authStore.logOut('dr_access_token');
}

async function checkTokenExpires(tokenExpires) {
    let date = new Date(Date.now());
    let dateNow = date.getTime() / 1000;

    // console.log(tokenExpires);
    // console.log(date.getTime() / 1000);

    if(dateNow > tokenExpires) {
        window.location.replace(domainAuth);
        return console.log('Oh, I accidentally fell...(((');
    }
}

async function getUsersCount() {
    provideApolloClient(apolloClients.default);
    const result = useQuery(
      gql`
        query findAllCount {
            usersCount
        }
      `,
    );

    return new Promise((resolve, reject) => {
      result.onResult(() => {
        resolve(result.result.value?.usersCount || 0);
        areasCount.value =
          result.result.value?.usersCount;
      });
      result.onError(() => {
        reject();
      });
    });
}

async function getNewsCount() {
    provideApolloClient(apolloClients.default);
    const result = useQuery(
      gql`
        query findAllCount {
            newsCount
        }
      `,
    );

    return new Promise((resolve, reject) => {
      result.onResult(() => {
        resolve(result.result.value?.newsCount || 0);
        newsCount.value =
          result.result.value?.newsCount;
      });
      result.onError(() => {
        reject();
      });
    });
}

async function getDocsCount() {
    provideApolloClient(apolloClients.default);
    const result = useQuery(
      gql`
        query findAllCount {
            docsCount
        }
      `,
    );

    return new Promise((resolve, reject) => {
      result.onResult(() => {
        resolve(result.result.value?.docsCount || 0);
        docsCount.value =
          result.result.value?.docsCount;
      });
      result.onError(() => {
        reject();
      });
    });
}

async function getAdsCount() {
    provideApolloClient(apolloClients.default);
    const result = useQuery(
      gql`
        query findAllCount {
            adsCount
        }
      `,
    );

    return new Promise((resolve, reject) => {
      result.onResult(() => {
        resolve(result.result.value?.adsCount || 0);
        adsCount.value =
          result.result.value?.adsCount;
      });
      result.onError(() => {
        reject();
      });
    });
}

setInterval(async() => {
    await checkTokenExpires(authStore.parseJwt(authStore.getCookie('dr_access_token')).exp);
}, 2000);

onBeforeMount(async() => {
    await getUsersCount();
    await getNewsCount();
    await getAdsCount();
    await getDocsCount();
})

onMounted(async () => {
    authStore.adminData.name = authStore.parseJwt(authStore.getCookie('dr_access_token')).username;
    authStore.adminData.isAdmin = authStore.parseJwt(authStore.getCookie('dr_access_token')).isAdmin;

  if(!authStore.adminData.isAdmin) {
    authStore.logOut('dr_access_token');
  }
});

</script>
<style scoped lang="scss">

.sidebar {
  &__item {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 48px;
    padding: 8px 16px;
    @media screen and (min-width: 768px) {
      transition: all .2s ease-in-out;
      filter: grayscale(1);
      cursor: pointer;

      &:hover {
        filter: none;

        .sidebar__item-text {
          opacity: 1;
        }
        .sidebar__count {
          opacity: .4;
        }
      }
    }

    &--active {
      filter: none;

      .sidebar__item-text {
        opacity: 1;
      }
      @media screen and (min-width: 768px) {
        &:hover {
          filter: none;

          .sidebar__count {
            opacity: 1;
          }
        }
      }
    }
  }
  &__admin-icon {
    width: 40px;
    height: 40px;
  }
  &__item-text {
    position: relative;
    font-size: 16px;
    display: flex;
    flex: 10000 1 0%;
    align-items: flex-start;
    padding-right: 16px;
    width: auto;
    min-width: 0;
    max-width: 100%;
    @media screen and (min-width: 768px) {
      opacity: .5;
      transition: all .2s ease-in-out;
    }
  }
  &__count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    position: absolute;
    right: 0;
    padding: 4px 6px;
    border-radius: 4px;
    background: #13abb2;
    color: #fff;
    transition: all .2s ease-in-out;
  }
}
.no-access {
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.loading {
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.router-link {
  color: #000;
  text-decoration: none;
}
.auth {
  display: flex;
  justify-content: center;

  &__input {
    margin-bottom: 24px;
  }
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
