<template>
    <div class="user q-pa-md">
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
                    <q-btn
                        class="q-ml-sm"
                        color="red"
                        icon="delete"
                        @click="upplyRemoveUser"/>
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
                            v-model="userData.bcryptpassword"
                            label="bcrypt-пароль участка"
                            readonly
                            class="user__input user__input--readonly"
                        />
                        <q-input
                            class="q-mt-xl"
                            label="Комментарии"
                            v-model="userData.note"
                            autogrow
                        />
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
        <q-dialog v-model="showRemovePopup">
            <q-card class="user__dialog">
                <q-card-section class="q-pt-xl">
                    <p class="text text-red">Действительно удалить все данные по участку?</p>
                    <q-btn flat no-caps icon="close" class="user__close-icon" v-close-popup />
                    <q-btn
                        color="red"
                        icon="delete"
                        label="Да, удалить"
                        @click="removeUser"/>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

export default {
  setup () {
    const disableEditButton = ref(true);
    const showRemovePopup = ref(false);
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
        bcryptpassword: '',
        role: '',
        note: ''
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
                bcryptpassword
                role
                note
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
            $note: String!,
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
                note: $note,
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
                    note: userData.note,
                },
            })
    );

    const { mutate: removeUser, onDone: onDoneremoveUser } = useMutation(gql`
        mutation removeAll($ids: [Int!]!){
            removeUsers(ids: $ids) {
                id
            }
        }
        `, () => ({
                variables: {
                    ids: [Number(route.params.id)]
                },
            })
    );

    onDone(() => {
        router.push({
            name: "users",
        });
    })

    onDoneremoveUser(() => {
        router.push({
            name: "users",
        });
    })

    function upplyRemoveUser() {
        showRemovePopup.value = true;
    }

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
            userData.bcryptpassword = refetchQuery.data.user.bcryptpassword;
            userData.role = refetchQuery.data.user.role;
            userData.note = refetchQuery.data.user.note;
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
            disableEditButton,
            showRemovePopup,
            onDoneremoveUser,
            removeUser,
            upplyRemoveUser
        }
    },
}
</script>

<style scoped lang="scss">
.user {
    &__dialog {
        position: relative;
    }
    &__close-icon {
        position: absolute;
        top: 10px;
        right: 6px;
    }
    &__input {
        &--readonly {
            opacity: .5;
        }
    }
}
</style>
