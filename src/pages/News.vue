<template>
    <div class="news q-pa-md">
        <q-layout 
            view="lHh lpr lFf"
            container
            style="min-height: 800px"
            class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <q-toolbar-title>Список новостей <span class="text-weight-bold">всего: {{ news.length }}</span></q-toolbar-title>
                    <router-link to="/add-news">
                        <q-btn
                            color="white"
                            text-color="black"
                            icon="add"
                            :label="!store.isMobile ? 'Добавить новость' : ''"
                        />
                    </router-link>
                    <router-link :to="`/edit-news/${ newsGroup.length ? newsGroup[0].id : null}`">
                        <q-btn
                            class="q-ml-sm"
                            color="white"
                            icon="edit"
                            text-color="black"
                            :label="!store.isMobile ? 'Редактировать' : ''"
                            :disable="disableEditButton"
                        />
                    </router-link>
                    <q-btn
                        class="q-ml-sm"
                        color="red-10"
                        icon="delete"
                        :label="!store.isMobile ? 'Удалить выбранную' : ''"
                        :disable="disableRemoveButton"
                        @click="upplyRemoveNews"
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
                        msg="Редакторование новостей раздела"
                        link="https://www.druzba-nn.ru/news"
                        class="news__toolbar-note"
                    />
                    <q-table
                        :rows="news"
                        :columns="columns"
                        row-key="name"
                        selection="single"
                        v-model:selected="newsGroup"
                        :separator="separator"
                        :loading="loading"
                        no-data-label="новостей не найдено"
                        hide-pagination
                        hide-selected-banner
                    >
                        <template v-if="newsGroup.length" v-slot:bottom>
                            Выбрана новость {{ newsGroup[0].id }}
                        </template>
                    </q-table>
                </q-page>
            </q-page-container>
        </q-layout>
        <ConfirmDialog
            v-model="showRemovePopup"
            text="После подтверждения действия, данные будут безвозвратно удалены.
                    Действительно удалить все данные по новости?"
            @update:modelValue="removeNews"
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
            name: 'date',
            required: true,
            label: 'Дата обновления',
            align: 'left',
            field: row => row.updated || '-',
            format: val => `${val}`,
            sortable: true
        },
    ];
    const newsData = ref({
        name: '',
        theme: '',
        date: '',
    });
    const newsGroup = ref([]);
    const newsIds = ref([]);
    const NEWS = gql`
        query findAll($take: Int!) {
            news(take: $take) {
                id
                name
                theme
                date
                updated
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(NEWS, () => ({
        take: 500,
        name: newsData.value.name,
        theme: newsData.value.theme,
    }));
    const news = computed(() => result.value?.news ?? []);
    const options = computed(() => news.value);
    const { mutate: removeNews, onDone: onDoneremoveNews } = useMutation(gql`
        mutation removeAll($ids: [Int!]!){
            removeNewsByIds(ids: $ids) {
                id
            }
        }
        `, () => ({
                variables: {
                    ids: newsGroup.value.map(i => i.id)
                },
            })
    );

    function upplyRemoveNews() {
        showRemovePopup.value = true;
    }

    onDoneremoveNews(() => {
        newsData.value.name = "";
        newsData.value.surname = "";
        newsGroup.value = [];
        showRemovePopup.value = false;
        refetch();
    })

    onMounted(async () => {
        await refetch();
    });

    watch(
        () => newsGroup.value,
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
            newsData,
            error,
            refetch,
            news,
            newsGroup,
            newsIds,
            options,
            removeNews,
            onDoneremoveNews,
            columns,
            separator: ref('vertical'),
            disableRemoveButton,
            disableEditButton,
            showRemovePopup,
            upplyRemoveNews,
            store,
            showingRemoveTooltip,
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
