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
            <button @click="removePets()">
                Remove pets by ids
            </button>
            <pre>{{ petGroup }}</pre>
        </div>
        <div v-if="loading">Loading...</div>
        <ul v-else-if="pets && pets.length">
            <q-option-group
                :options="options"
                type="checkbox"
                v-model="petGroup"
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
        <div v-else>No pets in DB</div>
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
    const petGroup = ref([]);
    const incrementCount = () => store.increment();
    const decrementCount = () => store.counter--;
    const { counter, doubleCount } = storeToRefs(store);
    const { increment } = store;
    const PETS = gql`
        query findAll($take: Int!) {
            pets(take: $take) {
                id
                name
                type
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(PETS, () => ({
        take: 4,
        name: petData.name,
        type: petData.type,
    }));
    const pets = computed(() => result.value?.pets ?? []);
    const options = computed(() => { 
        return pets.value.map(function(obj) {
            return {'label': obj.name, 'type': obj.type, 'value': obj.id};
        });
    });

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
    const { mutate: removePets, onDone: onDoneRemovePets } = useMutation(gql`
        mutation removeAll($ids: [Int!]!){
            removePets(ids: $ids) {
                id
            }
        }
        `, () => ({
                variables: {
                    ids: petGroup.value
                },
            })
    );

    onDone(() => {
        petData.name = "";
        petData.type = "";
        petGroup.value = [];
        refetch();
    })

    onDoneRemovePets(() => {
        petData.name = "";
        petData.type = "";
        petGroup.value = [];
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
            onDone,
            petGroup,
            options,
            removePets,
            onDoneRemovePets
        }
    },
}
</script>