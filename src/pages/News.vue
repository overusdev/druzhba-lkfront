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
                        <q-btn color="white" text-color="black" icon="add" label="Добавить новость" />
                    </router-link>
                    <router-link :to="`/edit-news/${ newsGroup.length ? newsGroup[0].id : null}`">
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
                        @click="upplyRemoveNews"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
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
        <q-dialog v-model="showRemovePopup">
            <q-card class="news__dialog">
                <q-card-section class="q-pt-xl">
                    <p class="text text-red">Действительно удалить новость?</p>
                    <q-btn flat no-caps icon="close" class="news__close-icon" v-close-popup />
                    <q-btn
                        color="red"
                        icon="delete"
                        label="Да, удалить"
                        @click="removeNews"/>
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
