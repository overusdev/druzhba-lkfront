<template>
    <div class="q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/users">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <q-toolbar-title>Редактироване данных участка {{ userData.area }}</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="editUser"/>
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
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { computed, reactive, onMounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

export default {
  setup () {
    const router = useRouter();
    const route = useRoute();
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
    const USERS = gql`
        query findOne($id: Int!) {
            user(id: $id) {
                id
                name
                surname
                patronymic
                area
                phone
                isAdmin
                password
                role
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(USERS, () => ({
        id: Number(route.params.id),
    }));
    const user = computed(() => result ?? []);
    const { mutate: editUser, onDone } = useMutation(gql`
        mutation updateUser(
            $id: Int!,
            $name: String!,
            $surname: String!,
            $patronymic: String!,
            $isAdmin: Boolean!,
            $area: String!,
            $phone: String!,
            $password: String!,
            $role: String!,
        ){
            updateUser(updateUserInput: {
                id: $id,
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
                    id: Number(route.params.id),
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

    onMounted(async () => {
        const refetchQuery = await refetch();
        if(refetchQuery.data.user) {
            userData.id = refetchQuery.data.user.id;
            userData.name = refetchQuery.data.user.name;
            userData.surname = refetchQuery.data.user.surname;
            userData.patronymic = refetchQuery.data.user.patronymic;
            userData.area = refetchQuery.data.user.area;
            userData.phone = refetchQuery.data.user.phone;
            userData.isAdmin = refetchQuery.data.user.isAdmin;
            userData.password = refetchQuery.data.user.password;
            userData.role = refetchQuery.data.user.role;
        }
    });

        return {
            editUser,
            userData,
            onDone,
            result,
            loading,
            refetch,
            router,
            route,
            user,
        }
    },
}
</script>
