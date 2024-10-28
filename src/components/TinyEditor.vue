<template>
    <main class="tiny-editor">
        <p
            v-if="title"
            class="tiny-editor__title">{{ title }}
        </p>
        <iframe
            ref="iframeEl"
            contenteditable="true"
            allowtransparency="true"
            id="iframeEl"
            class="tiny-editor__iframeEl"
        >
        </iframe>
        <!-- <div
            ref="iframeEl"
            contenteditable="true"
            allowtransparency="true"
            id="iframeEl"
            class="tiny-editor__iframeEl"
        >
        </div> -->
    </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const iframeEl = ref(null);

defineProps({
  title: String,
})

onMounted(() => {
    const outputBody = iframeEl.value.contentDocument.body;
    let frameDoc = iframeEl.value.document;
    outputBody.contentEditable = true;

    if (iframeEl.value.contentWindow) {
        frameDoc = iframeEl.value.contentWindow.document;
    }

    outputBody.addEventListener('keydown', (e) => {
        console.log(e);
        if (e.keyCode == '13') {
            var text = div.firstChild.textContent;
            div.removeChild(div.firstChild);
            var p = document.createElement('p');
            p.textContent = text;
            div.insertBefore(p, div.firstChild);
        }
        // frameDoc.execCommand('defaultParagraphSeparator', false, 'p');
        frameDoc.execCommand('formatblock', false, 'p');
        
    });
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
