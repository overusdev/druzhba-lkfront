<template>
    <div class="q-pa-md">
        <q-layout view="lHh lpr lFf" container style="min-height: 800px" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-black">
                <q-toolbar>
                    <router-link to="/ads">
                        <q-btn flat round dense text-color="black" icon="arrow_back" />
                    </router-link>
                    <q-toolbar-title>Редактироване объявления {{ adData.id }}</q-toolbar-title>
                    <q-btn
                        color="secondary"
                        label="Сохранить данные"
                        @click="editAdd"/>
                </q-toolbar>
            </q-header>
            <q-page-container>
                <q-page class="q-pa-md">
                    <div class="q-pa-md q-pt-lg" style="max-width: 800px">
                        <q-input v-model="adData.name" label="Заголовок" class="q-mb-lg"/>
                        
                        <div class="q-mb-lg">
                            <p class="text">Описание</p>
                            <q-editor
                                v-model="adData.theme"
                                min-height="5rem"
                                @paste.native="evt => pasteCapture(evt)"
                                @drop.native="evt => dropCapture(evt)"
                            />
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
import { computed, reactive, onMounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

export default {
  setup () {
    const router = useRouter();
    const route = useRoute();
    const adData = reactive({
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
    const { result, loading, error, refetch } = useQuery(ADS, () => ({
        id: Number(route.params.id),
    }));
    const ads = computed(() => result ?? []);
    const { mutate: editAdd, onDone } = useMutation(gql`
        mutation updateAds(
            $id: Int!,
            $name: String!,
            $theme: String!,
        ){
            updateAds(updateAdInput: {
                id: $id,
                name: $name,
                theme: $theme,
            }) {
                    id
                    name
                    theme
                }
            }
        `, () => ({
                variables: {
                    id: Number(route.params.id),
                    name: adData.name,
                    theme: adData.theme,
                },
            })
    );

    function pasteCapture(e) {
        console.log(e);
    }
    function dropCapture(e) {
        console.log(e);
    }

    onDone(() => {
        router.push({
            name: "ads",
        });
    })

    onMounted(async () => {
        const refetchQuery = await refetch();
        if(refetchQuery.data.ad) {
            adData.id = refetchQuery.data.ad.id;
            adData.name = refetchQuery.data.ad.name;
            adData.theme = refetchQuery.data.ad.theme;
        }
    });

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
            pasteCapture,
            dropCapture,
        }
    },
}
</script>
