<template>
    <div class="users q-pa-md">
        <q-layout 
            view="lHh lpr lFf"
            container
            style="min-height: 800px"
            class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <q-toolbar-title>Список участков <span class="text-weight-bold">всего: {{ users.length }}</span></q-toolbar-title>
                    <router-link to="/add-user">
                        <q-btn color="white" text-color="black" icon="add" label="Добавить нового" />
                    </router-link>
                    <router-link :to="`/edit-user/${ usersGroup.length ? usersGroup[0].id : null}`">
                        <q-btn
                            class="q-ml-sm"
                            color="white"
                            icon="edit"
                            text-color="black"
                            label="Редактировать"
                            :disable="disableEditButton"/>
                    </router-link>
                    <q-btn
                        class="q-ml-sm"
                        color="red"
                        icon="delete"
                        label="Удалить выбранного"
                        :disable="disableRemoveButton"
                        @click="upplyRemoveUsers"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <q-table
                        :rows="users"
                        :columns="columns"
                        row-key="name"
                        selection="single"
                        v-model:selected="usersGroup"
                        :separator="separator"
                        :loading="loading"
                        no-data-label="Участков не найдено"
                        hide-pagination
                        hide-selected-banner
                    >
                        <template v-if="usersGroup.length" v-slot:bottom>
                            Выбран участок {{ usersGroup[0].area }}
                        </template>
                    </q-table>
                </q-page>
            </q-page-container>
        </q-layout>
        <q-dialog v-model="showRemovePopup">
            <q-card class="users__dialog">
                <q-card-section class="q-pt-xl">
                    <p class="text text-red">Действительно удалить все данные по участку?</p>
                    <q-btn flat no-caps icon="close" class="users__close-icon" v-close-popup />
                    <q-btn
                        color="red"
                        icon="delete"
                        label="Да, удалить"
                        @click="removeUsers"/>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";

export default {
  setup () {
    const disableRemoveButton = ref(true);
    const disableEditButton = ref(true);
    const showRemovePopup = ref(false);
    const columns = [
        {
            name: 'name',
            required: true,
            label: 'Имя',
            align: 'left',
            field: row => row.name,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'surname',
            required: true,
            label: 'Фамилия',
            align: 'left',
            field: row => row.surname,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'patronymic',
            required: true,
            label: 'Отчество',
            align: 'left',
            field: row => row.patronymic || '-',
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'area',
            required: true,
            label: 'Участок',
            align: 'left',
            field: row => row.area,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'phone',
            required: true,
            label: 'Номер телефона',
            align: 'left',
            field: row => row.phone,
            format: val => `${val}`,
            sortable: true
        },
    ];
    const userData = ref({
        name: '',
        surname: '',
        patronymic: '',
        isAdmin: false,
        area: '',
        phone: '',
        password: '',
        role: '',
    });
    const usersGroup = ref([]);
    const usersIds = ref([]);
    const USERS = gql`
        query findAll($take: Int!) {
            users(take: $take) {
                id
                name
                surname
                patronymic
                area
                phone
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(USERS, () => ({
        take: 500,
        name: userData.value.name,
        surname: userData.value.surname,
    }));
    const users = computed(() => result.value?.users ?? []);
    const options = computed(() => users.value);
    const { mutate: removeUsers, onDone: onDoneremoveUsers } = useMutation(gql`
        mutation removeAll($ids: [Int!]!){
            removeUsers(ids: $ids) {
                id
            }
        }
        `, () => ({
                variables: {
                    ids: usersGroup.value.map(i => i.id)
                },
            })
    );

    function upplyRemoveUsers() {
        showRemovePopup.value = true;
    }

    onDoneremoveUsers(() => {
        userData.value.name = "";
        userData.value.surname = "";
        usersGroup.value = [];
        showRemovePopup.value = false;
        refetch();
    })

    onMounted(async () => {
        await refetch();
    });

    watch(
        () => usersGroup.value,
        (v) => {
            if(v.length) {
                disableRemoveButton.value = false;
                disableEditButton.value = false;
            } else {
                disableRemoveButton.value = true;
                disableEditButton.value = true;
            }
        }
    );

        return {
            result,
            loading,
            userData,
            error,
            refetch,
            users,
            usersGroup,
            usersIds,
            options,
            removeUsers,
            onDoneremoveUsers,
            columns,
            separator: ref('vertical'),
            disableRemoveButton,
            disableEditButton,
            showRemovePopup,
            upplyRemoveUsers,
        }
    },
}
</script>

<style scoped lang="scss">
.users {
    &__dialog {
        position: relative;
    }
    &__close-icon {
        position: absolute;
        top: 10px;
        right: 6px;
    }
}
</style>
