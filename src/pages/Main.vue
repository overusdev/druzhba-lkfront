<template>
    <div class="q-pa-md">
        <h1 class="text-h3">This is a Main route-page</h1>
        <div class="q-pa-md q-gutter-sm">
            <q-editor
                v-model="editor"
                min-height="5rem"
                @paste.native="evt => pasteCapture(evt)"
                @drop.native="evt => dropCapture(evt)"
            />

            <q-card flat bordered>
            <q-card-section>
                <pre style="white-space: pre-line">{{ editor }}</pre>
            </q-card-section>
            </q-card>

            <q-card flat bordered>
            <q-card-section v-html="editor" />
            </q-card>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const editor = ref('What you see is <b>what</b> you get.');

function pasteCapture(e) {
    console.log(e);
}
function dropCapture(e) {
    console.log(e);
}

</script>
