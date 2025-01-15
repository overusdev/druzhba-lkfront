<template>
    <div class="edit-ad q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/ads">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <div class="edit-ad__toolbar-title">
                        Редактирование объявления
                        <a :href="link" rel="noopener noreferrer" target="_blank" class="edit-ad__toolbar-link">
                            https://www.druzba-nn.ru/ads/{{ adData.id }}
                        </a>
                    </div>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-lg">
                    <div
                        class="edit-ad__save-button"
                        :class="{'edit-ad__save-button--disabled': !disableSaveBtn }"
                        @click="editAdd"
                    >
                        Сохранить данные
                    </div>
                    <div class="q-pt-lg" style="max-width: 1000px">
                        <q-input v-model="adData.name" label="Заголовок" class="q-mb-lg" />

                        <div class="q-mb-lg">
                            <Editor api-key="no-api-key" :tinymce-script-src="tinymceScriptSrc" v-model="adData.theme"
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
                                }" initial-value="" />
                        </div>
                        <div class="q-mb-lg">
                            <p class="text">Предпросмотр</p>
                            <q-card flat bordered>
                                <q-card-section v-html="adData.theme" />
                            </q-card>
                        </div>
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import Editor from '@tinymce/tinymce-vue';
import { DateTime } from "luxon";

export default {
    components: {
        Editor,
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const disableSaveBtn = ref(false);
        let now = DateTime.now().toString();
        let updatedDate = DateTime.fromISO(now, { locale: "ru" });
        const adData = ref({
            name: '',
            theme: '',
        });
        const adDataLock = ref({
            name: '',
            theme: '',
        });
        const ADS = gql`
        query findOne($id: Int!) {
            ad(id: $id) {
                id
                name
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
        const { result, loading, error, refetch } = useQuery(ADS, () => ({
            id: Number(route.params.id),
        }));
        const ads = computed(() => result ?? []);
        const { mutate: editAdd, onDone } = useMutation(gql`
        mutation updateAds(
            $id: Int!,
            $name: String!,
            $theme: String!,
            $updated: String!,
        ){
            updateAds(updateAdInput: {
                id: $id,
                name: $name,
                theme: $theme,
                updated: $updated,
            }) {
                    id
                    name
                    theme
                }
            }
        `, () => ({
            variables: {
                id: Number(route.params.id),
                name: adData.value.name,
                theme: adData.value.theme,
                updated: updatedDate.toFormat("dd MMMM yyyy hh:mm"),
            },
        })
        );

        async function fileUpload(blobInfo) {
            console.log('blobInfo', blobInfo);
        }

        onDone(() => {
            router.push({
                name: "ads",
            });
        })

        onMounted(async () => {
            const refetchQuery = await refetch();
            if (refetchQuery.data.ad) {
                adData.value.id = refetchQuery.data.ad.id;
                adData.value.name = refetchQuery.data.ad.name;
                adData.value.theme = refetchQuery.data.ad.theme;
                adDataLock.value.id = refetchQuery.data.ad.id;
                adDataLock.value.name = refetchQuery.data.ad.name;
                adDataLock.value.theme = refetchQuery.data.ad.theme;
            }
        });

        watch(
            () => adData.value,
            (v) => {
                if(JSON.stringify(v) !== JSON.stringify(adDataLock.value)) {
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
            editAdd,
            adData,
            onDone,
            result,
            loading,
            refetch,
            router,
            route,
            ads,
            tinymceScriptSrc,
            plugins,
            fileUpload,
            disableSaveBtn,
            adDataLock,
        }
    },
}
</script>

<style scoped lang="scss">
.edit-ad {
    &__save-button {
        display: inline-block;
        padding: 12px;
        border: 3px solid #3794ae;
        background: #f0f9ff;
        border-radius: 8px;
        margin-bottom: 16px;

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
