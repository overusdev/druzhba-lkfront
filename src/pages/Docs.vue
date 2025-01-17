<template>
    <div class="docs q-pa-md">
        <q-layout 
            view="lHh lpr lFf"
            container
            style="min-height: 800px"
            class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <span class="docs__toolbar-title">Общее количество документов: {{ docs.length }}</span>
                    <router-link to="/add-doc">
                        <q-btn
                            color="white"
                            text-color="black"
                            icon="add"
                            :label="!store.isMobile ? 'Добавить документ' : ''"
                            class="b-button"
                        />
                    </router-link>
                    <router-link :to="`/edit-doc/${ docsGroup.length ? docsGroup[0].id : null}`">
                        <q-btn
                            class="b-button"
                            color="white"
                            icon="edit"
                            text-color="black"
                            :label="!store.isMobile ? 'Редактировать' : ''"
                            :disable="disableEditButton"
                        >
                            <q-tooltip
                                v-if="disableEditButton"
                                v-model="showingEditTooltip"
                                anchor="bottom left" self="top middle"
                                class="bg-grey-1 text-subtitle1 text-black shadow-4"
                                :offset="[10, 10]"
                            >Удалять можно только выбранный элемент
                            </q-tooltip>
                        </q-btn>
                    </router-link>
                    <q-btn
                        class="b-button"
                        color="red-10"
                        icon="delete"
                        :label="!store.isMobile ? 'Удалить выбранный' : ''"
                        :disable="disableRemoveButton"
                        @click="upplyRemoveDocs"
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
                        link="https://www.druzba-nn.ru/docs"
                        class="ads__toolbar-note"
                    />
                    <q-table
                        :rows="docs"
                        :columns="columns"
                        row-key="title"
                        selection="single"
                        v-model:selected="docsGroup"
                        :separator="separator"
                        :loading="loading"
                        no-data-label="документов не найдено"
                        hide-pagination
                        hide-selected-banner
                    >
                        <template v-if="docsGroup.length" v-slot:bottom>
                            Выбран документ {{ docsGroup[0].id }}
                        </template>
                    </q-table>
                </q-page>
            </q-page-container>
        </q-layout>
        <ConfirmDialog
            v-model="showRemovePopup"
            text="После подтверждения действия, данные будут безвозвратно удалены.
                    Действительно удалить документ?"
            @update:modelValue="removeDocs"
            @close="showRemovePopup = false"
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
    ConfirmDialog,
  },
  setup () {
    const disableRemoveButton = ref(true);
    const disableEditButton = ref(true);
    const showRemovePopup = ref(false);
    const store = useGeometryStore();
    const showingRemoveTooltip = ref(false);
    const showingEditTooltip = ref(false);
    const columns = [
        {
            name: 'title',
            required: true,
            label: 'Название',
            align: 'left',
            field: row => row.title || '-',
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
            name: 'date',
            required: true,
            label: 'Дата обновления',
            align: 'left',
            field: row => row.updated || '-',
            format: val => `${val}`,
            sortable: true
        },
    ];
    const docsData = ref({
        title: '',
        theme: '',
        date: '',
    });
    const docsGroup = ref([]);
    const docsIds = ref([]);
    const docId = ref("");
    const DOCS = gql`
        query findAll($take: Int!) {
            docs(take: $take) {
                id
                title
                theme
                date
                updated
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(DOCS, () => ({
        take: 500,
        title: docsData.value.title,
        theme: docsData.value.theme,
        date: docsData.value.date,
        updated: docsData.value.updated,
    }));
    const docs = computed(() => result.value?.docs ?? []);
    const options = computed(() => docs.value);
    const { mutate: removeDocs, onDone: onDoneRemoveDocs } = useMutation(gql`
        mutation removeAll($ids: [Int!]!){
            removeDocsByIds(ids: $ids) {
                id
            }
        }
        `, () => ({
                variables: {
                    ids: docsGroup.value.map(i => i.id)
                },
            })
    );

    function upplyRemoveDocs() {
        showRemovePopup.value = true;
    }

    onDoneRemoveDocs(() => {
        docsData.value.title = "";
        docsData.value.theme = "";
        docId.value = "";
        showRemovePopup.value = false;
        refetch();
    })

    onMounted(async () => {
        await refetch();
    });

    watch(
        () => docsGroup.value,
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
            docsData,
            error,
            refetch,
            docs,
            docsGroup,
            docsIds,
            docId,
            options,
            removeDocs,
            onDoneRemoveDocs,
            columns,
            separator: ref('vertical'),
            disableRemoveButton,
            disableEditButton,
            showRemovePopup,
            upplyRemoveDocs,
            store,
            showingRemoveTooltip,
            showingEditTooltip,
        }
    },
}
</script>

<style scoped lang="scss">
.docs {
    &__toolbar-title {
        flex: 1 1 0%;
        min-width: 1px;
        max-width: 100%;
        font-size: 16px;
    }
    &__dialog {
        position: relative;
    }
    &__close-icon {
        position: absolute;
        top: 10px;
        right: 6px;
    }
    :deep(.q-table tbody td) {
        font-size: 16px;
    }
    :deep(.q-table th.sortable) {
        font-size: 16px;
    }
}

.b-button {
  padding: 13px 16px !important;
  border-radius: 6px !important;
  margin: 12px 0 12px 12px;
}
</style>
