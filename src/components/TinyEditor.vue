<template>
    <main class="tiny-editor">
        <p
            v-if="title"
            class="tiny-editor__title">{{ title }}
        </p>
        <div class="tiny-editor__wrapper">
            <div class="tiny-editor__header">
                <!-- <div
                    class="tiny-editor__header-item"
                    :class="{
                        'tiny-editor__header-item--state--active': setToBold
                    }"
                    onmousedown="event.preventDefault();"
                    @click="setBold"
                >
                    Bold
                </div>
                <div
                    class="tiny-editor__header-item"
                    :class="{
                        'tiny-editor__header-item--state--active': setToItalic
                    }"
                    onmousedown="event.preventDefault();"
                    @click="setItalic"
                >
                    Italic
                </div> -->
                <div
                    class="tiny-editor__header-item"
                    onmousedown="event.preventDefault();"
                    @click="setBold"
                >
                    Bold
                </div>
                <div
                    class="tiny-editor__header-item"
                    onmousedown="event.preventDefault();"
                    @click="setItalic"
                >
                    Italic
                </div>
            </div>
            <div
                ref="iframeEl"
                contenteditable="true"
                id="iframeEl"
                class="tiny-editor__iframeEl"
            >
            </div> 
            <!-- <iframe
                ref="iframeEl"
                contenteditable="true"
                allowtransparency="true"
                id="iframeEl"
                class="tiny-editor__iframeEl"
            >
            </iframe> -->
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
}
function setItalic() {
    setToItalic.value = !setToItalic.value;
}

onMounted(() => {
    iframeEl.value.addEventListener('onmousedown', (event) => {
        event.preventDefault();
    });

    iframeEl.value.addEventListener("click", function(e){
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const span = document.createElement("p");
        range.setStart(span, 0);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
    }, true);
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
