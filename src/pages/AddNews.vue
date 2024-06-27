<template>
    <div class="q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/news">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <q-toolbar-title>Добавление новой новости</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="sendNews"/>
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
import { reactive } from 'vue';
import gql from 'graphql-tag';
import { useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";


export default {
  setup () {
    let now = DateTime.now().toString();
    let createDate = DateTime.fromISO(now, { locale: "ru" });
    const router = useRouter();
    const newsData = reactive({
        name: '',
        theme: '',
        date: ''
    });
    const { mutate: sendNews, onDone } = useMutation(gql`
        mutation createNewNews(
            $name: String!,
            $theme: String!,
            $date: String!,
        ){
            createNews(createNewsInput: { 
                name: $name,
                theme: $theme,
                date: $date,
            }) {
                    id
                    name
                    theme
                    date
                }
            }
        `, () => ({
                variables: {
                    name: newsData.name,
                    theme: newsData.theme,
                    date: createDate.toFormat("dd MMMM yyyy"),
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
        return {
            sendNews,
            newsData,
            onDone,
            router,
            createDate,
            pasteCapture,
            dropCapture,
        }
    },
}
</script>
