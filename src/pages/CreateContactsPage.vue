<template>
    <div class="q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <q-toolbar-title>Добавление данных раздела</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="sendContacts"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <div class="q-pa-md q-pt-lg" style="max-width: 1000px">                        
                        <div class="q-mb-lg">
                            <NoteBlock
                                msg='Внимание! Допустимый фомат фалов при вложении - JPEG или JPG,
                                общим размером не более 1mb. <br>
                                При прикреплении изображения рекомендуется его "стянуть/сжать" курсором мыши до минимального размера'
                                type="warning"
                            />
                            <Editor
                                api-key="no-api-key"
                                :tinymce-script-src="tinymceScriptSrc"
                                v-model="contactsData.theme"
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
                                <q-card-section v-html="contactsData.theme" />
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
import Editor from '@tinymce/tinymce-vue';
import NoteBlock from '../components/NoteBlock.vue';

export default {
  components:{
    Editor,
    NoteBlock,
  },
  setup () {
    let now = DateTime.now().toString();
    let createDate = DateTime.fromISO(now, { locale: "ru" });
    const router = useRouter();
    const contactsData = reactive({
        theme: '',
        date: ''
    });
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
    const { mutate: sendContacts, onDone } = useMutation(gql`
        mutation createNewContact(
            $theme: String!,
            $date: String!,
        ){
            createContact(createContactInput: { 
                theme: $theme,
                date: $date,
            }) {
                    id
                    theme
                    date
                }
            }
        `, () => ({
                variables: {
                    theme: contactsData.theme,
                    date: createDate.toFormat("dd MMMM yyyy hh:mm"),
                },
            })
    );

    async function fileUpload(blobInfo) {
        console.log('blobInfo', blobInfo);
    }

    onDone(() => {
        router.push({
            name: "users",
        });
    })
        return {
            sendContacts,
            contactsData,
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
