<template>
    <div class="q-pa-md">
        <q-toolbar class="bg-white shadow-2 rounded-borders">
            <h1 class="text-h3">Список садоводов</h1>
            <q-space />
            <router-link to="/add-user">
                <q-btn color="primary" icon="add" label="Добавить нового" />
            </router-link>
            <q-btn
                color="secondary"
                label="Удалить пользователя"
                @click="removeUsers()"/>

        </q-toolbar>
        <div v-if="loading">Loading...</div>
        <ul v-else-if="users && users.length">
            <q-option-group
                :options="options"
                type="checkbox"
                v-model="usersGroup"
            >
            <template v-slot:label="opt">
                <div class="row">
                    <div>
                        <span class="text">{{ opt.label }} </span> 
                        <span class="text">{{ opt.type }}</span>
                    </div>
                </div>
            </template>
            </q-option-group>
        </ul>
        <div v-else>No users in DB</div>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useCounterStore } from '../stores/counter';
import { storeToRefs } from 'pinia';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";

export default {
  setup () {
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
    const usersGroup = ref([]);
    const USERS = gql`
        query findAll($take: Int!) {
            users(take: $take) {
                id
                name
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(USERS, () => ({
        take: 4,
        name: userData.name,
        surname: userData.surname,
    }));
    const users = computed(() => result.value?.users ?? []);
    const options = computed(() => { 
        return users.value.map(function(obj) {
            return {'label': obj.name, 'type': obj.surname, 'value': obj.id};
        });
    });
    const { mutate: removeUsers, onDone: onDoneremoveUsers } = useMutation(gql`
        mutation removeAll($ids: [Int!]!){
            removeUsers(ids: $ids) {
                id
            }
        }
        `, () => ({
                variables: {
                    ids: usersGroup.value
                },
            })
    );

    onDoneremoveUsers(() => {
        userData.name = "";
        userData.surname = "";
        usersGroup.value = [];
        refetch();
    })

    onMounted(async () => {
        await refetch();
    });

        return {
            result,
            loading,
            userData,
            error,
            refetch,
            users,
            usersGroup,
            options,
            removeUsers,
            onDoneremoveUsers
        }
    },
}
</script>
