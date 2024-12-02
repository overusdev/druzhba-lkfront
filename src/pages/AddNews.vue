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
                    <div class="q-pa-md q-pt-lg" style="max-width: 1000px">
                        <q-input v-model="newsData.name" label="Заголовок" class="q-mb-lg"/>
                        
                        <div class="q-mb-lg">
                            <Editor
                                api-key="no-api-key"
                                :tinymce-script-src="tinymceScriptSrc"
                                v-model="newsData.theme"
                                :init="{
                                toolbar_mode: 'sliding',
                                plugins: plugins,
                                language: 'ru',
                                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                tinycomments_mode: 'embedded',
                                tinycomments_author: 'Author name',
                                images_upload_handler: fileUpload,
                                mergetags_list: [
                                    { value: 'First.Name', title: 'First Name' },
                                    { value: 'Email', title: 'Email' },
                                ],
                                }"
                                initial-value=""
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
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import gql from 'graphql-tag';
import { useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";
import Editor from '@tinymce/tinymce-vue';
import TinyEditor from "./../components/TinyEditor.vue";

export default {
  components:{
    Editor,
    TinyEditor
  },
  setup () {
    let now = DateTime.now().toString();
    let createDate = DateTime.fromISO(now, { locale: "ru" });
    const tinymceScriptSrc = '/plugins/tinymce/tinymce.min.js';
    const plugins = [
        "paste",
        "accordion",
        "advlist",
        "anchor",
        "autolink",
        "autoresize",
        "charmap",
        "code",
        "codesample",
        "directionality",
        "emoticons",
        "fullscreen",
        "help",
        "image",
        "importcss",
        "insertdatetime",
        "link",
        "lists",
        "media",
        "nonbreaking",
        "pagebreak",
        "preview",
        "quickbars",
        "save",
        "searchreplace",
        "table",
        "visualblocks",
        "visualchars",
        "wordcount",
    ];
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

    async function fileUpload(blobInfo) {
        console.log('blobInfo', blobInfo);
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
            tinymceScriptSrc,
            plugins,
            fileUpload,
        }
    },
}
</script>
