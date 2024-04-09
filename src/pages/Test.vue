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
        <div v-if="loading">Loading...</div>

        <ul v-else-if="result && result.pets">
            <li v-for="user of result.pets" :key="user.id">
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
import { useQuery } from "@vue/apollo-composable";

export default {
  setup () {
    const store = useCounterStore();
    const count = computed(() => store.counter);
    const doubleCountValue = computed(() => store.doubleCount);
    const incrementCount = () => store.increment();
    const decrementCount = () => store.counter--;

    const { counter, doubleCount } = storeToRefs(store);
    const { increment } = store;
    const { result, loading } = useQuery(gql`
            query findAll {
                pets {
                    id
                    name
                    type
                }
            }
        `)

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
        }
    },
}
</script>