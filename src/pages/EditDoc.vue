<template>
    <div class="edit-doc q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/docs">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <div class="edit-doc__toolbar-title">
                        Редактироване документа {{ docsData.id }}
                    </div>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-lg">
                    <div class="edit-doc__action-panel">
                        <div
                            class="edit-doc__save-button"
                            :class="{'edit-doc__save-button--disabled': !disableSaveBtn }"
                            @click="editDoc"
                        >
                            Сохранить данные
                        </div>
                        <div
                            class="edit-doc__remove-button"
                            @click="upplyRemoveDoc"
                        >
                            Удалить
                        </div>
                    </div>
                    <div class="q-pt-lg" style="max-width: 1000px">
                        <q-input
                            v-model="docsData.title"
                            label="Заголовок"
                            class="user__input q-mb-lg"
                        />
                        <div class="q-mb-lg">
                            <Editor
                                api-key="no-api-key"
                                :tinymce-script-src="tinymceScriptSrc"
                                v-model="docsData.theme"
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
                                <q-card-section v-html="docsData.theme" />
                            </q-card>
                        </div>
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
        <ConfirmDialog
            v-model="showRemovePopup"
            text="После подтверждения действия, данные будут безвозвратно удалены.
                    Действительно удалить все данные по документу?"
            @update:modelValue="removeDoc"
            @close="showRemovePopup = false"
        />
        <!-- <q-dialog v-model="showRemovePopup">
            <q-card class="edit-doc__dialog">
                <q-card-section class="q-pt-xl">
                    <p class="text text-red">Действительно удалить все данные по документу? </p>
                    <q-btn flat no-caps icon="close" class="edit-doc__close-icon" v-close-popup />
                    <q-btn
                        color="red"
                        icon="delete"
                        label="Да, удалить"
                        @click="removeDoc"/>
                </q-card-section>
            </q-card>
        </q-dialog> -->
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

export default {
    components:{
        Editor,
        ConfirmDialog,
    },
    setup () {
        const disableEditButton = ref(true);
        const showRemovePopup = ref(false);
        const router = useRouter();
        const route = useRoute();
        let now = DateTime.now().toString();
        let updatedDate = DateTime.fromISO(now, { locale: "ru" });
        const docsData = ref({
            title: '',
            theme: '',
            updated: ''
        });
        const docsDataLock = ref({
            title: '',
            theme: '',
            updated: ''
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
        const DOCS = gql`
            query findOne($id: Int!) {
                doc(id: $id) {
                    id
                    title
                    theme
                }
            }
        `;
        const { result, loading, error, refetch } = useQuery(DOCS, () => ({
            id: Number(route.params.id),
        }));
        const docs = computed(() => result ?? []);
        const { mutate: editDoc, onDone } = useMutation(gql`
            mutation updateDoc(
                $id: Int!,
                $title: String!,
                $theme: String!,
                $updated: String!,
            ){
                updateDoc(updateDocInput: {
                    id: $id,
                    title: $title,
                    theme: $theme,
                    updated: $updated,
                }) {
                        id
                        title
                        theme
                    }
                }
            `, () => ({
                    variables: {
                        id: Number(route.params.id),
                        title: docsData.value.title,
                        theme: docsData.value.theme,
                        updated: updatedDate.toFormat("dd MMMM yyyy hh:mm"),
                    },
                })
        );
        const { mutate: removeDoc, onDone: onDoneremoveDoc } = useMutation(gql`
            mutation removeAll($id: Int!){
                removeDoc(id: $id) {
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
                name: "docs",
            });
        })

        onDoneremoveDoc(() => {
            router.push({
                name: "docs",
            });
        })

        onMounted(async () => {
            const refetchQuery = await refetch();
            if(refetchQuery.data.doc) {
                docsData.value.id = refetchQuery.data.doc.id;
                docsData.value.title = refetchQuery.data.doc.title;
                docsData.value.theme = refetchQuery.data.doc.theme;

                docsDataLock.value.id = refetchQuery.data.doc.id;
                docsDataLock.value.title = refetchQuery.data.doc.title;
                docsDataLock.value.theme = refetchQuery.data.doc.theme;
            }
        });

        function upplyRemoveDoc() {
            showRemovePopup.value = true;
        }

        watch(
            () => docsData.value,
            (v) => {
                if(JSON.stringify(v) !== JSON.stringify(docsDataLock.value)) {
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
            editDoc,
            docsData,
            onDone,
            result,
            loading,
            refetch,
            router,
            route,
            docs,
            upplyRemoveDoc,
            disableEditButton,
            showRemovePopup,
            onDoneremoveDoc,
            removeDoc,
            tinymceScriptSrc,
            plugins,
            fileUpload,
            updatedDate,
            disableSaveBtn,
            docsDataLock,
        }
    },
}
</script>

<!-- <style scoped lang="scss">
.edit-doc {
    &__dialog {
        position: relative;
    }
    &__close-icon {
        position: absolute;
        top: 10px;
        right: 6px;
    }
}
</style> -->

<style scoped lang="scss">
.edit-doc {
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
