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
        <q-page padding>
            <p v-for="n in 5" :key="n">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit nihil praesentium molestias a adipisci, dolore vitae odit, quidem consequatur optio voluptates asperiores pariatur eos numquam rerum delectus commodi perferendis voluptate?
            </p>
        </q-page>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { computed } from 'vue';
import { useCounterStore } from '../stores/counter';
import { storeToRefs } from 'pinia';

const drawer = ref(false);
const store = useCounterStore();

// Option 2: use computed and functions to use the store
const count = computed(() => store.counter);
const doubleCountValue = computed(() => store.doubleCount);
const incrementCount = () => store.increment(); // use action
const decrementCount = () => store.counter--; // manipulate directly

// Option 3: use destructuring to use the store in the template
const { counter, doubleCount } = storeToRefs(store); // state and getters need "storeToRefs"
const { increment } = store; // actions can be destructured directly

</script>