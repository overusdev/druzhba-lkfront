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
                            <TinyEditor
                                title="Описание"
                            />

                            <!-- <input
                                ref="fileInput"
                                @change="attachFile($event)"
                                type="file" id="js-file" accept=".jpeg,.png,jpg,.txt,.css,.html">
                            <br>
                            <textarea
                                class="row"
                                ref="myReference"
                                v-model="newsData.theme"
                                name="text"
                                id="text"
                                @drop="handleFileDrop($event)"
                            >
                            </textarea> -->
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
        // theme: '<img src="https://cdn.imgchest.com/files/thumb/6yxkc5npwv7.jpg" alt="" srcset=""><p><a href="images/xxx.jpg">Посмотрите на мою фотографию!</a></p>',
        theme: '',
        date: ''
    });
    const myReference = ref(null);
    const fileInput = ref(null);
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

    function getInput($event) {
        console.log($event);
    }

    function onPaste (evt) {
      console.log('on paste', evt)
    }
    function attachFile (input) {
        var file;

        // Check if a file is actually selected
        // if (input.files && (file = input.files[0])) {
        if (input.target.files) {
            file = input.target.files[0]
            let reader = new FileReader();
            reader.onload = function(e){
                console.log('E', e);
                myReference.value = e.target.result;
                newsData.theme = e.target.result;
            };

            console.log(file.length);

            // Then read the file
            reader.readAsDataURL(file, "UTF-8");
        }
    }

    function handleFilePaste(e) {
        console.log('PASTE', e);
    }
    function handleFileDrop(e) {
        console.log('DROP', e);
    }

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
    onMounted(() => {
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            handleFileDrop();
        });
    });
    onUnmounted(() => {
        document.removeEventListener('dragover', (e) => {
            e.preventDefault();
        });
        document.removeEventListener('drop', (e) => {
            e.preventDefault();
            handleFileDrop();
        });
    });

        return {
            sendNews,
            newsData,
            onDone,
            router,
            createDate,
            pasteCapture,
            dropCapture,
            tinymceScriptSrc,
            plugins,
            fileUpload,
            getInput,
            onPaste,
            handleFileDrop,
            handleFilePaste,
            attachFile,
            myReference,
            fileInput
        }
    },
}
</script>
