<template>
    <div class="new-user q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/users">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <div class="new-user__toolbar-title">
                        Добавление нового участка
                    </div>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-lg">
                    <div class="new-user__action-panel">
                        <div
                            class="new-user__save-button"
                            :class="{'new-user__save-button--disabled': !disableSaveBtn }"
                            @click="sendUser"
                        >
                            Сохранить данные
                        </div>
                    </div>
                    <div class="q-pt-lg" style="max-width: 800px">
                        <q-input class="new-user__input" v-model="userData.name" label="Имя" />
                        <q-input class="new-user__input" v-model="userData.surname" label="Фамилия" />
                        <q-input class="new-user__input" v-model="userData.patronymic" label="Отчество" />
                        <q-checkbox
                            class="new-user__input"
                            v-model="userData.isAdmin"
                            label="Является администратором"
                            :disable="disableIsAdminBtn"
                        />
                        <q-input class="new-user__input" type="number" v-model="userData.area" label="Участок" />
                        <q-input
                            v-model="userData.phone"
                            label="Номер телефона"
                            mask="##########"
                            class="new-user__input" 
                        />
                        <q-input class="new-user__input" v-model="userData.password" label="Пароль участка" />
                        <q-input
                            label="Комментарии"
                            v-model="userData.note"
                            autogrow
                            class="new-user__input"
                        />
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import gql from 'graphql-tag';
import { DateTime } from "luxon";
import { useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";

export default {
  setup () {
    const router = useRouter();
    let now = DateTime.now().toString();
    let createDate = DateTime.fromISO(now, { locale: "ru" });
    const disableSaveBtn = ref(false);
    const disableIsAdminBtn = ref(true);
    const userData = ref({
        name: '',
        surname: '',
        patronymic: '',
        isAdmin: false,
        area: '',
        phone: '',
        password: '',
        role: '',
        note: '',
        date: ''
    });
    const userDataLock = ref({
        name: '',
        surname: '',
        patronymic: '',
        isAdmin: false,
        area: '',
        phone: '',
        password: '',
        role: '',
        note: '',
        date: ''
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
            $date: String!,
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
                date: $date,
            }) {
                    id
                    name
                    surname
                }
            }
        `, () => ({
                variables: {
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
                    date: createDate.toFormat("dd MMMM yyyy hh:mm"),
                },
            })
    );

        onDone(() => {
            router.push({
                name: "users",
            });
        })

        watch(
            () => userData.value,
            (v) => {

                if(JSON.stringify(v) !== JSON.stringify(userDataLock.value)) {
                    disableSaveBtn.value = true;
                    disableIsAdminBtn.value = false;
                } else {
                    disableSaveBtn.value = false;
                    disableIsAdminBtn.value = true;
                }
            },
            {
                deep: true,
            }
        );

        return {
            sendUser,
            userData,
            onDone,
            router,
            disableSaveBtn,
            userDataLock,
            disableIsAdminBtn,
        }
    },
}
</script>

<style scoped lang="scss">
.new-user {
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
