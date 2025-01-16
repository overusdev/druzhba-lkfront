<template>
    <div class="add-new q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/news">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <div class="add-new__toolbar-title">
                        Добавление нового документа
                    </div>
                    <!-- <q-toolbar-title>Добавление новой новости</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="sendNews"/> -->
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-lg">
                    <div class="add-new__action-panel">
                        <div
                            class="add-new__save-button"
                            :class="{'add-new__save-button--disabled': !disableSaveBtn }"
                            @click="sendNews"
                        >
                            Сохранить данные
                        </div>
                    </div>
                    <div class="q-pt-lg" style="max-width: 1000px">
                        <q-input v-model="newsData.name" label="Заголовок" class="add-new__input q-mb-lg"/>
                        <div class="q-mb-lg">
                            <p class="text">Описание</p>
                            <NoteBlock
                                msg='Внимание! Допустимый фомат фалов при вложении - JPEG или JPG,
                                общим размером не более 1mb. <br>
                                При прикреплении изображения рекомендуется его "стянуть/сжать" курсором мыши до минимального размера'
                                type="warning"
                            />
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
import { ref, reactive, watch } from 'vue';
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
        const newsData = ref({
            name: '',
            theme: '',
            date: ''
        });
        const newsDataLock = ref({
            name: '',
            theme: '',
            date: ''
        });
        const disableSaveBtn = ref(false);
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
                        name: newsData.value.name,
                        theme: newsData.value.theme,
                        date: createDate.toFormat("dd MMMM yyyy hh:mm"),
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


        watch(
            () => newsData.value,
            (v) => {

                if(JSON.stringify(v) !== JSON.stringify(newsDataLock.value)) {
                    disableSaveBtn.value = true;
                } else {
                    disableSaveBtn.value = false;
                }
            },
            {
                deep: true,
            }
        );

        return {
            sendNews,
            newsData,
            onDone,
            router,
            createDate,
            tinymceScriptSrc,
            plugins,
            fileUpload,
            newsDataLock,
            disableSaveBtn,
        }
    },
}
</script>

<style scoped lang="scss">
.add-new {
    &__input {
        margin-bottom: 24px;
        &--readonly {
            opacity: .5;
        }
    }

    &__action-panel {
        @media screen and (min-width: 768px) {
            display: flex;
            align-items: center;
        }
    }

    &__save-button {
        display: inline-block;
        padding: 12px;
        border: 3px solid #3794ae;
        background: #f0f9ff;
        border-radius: 8px;
        margin-bottom: 16px;
        margin-right: 12px;

        &--disabled {
            opacity: .5;
            cursor: pointer;
        }

        @media screen and (min-width: 768px) {
            cursor: pointer;
        }
    }

    &__toolbar-title {
        font-size: 18px;
    }

    &__toolbar-link {
        color: #006689;
        text-decoration: none;

        @media screen and (min-width: 768px) {
            cursor: pointer;
        }

        &:visited {
            color: #006689;
        }
    }

    :deep(.q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input) {
        font-size: 16px !important;
    }

    :deep(.q-field__label) {
        top: 15px !important;
    }
}
</style>
