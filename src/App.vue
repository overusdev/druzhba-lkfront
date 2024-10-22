<template>
  <tempalte v-if="authStore.isNotAdmin">
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
        :width="drawerHeight"
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
            <div v-if="authStore.adminName" class="text-weight-bold">{{ authStore.adminName.username }}</div>
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
const drawerHeight = computed(() => store.isMobile ? 200 : 300);

function logOut() {
  loading.value = true;
  authStore.deleteCookie('dr_access_token');
  setTimeout(() => {
    window.location.replace('http://localhost:8004/');
  }, 1000);
}

onMounted(async () => {
  authStore.adminName = authStore.parseJwt(authStore.getCookie('dr_access_token'));

  const tokenExpires = 1729621801;

  async function checkTokenExpires(tokenExpires) {
    let date = new Date(Date.now());
    let dateNow = date.getTime() / 1000;

    console.log(tokenExpires);
    console.log(date.getTime() / 1000);

    if(dateNow > tokenExpires) {
      window.location.replace('http://localhost:8004');
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
