<template>
    <main class="tiny-editor">
        <p
            v-if="title"
            class="tiny-editor__title">{{ title }}
        </p>
        <p>{{ state.text }}</p>
        <div class="tiny-editor__wrapper">
            <!-- {{ selection }} -->
            <div class="tiny-editor__header">
                <div
                    class="tiny-editor__header-item"
                    :class="{
                        'tiny-editor__header-item--state--active': setToBold
                    }"
                    @click="setBold"
                >
                    Bold
                </div>
                <div
                    class="tiny-editor__header-item"
                    :class="{
                        'tiny-editor__header-item--state--active': setToItalic
                    }"
                    @click="setItalic"
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

const iframeEl = ref(null);
let frameDoc  = ref(null);
let selection  = ref(null);
let selectedText  = ref(null);
const setToBold = ref(false);
const setToItalic = ref(false);


defineProps({
  title: String,
})

function setBold() {
    setToBold.value = !setToBold.value;
    frameDoc.value.execCommand('bold', false, '');
}
function setItalic() {
    setToItalic.value = !setToItalic.value;
    frameDoc.value.execCommand('italic', false, '');
}

onMounted(() => {
    const outputBody = iframeEl.value.contentDocument.body;
    frameDoc.value = iframeEl.value.document;
    outputBody.contentEditable = true;

    if (iframeEl.value.contentWindow) {
        frameDoc.value = iframeEl.value.contentWindow.document;
    }

    outputBody.addEventListener('keydown', (e) => {
        frameDoc.value.execCommand('formatblock', false, 'p');
    });

    frameDoc.value.addEventListener("selectionchange", event => {
        selection.value = frameDoc.value.getSelection();
        selectedText.value = frameDoc.value.getSelection ? frameDoc.value.getSelection().toString() :  frameDoc.value.selection.createRange().toString() ;
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
        border-top: 1px solid #000;
        border-right: 1px solid #000;
        cursor: pointer;

        &:first-child {
            border-left: 1px solid #000;
        }

        &--state {
            &--active {
                background: #000;
                color: #fff;
            }
        }
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
