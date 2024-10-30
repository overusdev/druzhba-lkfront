<template>
    <main class="tiny-editor">
        <p
            v-if="title"
            class="tiny-editor__title">{{ title }}
        </p>
        <p>{{ state.text }}</p>
        <div class="tiny-editor__wrapper">
            <div class="tiny-editor__header">
                <div
                    class="tiny-editor__header-item"
                    @click="setBold"
                >
                    Bold
                </div>
                <div
                    class="tiny-editor__header-item"
                >
                    Italic
                </div>
            </div>
            <iframe
                ref="iframeEl"
                contenteditable="true"
                allowtransparency="true"
                id="iframeEl"
                class="tiny-editor__iframeEl"
            >
            </iframe>
        </div>
    </main>
</template>

<script setup>
import { useTextSelection } from '@vueuse/core';
import { ref, onMounted, onUnmounted, watch } from 'vue';

const state = useTextSelection();
const content = ref('');

const iframeEl = ref(null);
const insertText = ref(false);
let frameDoc  = ref(null);
let selectedText  = ref(null);
let setToBold = ref(false);


defineProps({
  title: String,
})

function setBold() {
    console.log(frameDoc.value.body.innerHTML);
    setToBold.value = !setToBold.value;

    if(setToBold.value) {
        frameDoc.value.body.innerHTML = frameDoc.value.body.innerHTML.replace(selectedText.value, `<b>${selectedText.value}</b>`);
        selectedText.value = null;
    } else {
        // frameDoc.value.body.innerHTML = frameDoc.value.body.innerHTML.replace(selectedText.value, `<span>${selectedText.value}</span>`)
    }
}

onMounted(() => {
    const outputBody = iframeEl.value.contentDocument.body;
    // let frameDoc = iframeEl.value.document;
    frameDoc.value = iframeEl.value.document;
    outputBody.contentEditable = true;

    if (iframeEl.value.contentWindow) {
        // frameDoc = iframeEl.value.contentWindow.document;
        frameDoc.value = iframeEl.value.contentWindow.document;
    }

    outputBody.addEventListener('keydown', (e) => {
        // frameDoc.execCommand('formatblock', false, 'p');
        frameDoc.value.execCommand('formatblock', false, 'p');
    });

    // frameDoc.addEventListener("selectionchange", event => {
    frameDoc.value.addEventListener("selectionchange", event => {
        // let selection = frameDoc.getSelection ? frameDoc.getSelection().toString() :  frameDoc.selection.createRange().toString() ;
        selectedText.value = frameDoc.value.getSelection ? frameDoc.value.getSelection().toString() :  frameDoc.value.selection.createRange().toString() ;
        // console.log(selection);
    })
});
onUnmounted(() => {
    document.removeEventListener('keydown', (e) => {
        e.preventDefault();
    });
});

</script>

<style scoped lang="scss">
.tiny-editor {
    [contenteditable] {
        white-space: pre-wrap;
        display: inline-block;
    }
    &__header {
        display: flex;
    }
    &__header-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: 1px solid;
        cursor: pointer;
    }
    &__iframeEl {
        width: 100%;
        min-height: 350px;
        border: 1px solid #000;
    }
}
.read-the-docs {
  color: #888;
}
</style>
