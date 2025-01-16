<template>
    <div class="users q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <q-toolbar-title>Список участков <span class="text-weight-bold">всего: {{ users.length
                            }}</span></q-toolbar-title>
                    <router-link to="/add-user">
                        <q-btn color="white" text-color="black" icon="add" label="Добавить нового" />
                    </router-link>
                    <router-link :to="`/edit-user/${usersGroup.length ? usersGroup[0].id : null}`">
                        <q-btn class="q-ml-sm" color="white" icon="edit" text-color="black" label="Редактировать"
                            :disable="disableEditButton" />
                    </router-link>
                    <q-btn class="q-ml-sm" color="red-10" icon="delete" label="Удалить выбранного"
                        :disable="disableRemoveButton" @click="upplyRemoveUsers">
                        <q-tooltip v-if="disableRemoveButton" v-model="showingRemoveTooltip" anchor="bottom left"
                            self="top middle" class="bg-grey-1 text-subtitle1 text-black shadow-4"
                            :offset="[10, 10]">Удалять можно только выбранный элемент
                        </q-tooltip>
                    </q-btn>
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
                        hide-pagination hide-selected-banner
                    >
                        <template v-if="usersGroup.length" v-slot:bottom>
                            Выбран участок {{ usersGroup[0].area }}
                        </template>
                        <template v-slot:body="props">
                            <q-tr :props="props" @click="props.selected = true">
                                <q-td>
                                    <q-checkbox v-model="props.selected" color="primary" />
                                </q-td>
                                <q-td
                                    v-for="col in props.cols"
                                    :key="col.name"
                                    :props="props"
                                >
                                    <template v-if="col.name === 'isAdmin'">
                                        <span v-if="col.value === 'Админ'" class="userd__isadmin-marked">{{ col.value }}</span>
                                        <span v-else>-</span>
                                    </template>

                                    <span v-else>{{ col.value }}</span>
                                </q-td>
                            </q-tr>
                        </template>
                    </q-table>
                </q-page>
            </q-page-container>
        </q-layout>
        <ConfirmDialog
            v-model="showRemovePopup"
            text="После подтверждения действия, данные будут безвозвратно удалены.
                    Действительно удалить все данные по участку?"
            @update:modelValue="removeUsers"
            @close="showRemovePopup = false"
        />
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import ConfirmDialog from '../components/ConfirmDialog.vue';

export default {
    components: {
        ConfirmDialog
    },
    setup() {
        const disableRemoveButton = ref(true);
        const disableEditButton = ref(true);
        const showRemovePopup = ref(false);
        const showingRemoveTooltip = ref(false);
        const columns = [
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
                name: 'isAdmin',
                required: true,
                label: 'Статус',
                align: 'left',
                field: row => row.isAdmin,
                format: val => val ? `Админ` : '-',
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
                name: 'name',
                required: true,
                label: 'Имя',
                align: 'left',
                field: row => row.name,
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
                name: 'phone',
                required: true,
                label: 'Номер телефона',
                align: 'left',
                field: row => row.phone,
                format: val => `${val}`,
                sortable: true
            },
            {
                name: 'date',
                required: true,
                label: 'Дата создания',
                align: 'left',
                field: row => row.date || '-',
                format: val => `${val}`,
                sortable: true
            },
            {
                name: 'date',
                required: true,
                label: 'Дата обновления',
                align: 'left',
                field: row => row.updated || '-',
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
                date
                updated
                isAdmin
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
                if (v.length) {
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
            showingRemoveTooltip,
        }
    },
}
</script>

<style scoped lang="scss">
.users {
    &__dialog {
        position: relative;
        border-radius: 8px;
    }

    &__dialog-text {
        font-size: 16px;
    }

    &__dialog-remove-btn {
        text-align: center;
        padding: 12px;
        border: 3px solid #b71c1c;
        font-size: 16px;
        color: #b71c1c;
        border-radius: 8px;

        @media screen and (min-width: 768px) {
            cursor: pointer;
        }
    }

    &__close-icon {
        position: absolute;
        top: 10px;
        right: 6px;
    }

    :deep(.q-table tbody td) {
        font-size: 16px;
    }

    :deep(.q-table th.sortable) {
        font-size: 16px;
    }
    :deep(.q-table .userd__isadmin-marked) {
        font-size: 14px;
        padding: 1px 12px;
        color: #bf4646;
        border: 1px solid;
        border-radius: 4px;
    }
}
</style>
