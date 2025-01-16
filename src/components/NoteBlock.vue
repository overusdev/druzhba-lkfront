<template>
    <div
        class="note-block"
        :class="classes"
    >
    <q-icon
        name="warning"
        color="deep-orange-8"
        class="note-block__icon"
        size="30px"
    />
    <span class="note-block__message" v-html="msg" />
    </div>
</template>

<script setup lang="js">
import { computed } from 'vue';

const props = defineProps({
  msg: String,
  link: String,
  type: String,
});

const classes = computed(() => ({
  'note-block--default': props.type === 'default',
  'note-block--warning': props.type === 'warning',
}));

</script>

<style scoped lang="scss">
.note-block {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 2px solid;
    border-radius: 8px;
    margin-bottom: 16px;

    &--warning {
        background: #fff4f0;
        border-color: #e05b33;
    }

    &--default {
        background: #00897b;
    }

    a {
        color: #006689;
        text-decoration: none;

        &:visited {
            color: #006689;
        }
    }

    &__icon {
        margin-right: 8px;
    }
}
</style>

