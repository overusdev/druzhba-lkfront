<template>
    <div class="q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-page-container>
                <q-page class="q-pa-md completd-contacts">
                    <h1 class="text-h6">
                        <q-icon name="done_outline" color="green"/>
                        Данные успешно отредактированны.
                    </h1>
                    <router-link to="/contacts-update">
                        Вернуться
                    </router-link>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.completd-contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
