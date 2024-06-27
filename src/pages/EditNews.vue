<template>
    <div class="q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/news">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <q-toolbar-title>Редактироване новсти {{ newsData.id }}</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="editNews"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <div class="q-pa-md q-pt-lg" style="max-width: 800px">
                        <q-input v-model="newsData.name" label="Заголовок" class="q-mb-lg"/>
                        
                        <div class="q-mb-lg">
                            <p class="text">Описание</p>
                            <q-editor
                                v-model="newsData.theme"
                                min-height="5rem"
                                @paste.native="evt => pasteCapture(evt)"
                                @drop.native="evt => dropCapture(evt)"
                            />
                        </div>
                        <div class="q-mb-lg">
                            <p class="text">Предпросмотр</p>
                                <q-card flat bordered>
                                <q-card-section v-html="newsData.theme" />
                            </q-card>
                        </div>
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { computed, reactive, onMounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

export default {
  setup () {
    const router = useRouter();
    const route = useRoute();
    const newsData = reactive({
        name: '',
        theme: '',
    });
    const NEWS = gql`
        query findOne($id: Int!) {
            new(id: $id) {
                id
                name
                theme
            }
        }
    `;
    const { result, loading, error, refetch } = useQuery(NEWS, () => ({
        id: Number(route.params.id),
    }));
    const news = computed(() => result ?? []);
    const { mutate: editNews, onDone } = useMutation(gql`
        mutation updateNews(
            $id: Int!,
            $name: String!,
            $theme: String!,
        ){
            updateNews(updateNewsInput: {
                id: $id,
                name: $name,
                theme: $theme,
            }) {
                    id
                    name
                    theme
                }
            }
        `, () => ({
                variables: {
                    id: Number(route.params.id),
                    name: newsData.name,
                    theme: newsData.theme,
                },
            })
    );

    function pasteCapture(e) {
        console.log(e);
    }
    function dropCapture(e) {
        console.log(e);
    }

    onDone(() => {
        router.push({
            name: "news",
        });
    })

    onMounted(async () => {
        const refetchQuery = await refetch();
        if(refetchQuery.data.new) {
            newsData.id = refetchQuery.data.new.id;
            newsData.name = refetchQuery.data.new.name;
            newsData.theme = refetchQuery.data.new.theme;
        }
    });

        return {
            editNews,
            newsData,
            onDone,
            result,
            loading,
            refetch,
            router,
            route,
            news,
            pasteCapture,
            dropCapture,
        }
    },
}
</script>
