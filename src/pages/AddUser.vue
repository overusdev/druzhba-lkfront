<template>
    <div class="q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/users">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <q-toolbar-title>Добавление нового участка</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="sendUser"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <div class="q-pa-md q-pt-lg" style="max-width: 800px">
                        <q-input v-model="userData.name" label="Имя" />
                        <q-input v-model="userData.surname" label="Фамилия" />
                        <q-input v-model="userData.patronymic" label="Отчество" />
                        <q-checkbox v-model="userData.isAdmin" label="Является администратором" />
                        <q-input v-model="userData.area" label="Участок" />
                        <q-input
                            v-model="userData.phone"
                            label="Номер телефона"
                            mask="##########"
                        />
                        <q-input v-model="userData.password" label="Пароль участка" />
                        <q-input
                            label="Комментарии"
                            v-model="userData.note"
                            autogrow
                        />
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { reactive } from 'vue';
import gql from 'graphql-tag';
import { useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";

export default {
  setup () {
    const router = useRouter();
    const userData = reactive({
        name: '',
        surname: '',
        patronymic: '',
        isAdmin: false,
        area: '',
        phone: '',
        password: '',
        role: '',
        note: '',
    });
    const { mutate: sendUser, onDone } = useMutation(gql`
        mutation createUser(
            $name: String!,
            $surname: String!,
            $patronymic: String!,
            $isAdmin: Boolean!,
            $area: String!,
            $phone: String!,
            $password: String!,
            $bcryptpassword: String!,
            $role: String!,
            $note: String!,
        ){
            createUser(createUserInput: { 
                name: $name,
                surname: $surname,
                patronymic: $patronymic,
                isAdmin: $isAdmin,
                area: $area,
                phone: $phone,
                password: $password,
                bcryptpassword: $bcryptpassword,
                role: $role,
                note: $note,
            }) {
                    id
                    name
                    surname
                }
            }
        `, () => ({
                variables: {
                    name: userData.name,
                    surname: userData.surname,
                    patronymic: userData.patronymic,
                    isAdmin: userData.isAdmin,
                    area: userData.area,
                    phone: userData.phone,
                    password: userData.password,
                    bcryptpassword: userData.password,
                    role: userData.role,
                    note: userData.note,
                },
            })
    );

    onDone(() => {
        router.push({
            name: "users",
        });
    })

        return {
            sendUser,
            userData,
            onDone,
            router,
        }
    },
}
</script>
