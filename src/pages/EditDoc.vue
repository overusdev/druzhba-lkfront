<template>
    <div class="edit-doc q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/docs">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <q-toolbar-title>Редактироване документа {{ docsData.id }}</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="editDoc"/>
                    <q-btn
                        class="q-ml-sm"
                        color="red"
                        icon="delete"
                        @click="upplyRemoveDoc"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <div class="q-pa-md q-pt-lg" style="max-width: 1000px">
                        <q-input v-model="docsData.title" label="Заголовок" class="q-mb-lg"/>
                        
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
        <q-dialog v-model="showRemovePopup">
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
        </q-dialog>
    </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import Editor from '@tinymce/tinymce-vue';

export default {
    components:{
        Editor,
    },
    setup () {
        const disableEditButton = ref(true);
        const showRemovePopup = ref(false);
        const router = useRouter();
        const route = useRoute();
        let now = DateTime.now().toString();
        let updatedDate = DateTime.fromISO(now, { locale: "ru" });
        const docsData = reactive({
            title: '',
            theme: '',
            updated: ''
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
                        title: docsData.title,
                        theme: docsData.theme,
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
                docsData.id = refetchQuery.data.doc.id;
                docsData.title = refetchQuery.data.doc.title;
                docsData.theme = refetchQuery.data.doc.theme;
            }
        });

        function upplyRemoveDoc() {
            showRemovePopup.value = true;
        }

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
        }
    },
}
</script>

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
}
</style>
