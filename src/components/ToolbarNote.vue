<template>
    <div class="toolbar-note">
        {{ msg }} <a :href="link" rel="noopener noreferrer" target="_blank">{{ link }}</a>
    </div>
</template>

<script setup lang="js">
defineProps({
  msg: String,
  link: String,
});
</script>

<style scoped lang="scss">
.toolbar-note {
    padding: 12px;
    border: 3px solid #3c9b60;
    background: #e9f4ee;
    border-radius: 8px;
    margin-bottom: 16px;

    a {
        color: #006689;
        text-decoration: none;

        &:visited {
            color: #006689;
        }
    }
}
</style>

