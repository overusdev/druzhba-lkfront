<template>
  <tempalte v-if="!authStore.adminData.isAdmin">
    <div class="no-access text-weight-bold">Отказано в доступе. Вы не являетесь администратором</div>
  </tempalte>
  <tempalte v-else>
    <div v-if="loading" class="loading">
    <q-spinner-puff class="teal" size="5.5em" />
    </div>
    <q-layout v-else view="lHh Lpr lff" container style="height: 100vh" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-cyan-8">
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
      >
        <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
          <q-list padding>
            <router-link to="/users" class="router-link">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="people" color="blue" />
                </q-item-section>

                <q-item-section>
                  Участки
                </q-item-section>
              </q-item>
            </router-link>

            <router-link to="/news" class="router-link">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="newspaper" color="orange" />
                </q-item-section>

                <q-item-section>
                  Новости
                </q-item-section>
              </q-item>
            </router-link>

            <router-link to="/ads" class="router-link">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="description" color="green"/>
                </q-item-section>

                <q-item-section>
                  Объявления
                </q-item-section>
              </q-item>
            </router-link>

            <router-link to="/contacts-create" class="router-link disabled">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="location_on" color="black"/>
                </q-item-section>

                <q-item-section>
                  Контакты
                </q-item-section>
              </q-item>
            </router-link>

            <router-link to="/contacts-update" class="router-link">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="location_on" color="black"/>
                </q-item-section>

                <q-item-section>
                  Контакты редактировать
                </q-item-section>
              </q-item>
            </router-link>

            <router-link to="/docs" class="router-link">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="file_open" color="blue"/>
                </q-item-section>

                <q-item-section>
                  Документы
                </q-item-section>
              </q-item>
            </router-link>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="logout" color="red"/>
              </q-item-section>

              <q-item-section @click="logOut">
                Выйти
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
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
import { ref, computed, reactive, onMounted } from 'vue';
import { useGeometryStore } from './stores/geometry';
import { useAuthStore } from './stores/auth';

const drawer = ref(false);
const loading = ref(false);
const store = useGeometryStore();
const authStore = useAuthStore();
const drawerWidth = computed(() => store.isMobile ? 300 : 400);
const domainAuth = import.meta.env.MODE === 'production'
  ? 'https://auth.druzba-nn.ru'
  : 'http://localhost:8004/';

function logOut() {
  loading.value = true;
  authStore.deleteCookie('dr_access_token');
  setTimeout(() => {
    window.location.replace(domainAuth);
  }, 1000);
}

onMounted(async () => {
  if(authStore.getCookie('dr_access_token')) {
    authStore.adminData.name = authStore.parseJwt(authStore.getCookie('dr_access_token')).username;
    authStore.adminData.isAdmin = authStore.parseJwt(authStore.getCookie('dr_access_token')).isAdmin;
  }

  console.log('authStore.getCookie("dr_access_token")', authStore.getCookie('dr_access_token'));
  console.log(authStore.parseJwt(authStore.getCookie('dr_access_token')));
  console.log('getCookie1', authStore.parseJwt(authStore.getCookie1('dr_access_token')));

  if(!authStore.adminData.isAdmin) {
    authStore.deleteCookie('dr_access_token');
    setTimeout(() => {
      window.location.replace(domainAuth);
    }, 1000);
  }

  async function checkTokenExpires(tokenExpires) {
    let date = new Date(Date.now());
    let dateNow = date.getTime() / 1000;

    console.log(tokenExpires);
    console.log(date.getTime() / 1000);

    if(dateNow > tokenExpires) {
      window.location.replace(domainAuth);
      return console.log('Oh, I accidentally fell...(((');
    }
  }
  setInterval(async() => {
    await checkTokenExpires(authStore.parseJwt(authStore.getCookie('dr_access_token')).exp);
  }, 2000);
});

</script>
<style scoped lang="scss">
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
