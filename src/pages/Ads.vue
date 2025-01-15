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
                        <q-btn
                            color="white"
                            text-color="black"
                            icon="add"
                            :label="!store.isMobile ? 'Добавить объявление' : ''"
                        />
                    </router-link>
                    <router-link :to="`/edit-ad/${ adsGroup.length ? adsGroup[0].id : null}`">
                        <q-btn
                            class="q-ml-sm"
                            color="white"
                            icon="edit"
                            text-color="black"
                            :label="!store.isMobile ? 'Редактировать' : ''"
                            :disable="disableEditButton"/>
                    </router-link>
                    <q-btn
                        class="q-ml-sm"
                        color="red-10"
                        icon="delete"
                        :label="!store.isMobile ? 'Удалить выбранное' : ''"
                        :disable="disableRemoveButton"
                        @click="upplyRemoveAd"
                    >
                        <q-tooltip
                            v-if="disableRemoveButton"
                            v-model="showingRemoveTooltip"
                            anchor="bottom left" self="top middle"
                            class="bg-grey-1 text-subtitle1 text-black shadow-4"
                            :offset="[10, 10]"
                        >Удалять можно только выбранный элемент
                        </q-tooltip>
                    </q-btn>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <ToolbarNote
                        msg="Редакторование объявлений раздела"
                        link="https://www.druzba-nn.ru/ads"
                        class="ads__toolbar-note"
                    />
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
        <ConfirmDialog
            v-model="showRemovePopup"
            text="После подтверждения действия, данные будут безвозвратно удалены.
                    Действительно удалить объявление?"
            @update:modelValue="removeAd"
        />
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useGeometryStore } from '../stores/geometry';
import ToolbarNote from '../components/ToolbarNote.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

export default {
  components:{
    ToolbarNote,
    ConfirmDialog
  },
  setup () {
    const disableRemoveButton = ref(true);
    const disableEditButton = ref(true);
    const showRemovePopup = ref(false);
    const store = useGeometryStore();
    const showingRemoveTooltip = ref(false);
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
            store,
            showingRemoveTooltip,
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
    &__toolbar-note {
        margin-bottom: 16px;
    }
    :deep(.q-table tbody td) {
        font-size: 16px;
    }
    :deep(.q-table th.sortable) {
        font-size: 16px;
    }
}
</style>
