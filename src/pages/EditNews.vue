<template>
    <div class="edit-new q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/news">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <div class="edit-new__toolbar-title">
                        Редактирование новости
                        <a :href="link" rel="noopener noreferrer" target="_blank" class="edit-new__toolbar-link">
                            https://www.druzba-nn.ru/ads/{{ newsData.id }}
                        </a>
                    </div>
                    <!-- <q-toolbar-title>Редактироване новсти {{ newsData.id }}</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="editNews"/>
                    <q-btn
                        class="q-ml-sm"
                        color="red"
                        icon="delete"
                        @click="upplyRemoveNews"/> -->
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-lg">
                    <div
                        class="edit-new__save-button"
                        :class="{'edit-new__save-button--disabled': !disableSaveBtn }"
                        @click="editNews"
                    >
                        Сохранить данные
                    </div>
                    <div class="q-pt-lg" style="max-width: 1000px">
                        <q-input v-model="newsData.name" label="Заголовок" class="edit-new__input q-mb-lg"/>
                        <q-input v-model="newsData.mainPageText" label="Текст для главной страницы" class="edit-new__input q-mb-lg"/>
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
import { ref, computed, reactive, onMounted, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import Editor from '@tinymce/tinymce-vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import NoteBlock from '../components/NoteBlock.vue';

export default {
    components:{
        Editor,
        ConfirmDialog,
        NoteBlock,
    },
    setup () {
        const disableEditButton = ref(true);
        const showRemovePopup = ref(false);
        const router = useRouter();
        const route = useRoute();
        let now = DateTime.now().toString();
        let updatedDate = DateTime.fromISO(now, { locale: "ru" });
        const newsData = ref({
            name: '',
            theme: '',
            updated: '',
            mainPageText: ''
        });
        const newsDataLock = ref({
            name: '',
            theme: '',
            updated: '',
            mainPageText: ''
        });
        const disableSaveBtn = ref(false);
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
        const NEWS = gql`
            query findOne($id: Int!) {
                new(id: $id) {
                    id
                    name
                    theme
                    main_page_text
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
                $updated: String!,
                $main_page_text: String!,
            ){
                updateNews(updateNewsInput: {
                    id: $id,
                    name: $name,
                    theme: $theme,
                    updated: $updated,
                    main_page_text: $main_page_text,
                }) {
                        id
                        name
                        theme
                        main_page_text
                    }
                }
            `, () => ({
                    variables: {
                        id: Number(route.params.id),
                        name: newsData.value.name,
                        theme: newsData.value.theme,
                        main_page_text: newsData.value.mainPageText,
                        updated: updatedDate.toFormat("dd MMMM yyyy hh:mm"),
                    },
                })
        );
        const { mutate: removeNews, onDone: onDoneremoveNews } = useMutation(gql`
            mutation removeAll($id: Int!){
                removeNews(id: $id) {
                    id
                }
            }
            `, () => ({
                    variables: {
                        id: Number(route.params.id)
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

        onDoneremoveNews(() => {
            router.push({
                name: "news",
            });
        })

        onMounted(async () => {
            const refetchQuery = await refetch();
            if(refetchQuery.data.new) {
                newsData.value.id = refetchQuery.data.new.id;
                newsData.value.name = refetchQuery.data.new.name;
                newsData.value.theme = refetchQuery.data.new.theme;
                newsData.value.mainPageText = refetchQuery.data.new.main_page_text;

                newsDataLock.value.id = refetchQuery.data.new.id;
                newsDataLock.value.name = refetchQuery.data.new.name;
                newsDataLock.value.theme = refetchQuery.data.new.theme;
                newsDataLock.value.mainPageText = refetchQuery.data.new.main_page_text;
            }
        });

        function upplyRemoveNews() {
            showRemovePopup.value = true;
        }

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
            editNews,
            newsData,
            onDone,
            result,
            loading,
            refetch,
            router,
            route,
            news,
            upplyRemoveNews,
            disableEditButton,
            showRemovePopup,
            onDoneremoveNews,
            removeNews,
            tinymceScriptSrc,
            plugins,
            fileUpload,
            disableSaveBtn,
            newsDataLock,
        }
    },
}
</script>

<style scoped lang="scss">
.edit-new {
    &__dialog {
        position: relative;
    }

    &__close-icon {
        position: absolute;
        top: 10px;
        right: 6px;
    }

    &__input {
        margin-bottom: 12px;
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

    &__remove-button {
        display: inline-block;
        padding: 12px;
        border: 3px solid #b71c1c;
        background: #fff6fb;
        border-radius: 8px;
        margin-bottom: 16px;
        margin-right: 12px;

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
