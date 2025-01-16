<template>
    <div class="edit-contacts q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/users">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <div class="edit-contacts__toolbar-title">
                        Редактирование  раздела 
                        <a :href="link" rel="noopener noreferrer" target="_blank" class="edit-contacts__toolbar-link">
                            https://www.druzba-nn.ru/contacts
                        </a>
                    </div>
                    <!-- <q-toolbar-title>Редактирование данных</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Обновить данные"
                        @click="editContactsData"/> -->
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-lg">
                    <div class="edit-contacts__action-panel">
                        <div
                            class="edit-contacts__save-button"
                            :class="{'edit-contacts__save-button--disabled': !disableSaveBtn }"
                            @click="editContactsData"
                        >
                            Сохранить данные
                        </div>
                    </div>
                    <div class="q-pt-lg" style="max-width: 1000px">
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
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { ref, watch, computed, reactive, onMounted } from 'vue';
import gql from 'graphql-tag';
import { DateTime } from "luxon";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import Editor from '@tinymce/tinymce-vue';
import NoteBlock from '../components/NoteBlock.vue';

export default {
    components:{
        Editor,
        NoteBlock,
    },
    setup () {
        let now = DateTime.now().toString();
        let updatedDate = DateTime.fromISO(now, { locale: "ru" });
        const router = useRouter();
        const route = useRoute();
        const contactsData = ref({
            updated: '',
            theme: '',
        });
        const contactsDataLock = ref({
            updated: '',
            theme: '',
        });
        const disableSaveBtn = ref(false);
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
                        updated: updatedDate.toFormat("dd MMMM yyyy hh:mm"),
                        theme: contactsData.value.theme,
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
                contactsData.value.theme = refetchQuery.data.contact.theme;

                contactsDataLock.value.theme = refetchQuery.data.contact.theme;
            }
        });

        watch(
            () => contactsData.value,
            (v) => {
                if(contactsData.value.theme !== contactsDataLock.value.theme) {
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
            contactsDataLock,
            disableSaveBtn,
        }
    },
}
</script>


<style scoped lang="scss">
.edit-contacts {
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

