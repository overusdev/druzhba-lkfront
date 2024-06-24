<template>
    <div class="q-pa-md">
        <q-table
            title="Садоводы"
            :rows="users"
            :columns="columns"
            row-key="name"
            selection="single"
            v-model:selected="usersGroup"
            :separator="separator"
            :loading="loading"
            no-data-label="Садоводов не найдено"
            hide-pagination
            hide-selected-banner
        >
            <template v-slot:top>
                <div>
                    <h4 class="q-ma-none q-mb-md text-h4">Список садоводов</h4>
                    <div class="row q-mb-sm">
                        <router-link to="/add-user">
                            <q-btn color="primary" icon="add" label="Добавить нового" />
                        </router-link>
                        <q-btn
                            class="q-ml-sm"
                            color="red"
                            icon="delete"
                            label="Удалить выбранных"
                            :disable="disableRemoveButton"
                            @click="removeUsers"/>
                    </div>
                </div>
            </template>
            <template v-if="usersGroup.length" v-slot:bottom>
                Выбран садовод участка {{ usersGroup[0].area }}
            </template>
        </q-table>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";

export default {
  setup () {
    const disableRemoveButton = ref(true);
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
        take: 4,
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

    onDoneremoveUsers(() => {
        userData.value.name = "";
        userData.value.surname = "";
        usersGroup.value = [];
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
            } else {
                disableRemoveButton.value = true;
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
        }
    },
}
</script>
