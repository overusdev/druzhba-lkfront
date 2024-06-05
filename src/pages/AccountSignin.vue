<template>
    <div class="q-pa-md">
        <h1 class="text-h3">Auth route-page</h1>
        <div class="q-pa-md q-gutter-sm">
            <q-card flat bordered>
            <q-card-section>
                <pre style="white-space: pre-line">{{ editor }}</pre>
            </q-card-section>
            </q-card>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';

export default {
  setup () {
    const store = useAuthStore();
    // const { counter, doubleCount } = storeToRefs(store);
    const { isSignedIn, signIn } = store;

    onMounted(async() => {
        console.log('isSignedIn', isSignedIn);
    });

        return {
            isSignedIn,
            signIn
        }
    },
}

</script>
