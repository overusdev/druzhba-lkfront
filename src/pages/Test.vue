<template>
    <div class="q-pa-md">
        <h1 class="text-h3">This is a test route-page</h1>
        <div>
            <div>Indirect store</div>
            <div>{{ count }}</div>
            <div>{{ doubleCountValue }}</div>
            <q-btn @click="decrementCount()">-</q-btn>
            <q-btn @click="incrementCount()">+</q-btn>
        </div>
        <div>
            <div class="q-gutter-md" style="max-width: 300px">
                <q-input v-model="petData.name" label="Name" />
                <q-input v-model="petData.type" label="Type" />
            </div>
            <button @click="sendPet()">
                Send pet
            </button>
        </div>
        <div v-if="loading">Loading...</div>
        <ul v-else-if="pets && pets.length">
            <li v-for="user of pets" :key="user.id">
                {{ user.id }}
                {{ user.name || "not set" }}
            </li>
        </ul>
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
    const petData = reactive({
        name: '',
        type: ''
    });
    const incrementCount = () => store.increment();
    const decrementCount = () => store.counter--;
    const { counter, doubleCount } = storeToRefs(store);
    const { increment } = store;
    const PETS = gql`
        query findAll {
            pets {
                id
                name
                type
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(PETS);
    const pets = computed(() => result.value?.pets ?? [])
    const { mutate: sendPet, onDone } = useMutation(gql`
        mutation createPet($name: String!, $type: String!){
            createPet(createPetInput: { name: $name, type: $type }) {
                    id
                    name
                    type
                }
            }
        `, () => ({
                variables: {
                    name: petData.name,
                    type: petData.type,
                },
                // update: (cache, { data: { sendPet } }) => {
                //     let data = cache.readQuery({ query: PETS })
                //         data = {
                //             ...data,
                //                 pets: [
                //                 ...data.pets,
                //                 sendPet,
                //             ],
                //         }
                //     cache.writeQuery({ query: PETS, data })
                // },
            })
    );

    onDone(() => {
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
            sendPet,
            petData,
            error,
            refetch,
            pets,
            onDone
        }
    },
}
</script>