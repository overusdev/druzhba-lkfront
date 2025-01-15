<template>
    <q-dialog
        v-model="props.modelValue"
        class="confirm"
    >
        <q-card class="confirm__dialog">
            <q-card-section class="q-pt-xl">
                <p class="confirm__dialog-text">{{ text }}</p>
                <q-btn
                    flat
                    no-caps
                    icon="close" 
                    class="confirm__close-icon"
                    v-close-popup
                    @click="close"
                />
                <div class="confirm__dialog-remove-btn" @click="confirm">
                    Да, удалить
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
    modelValue: Boolean,
    text: String,
});
const emit = defineEmits(['update:modelValue', 'close']);

function confirm() {
    emit('update:modelValue');
}
function close() {
    emit('close');
}
</script>

<style scoped lang="scss">
.confirm {
    &__dialog {
        position: relative;
        border-radius: 8px;
    }

    &__dialog-text {
        font-size: 16px;
    }

    &__dialog-remove-btn {
        text-align: center;
        padding: 12px;
        border: 3px solid #b71c1c;
        font-size: 16px;
        color: #b71c1c;
        border-radius: 8px;

        @media screen and (min-width: 768px) {
            cursor: pointer;
        }
    }

    &__close-icon {
        position: absolute;
        top: 10px;
        right: 6px;
    }
}
</style>