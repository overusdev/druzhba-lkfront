<template>
  {{ isAuthorized }}
  <div v-if="isAuthorized">
    <q-layout view="lHh Lpr lff" container style="height: 100vh" class="shadow-2 rounded-borders">
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
            <router-link to="/">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="inbox" />
                </q-item-section>

                <q-item-section>
                  Страница редактора
                </q-item-section>
              </q-item>
            </router-link>

            <router-link to="/test">
              <q-item active clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="star" />
                </q-item-section>

                <q-item-section>
                  Страница тестовая
                </q-item-section>
              </q-item>
            </router-link>

            <router-link to="/users">
              <q-item active clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="people" />
                </q-item-section>

                <q-item-section>
                  Участки
                </q-item-section>
              </q-item>
            </router-link>

            <router-link to="/news">
              <q-item active clickable v-ripple>
                <q-item-section avatar>
                <q-icon name="newspaper" />
                </q-item-section>

                <q-item-section>
                  Новости
                </q-item-section>
              </q-item>
            </router-link>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="send" />
              </q-item-section>

              <q-item-section>
                Send
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="drafts" />
              </q-item-section>

              <q-item-section>
                Drafts
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="logout" />
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
            <div class="text-weight-bold">Сергей Администратор</div>
            <div>@overus</div>
          </div>
        </q-img>
      </q-drawer>

      <q-page-container>
          <router-view/>
      </q-page-container>
    </q-layout>
  </div>
  <div v-else>
    <div class="auth">
      <div class="auth__wrapper">
        <h3>Отказано в доступе, авторизуйтесь</h3>
        <div class="auth__form-wrapper">
          <q-input
            v-model="authPhone"
            label="Номер телефона администратора без префикса"
            mask="##########"
            :dense="dense"
            class="auth__input"
            />
            <q-btn
              color="secondary"
              label="Войти"
              :disable="!canAuth"
              @click="setAuth"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGeometryStore } from './stores/geometry';
import { useAuthStore } from './stores/auth';
import { useRouter } from "vue-router";
// import router from "@/router";

const drawer = ref(false);
const store = useGeometryStore();
const authStore = useAuthStore();
const drawerHeight = computed(() => store.isMobile ? 200 : 300);
const authPhone = ref('');
const mockAuthPhone = ref('9535512834');
const dense = ref(false);
const canAuth = computed(() => authPhone.value === mockAuthPhone.value );
const isAuthorized = computed(() => authStore.getCookie('name') === 'Sergey' );
const router = useRouter();

function setAuth() {
  authStore.signIn();
  router.push({
    name: "test",
  });
}
function logOut() {
  authPhone.value = '';
  authStore.signOut();
  router.push({
    name: "main",
  });
}


</script>
<style scoped lang="scss">
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
