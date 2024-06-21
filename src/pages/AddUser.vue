<template>
    <div class="q-pa-md">
        <q-toolbar class="bg-white shadow-2 rounded-borders">
            <h1 class="text-h3">Добавление нового садовода</h1>
            <q-space />
            <router-link to="/users">
                <q-btn color="primary" icon="back" label="Назад" />
            </router-link>
        </q-toolbar>
        <div>
            <div class="q-gutter-md" style="max-width: 800px">
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
                <q-btn
                    color="secondary"
                    label="Зарегистрировать пользователя"
                    @click="sendUser()"/>
            </div>
        </div>
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
            $role: String!,
        ){
            createUser(createUserInput: { 
                name: $name,
                surname: $surname,
                patronymic: $patronymic,
                isAdmin: $isAdmin,
                area: $area,
                phone: $phone,
                password: $password,
                role: $role,
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
                    role: userData.role,
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
