<template>
    <div class="q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/users">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <q-toolbar-title>Редактирование данных</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Обновить данные"
                        @click="editContactsData"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <div class="q-pa-md q-pt-lg" style="max-width: 1000px">
                        <div class="q-mb-lg">
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
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { computed, reactive, onMounted } from 'vue';
import gql from 'graphql-tag';
import { DateTime } from "luxon";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import Editor from '@tinymce/tinymce-vue';

export default {
  components:{
    Editor,
  },
  setup () {
    let now = DateTime.now().toString();
    let updatedDate = DateTime.fromISO(now, { locale: "ru" });
    const router = useRouter();
    const route = useRoute();
    const contactsData = reactive({
        updated: '',
        theme: '',
    });
    const CONTACTS = gql`
        query findOne($id: Int!) {
            contact(id: $id) {
                id
                theme
            }
        }
    `;
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
    const { result, loading, error, refetch } = useQuery(CONTACTS, () => ({
        id: 1,
    }));
    const contacts = computed(() => result ?? []);
    const { mutate: editContactsData, onDone } = useMutation(gql`
        mutation updateContacts(
            $id: Int!,
            $updated: String!,
            $theme: String!,
        ){
            updateContact(updateContactInput: {
                id: $id,
                updated: $updated,
                theme: $theme,
            }) {
                    id
                    updated
                    theme
                }
            }
        `, () => ({
                variables: {
                    id: 1,
                    updated: updatedDate.toFormat("dd MMMM yyyy"),
                    theme: contactsData.theme,
                },
            })
    );

    async function fileUpload(blobInfo) {
        console.log('blobInfo', blobInfo);
    }

    onDone(() => {
        router.push({
            name: "completed-contacts-page",
        });
    })

    onMounted(async () => {
        const refetchQuery = await refetch();
        if(refetchQuery.data.contact) {
            contactsData.id = refetchQuery.data.contact.id;
            contactsData.theme = refetchQuery.data.contact.theme;
        }
    });

        return {
            editContactsData,
            contactsData,
            onDone,
            result,
            loading,
            refetch,
            router,
            route,
            contacts,
            tinymceScriptSrc,
            plugins,
            fileUpload,
        }
    },
}
</script>
