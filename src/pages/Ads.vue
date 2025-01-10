<template>
    <div class="ads q-pa-md">
        <q-layout 
            view="lHh lpr lFf"
            container
            style="min-height: 800px"
            class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <q-toolbar-title>Список объявлений <span class="text-weight-bold">всего: {{ ads.length }}</span></q-toolbar-title>
                    <router-link to="/add-ad">
                        <q-btn color="white" text-color="black" icon="add" label="Добавить объявление" />
                    </router-link>
                    <router-link :to="`/edit-ad/${ adsGroup.length ? adsGroup[0].id : null}`">
                        <q-btn
                            class="q-ml-sm"
                            color="white"
                            icon="edit"
                            text-color="black"
                            label="Редактировать"
                            :disable="disableEditButton"/>
                    </router-link>
                    <q-btn
                        class="q-ml-sm"
                        color="red"
                        icon="delete"
                        label="Удалить выбранную"
                        :disable="disableRemoveButton"
                        @click="upplyRemoveAd"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <q-table
                        :rows="ads"
                        :columns="columns"
                        row-key="name"
                        selection="single"
                        v-model:selected="adsGroup"
                        :separator="separator"
                        :loading="loading"
                        no-data-label="объявлений не найдено"
                        hide-pagination
                        hide-selected-banner
                    >
                        <template v-if="adsGroup.length" v-slot:bottom>
                            Выбрано объявление {{ adsGroup[0].id }}
                        </template>
                    </q-table>
                </q-page>
            </q-page-container>
        </q-layout>
        <q-dialog v-model="showRemovePopup">
            <q-card class="ads__dialog">
                <q-card-section class="q-pt-xl">
                    <p class="text text-red">Действительно удалить объявление?</p>
                    <q-btn flat no-caps icon="close" class="ads__close-icon" v-close-popup />
                    <q-btn
                        color="red"
                        icon="delete"
                        label="Да, удалить"
                        @click="removeAd"/>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";

export default {
  setup () {
    const disableRemoveButton = ref(true);
    const disableEditButton = ref(true);
    const showRemovePopup = ref(false);
    const columns = [
        {
            name: 'name',
            required: true,
            label: 'Название',
            align: 'left',
            field: row => row.name || '-',
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'date',
            required: true,
            label: 'Дата создания',
            align: 'left',
            field: row => row.date || '-',
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'updated',
            required: true,
            label: 'Дата обновления',
            align: 'left',
            field: row => row.updated || '-',
            format: val => `${val}`,
            sortable: true
        },
    ];
    const adsData = ref({
        name: '',
        theme: '',
        date: '',
    });
    const adsGroup = ref([]);
    const ADS = gql`
        query findAll($take: Int!) {
            ads(take: $take) {
                id
                name
                theme
                date
                updated
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(ADS, () => ({
        take: 500,
        name: adsData.value.name,
        theme: adsData.value.theme,
    }));
    const ads = computed(() => result.value?.ads ?? []);
    const options = computed(() => ads.value);
    const { mutate: removeAd, onDone: onDoneremoveAd } = useMutation(gql`
        mutation removeAll($ids: [Int!]!){
            removeAdByIds(ids: $ids) {
                id
            }
        }
        `, () => ({
                variables: {
                    ids: adsGroup.value.map(i => i.id)
                },
            })
    );

    function upplyRemoveAd() {
        showRemovePopup.value = true;
    }

    onDoneremoveAd(() => {
        adsData.value.name = "";
        adsData.value.theme = "";
        adsGroup.value = [];
        showRemovePopup.value = false;
        refetch();
    })

    onMounted(async () => {
        await refetch();
    });

    watch(
        () => adsGroup.value,
        (v) => {
            if(v.length) {
                disableRemoveButton.value = false;
                disableEditButton.value = false;
            } else {
                disableRemoveButton.value = true;
                disableEditButton.value = true;
            }
        }
    );

        return {
            result,
            loading,
            adsData,
            error,
            refetch,
            ads,
            adsGroup,
            options,
            removeAd,
            onDoneremoveAd,
            columns,
            separator: ref('vertical'),
            disableRemoveButton,
            disableEditButton,
            showRemovePopup,
            upplyRemoveAd,
        }
    },
}
</script>

<style scoped lang="scss">
.ads {
    &__dialog {
        position: relative;
    }
    &__close-icon {
        position: absolute;
        top: 10px;
        right: 6px;
    }
}
</style>
