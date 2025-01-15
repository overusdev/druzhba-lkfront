<template>
    <div class="user q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/users">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <div class="user__toolbar-title">
                        Редактирование данных участка {{ userData.area }}
                    </div>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-lg">
                    <div class="user__action-panel">
                        <div
                            class="user__save-button"
                            :class="{'user__save-button--disabled': !disableSaveBtn }"
                            @click="editUser"
                        >
                            Сохранить данные
                        </div>
                        <div
                            class="user__remove-button"
                            @click="upplyRemoveUser"
                        >
                            Удалить
                        </div>
                    </div>

                    <div class="q-pt-lg" style="max-width: 800px">
                        <q-input class="user__input" v-model="userData.name" label="Имя" />
                        <q-input class="user__input" v-model="userData.surname" label="Фамилия" />
                        <q-input class="user__input" v-model="userData.patronymic" label="Отчество" />
                        <q-checkbox class="user__input" v-model="userData.isAdmin" label="Является администратором" />
                        <q-input class="user__input" type="number" v-model="userData.area" label="Участок" />
                        <q-input class="user__input" v-model="userData.phone" label="Номер телефона" mask="##########" />
                        <q-input class="user__input" v-model="userData.password" label="Пароль участка" />
                        <q-input v-model="userData.bcryptpassword" label="bcrypt-пароль участка" readonly
                            class="user__input user__input--readonly" />
                        <q-input class="q-mt-xl" label="Комментарии" v-model="userData.note" autogrow />
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
        <ConfirmDialog
            v-model="showRemovePopup"
            text="После подтверждения действия, данные будут безвозвратно удалены.
                    Действительно удалить все данные по участку?"
            @update:modelValue="removeUser"
            @close="showRemovePopup = false"
        />
    </div>
</template>

<script>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import ConfirmDialog from '../components/ConfirmDialog.vue';

export default {
    components: {
        ConfirmDialog
    },
    setup() {
        const disableEditButton = ref(true);
        const showRemovePopup = ref(false);
        const router = useRouter();
        const route = useRoute();
        let now = DateTime.now().toString();
        let updatedDate = DateTime.fromISO(now, { locale: "ru" });
        const disableSaveBtn = ref(false);
        const userData = ref({
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
        const userDataLock = ref({
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
            $bcryptpassword: String!,
            $role: String!,
            $note: String!,
            $updated: String!,
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
                bcryptpassword: $bcryptpassword,
                role: $role,
                note: $note,
                updated: $updated,
            }) {
                    id
                    name
                    surname
                }
            }
        `, () => ({
            variables: {
                id: Number(route.params.id),
                name: userData.value.name,
                surname: userData.value.surname,
                patronymic: userData.value.patronymic,
                isAdmin: userData.value.isAdmin,
                area: userData.value.area,
                phone: userData.value.phone,
                password: userData.value.password,
                bcryptpassword: userData.value.password,
                role: userData.value.role,
                note: userData.value.note,
                updated: updatedDate.toFormat("dd MMMM yyyy hh:mm"),
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
            if (refetchQuery.data.user) {
                userData.value.id = refetchQuery.data.user.id;
                userData.value.name = refetchQuery.data.user.name;
                userData.value.surname = refetchQuery.data.user.surname;
                userData.value.patronymic = refetchQuery.data.user.patronymic;
                userData.value.area = refetchQuery.data.user.area;
                userData.value.phone = refetchQuery.data.user.phone;
                userData.value.isAdmin = refetchQuery.data.user.isAdmin;
                userData.value.password = refetchQuery.data.user.password;
                userData.value.bcryptpassword = refetchQuery.data.user.bcryptpassword;
                userData.value.role = refetchQuery.data.user.role;
                userData.value.note = refetchQuery.data.user.note;

                userDataLock.value.id = refetchQuery.data.user.id;
                userDataLock.value.name = refetchQuery.data.user.name;
                userDataLock.value.surname = refetchQuery.data.user.surname;
                userDataLock.value.patronymic = refetchQuery.data.user.patronymic;
                userDataLock.value.area = refetchQuery.data.user.area;
                userDataLock.value.phone = refetchQuery.data.user.phone;
                userDataLock.value.isAdmin = refetchQuery.data.user.isAdmin;
                userDataLock.value.password = refetchQuery.data.user.password;
                userDataLock.value.bcryptpassword = refetchQuery.data.user.bcryptpassword;
                userDataLock.value.role = refetchQuery.data.user.role;
                userDataLock.value.note = refetchQuery.data.user.note;
            }
        });

        watch(
            () => userData.value,
            (v) => {
                if(JSON.stringify(v) !== JSON.stringify(userDataLock.value)) {
                    disableSaveBtn.value = true;
                } else {
                    disableSaveBtn.value = false;
                }
            },
            {
                deep: true,
            }
        );

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
            upplyRemoveUser,
            disableSaveBtn,
            userDataLock,
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
        margin-bottom: 12px;
        &--readonly {
            opacity: .5;
        }
    }

    &__action-panel {
        @media screen and (min-width: 768px) {
            display: flex;
            align-items: center;
        }
    }

    &__save-button {
        display: inline-block;
        padding: 12px;
        border: 3px solid #3794ae;
        background: #f0f9ff;
        border-radius: 8px;
        margin-bottom: 16px;
        margin-right: 12px;

        &--disabled {
            opacity: .5;
            cursor: pointer;
        }

        @media screen and (min-width: 768px) {
            cursor: pointer;
        }
    }

    &__remove-button {
        display: inline-block;
        padding: 12px;
        border: 3px solid #b71c1c;
        background: #fff6fb;
        border-radius: 8px;
        margin-bottom: 16px;
        margin-right: 12px;

        @media screen and (min-width: 768px) {
            cursor: pointer;
        }
    }

    &__toolbar-title {
        font-size: 18px;
    }

    &__toolbar-link {
        color: #006689;
        text-decoration: none;

        @media screen and (min-width: 768px) {
            cursor: pointer;
        }

        &:visited {
            color: #006689;
        }
    }

    :deep(.q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input) {
        font-size: 16px !important;
    }

    :deep(.q-field__label) {
        top: 15px !important;
    }
}
</style>
