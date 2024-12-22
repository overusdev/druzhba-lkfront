<template>
    <div class="news q-pa-md">
        <q-layout 
            view="lHh lpr lFf"
            container
            style="min-height: 800px"
            class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <q-toolbar-title>Список документов <span class="text-weight-bold">всего: {{ docs.length }}</span></q-toolbar-title>
                    <router-link to="/add-doc">
                        <q-btn color="white" text-color="black" icon="add" label="Добавить документ" />
                    </router-link>
                    <router-link :to="`/edit-doc/${ docsGroup.length ? docsGroup[0].id : null}`">
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
                        @click="upplyRemoveDocs"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
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
        <q-dialog v-model="showRemovePopup">
            <q-card class="news__dialog">
                <q-card-section class="q-pt-xl">
                    <p class="text text-red">Действительно удалить документ?</p>
                    <q-btn flat no-caps icon="close" class="news__close-icon" v-close-popup />
                    <q-btn
                        color="red"
                        icon="delete"
                        label="Да, удалить"
                        @click="removeDocs"/>
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
        }
    },
}
</script>

<style scoped lang="scss">
.news {
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
