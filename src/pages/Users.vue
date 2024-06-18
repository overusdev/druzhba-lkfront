<template>
    <div class="q-pa-md">
        <h1 class="text-h3">Список садоводов</h1>
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
                <q-btn
                    color="secondary"
                    label="Удалить пользователя"
                    @click="removeUsers()"/>
            </div>
            <pre>{{ usersGroup }}</pre>
        </div>
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
                        <span class="text-lime">{{ opt.label }} </span> 
                        <span class="text-teal">{{ opt.type }}</span>
                    </div>
                </div>
            </template>
            </q-option-group>
        </ul>
        <div v-else>No users in DB</div>
    </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useCounterStore } from '../stores/counter';
import { storeToRefs } from 'pinia';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";

export default {
  setup () {
    const store = useCounterStore();
    const count = computed(() => store.counter);
    const doubleCountValue = computed(() => store.doubleCount);
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
    const incrementCount = () => store.increment();
    const decrementCount = () => store.counter--;
    const { counter, doubleCount } = storeToRefs(store);
    const { increment } = store;
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
                // update: (cache, { data: { sendUser } }) => {
                //     let data = cache.readQuery({ query: PETS })
                //         data = {
                //             ...data,
                //                 pets: [
                //                 ...data.pets,
                //                 sendUser,
                //             ],
                //         }
                //     cache.writeQuery({ query: PETS, data })
                // },
            })
    );
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

    onDone(() => {
        userData.name = "";
        userData.surname = "";
        usersGroup.value = [];
        refetch();
    })

    onDoneremoveUsers(() => {
        userData.name = "";
        userData.surname = "";
        usersGroup.value = [];
        refetch();
    })

        return {
            count,
            doubleCount,
            incrementCount,
            decrementCount,
            doubleCountValue,
            counter,
            increment,
            result,
            loading,
            sendUser,
            userData,
            error,
            refetch,
            users,
            onDone,
            usersGroup,
            options,
            removeUsers,
            onDoneremoveUsers
        }
    },
}
</script>
