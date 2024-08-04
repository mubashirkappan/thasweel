<script setup>
import { storeToRefs } from 'pinia'
import { data } from '~/data/shops'

definePageMeta({
  middleware: ['shop-owner-add'],
})
const route = useRoute()
const shop = ref(route.params.name)
const authStatus = useAuth()
const { token } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(true)
const toast = useToast()
const fetchedCategories = ref([])
const fetchedShopData = ref([])
const fetchedImages = ref([])
const fetchedItems = ref([])
const opened = ref(false)
const openItem = ref(false)
const openOffer = ref(false)
const openEditModal = ref(false)
const itemData = ref([])

function fetchData() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/shop/list`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    params: {
      shop: shop.value,
    },
    method: 'GET',
  })
    .then((response) => {
      fetchedShopData.value = Object.assign({}, ...response.data)
    })
    .catch(({ data }) => {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      fetchCategoryList()
      fetchItemsList()
      fetchImagesList()
    })
}
function fetchCategoryList() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/categories/list`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
      accept: 'application/json',
    },
    body: {
      shop_id: fetchedShopData.value.id,
    },
    method: 'POST',
  })
    .then((response) => {
      fetchedCategories.value = response.data
    })
    .catch(({ data }) => {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      loading.value = false
    })
}
function deleteCategory(value) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/categories/delete/${value}`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      toast.add({
        title: response.message,
        icon: 'i-heroicons-check-badge',
      })
    })
    .catch(({ data }) => {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      fetchCategoryList()
      loading.value = false
    })
}

function fetchImagesList() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/offer/inside-shop-list`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
      accept: 'application/json',
    },
    body: {
      shop_id: fetchedShopData.value.id,
    },
    method: 'POST',
  })
    .then((response) => {
      fetchedImages.value = response.data
    })
    .catch(({ data }) => {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function deleteBanner(value) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/offer/delete/${value}`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      toast.add({
        title: response.message,
        icon: 'i-heroicons-check-badge',
      })
    })
    .catch(({ data }) => {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      fetchImagesList()
      loading.value = false
    })
}

function fetchItemsList() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/items/list`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
      accept: 'application/json',
    },
    body: {
      shop_id: fetchedShopData.value.id,
    },
    method: 'POST',
  })
    .then((response) => {
      fetchedItems.value = response.data
    })
    .catch(({ data }) => {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function deleteItem(value) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/items/delete/${value}`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      toast.add({
        title: response.message,
        icon: 'i-heroicons-check-badge',
      })
    })
    .catch(({ data }) => {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      fetchItemsList()
      loading.value = false
    })
}
function checkCategory() {
  if (fetchedCategories.value.length === 0) {
    toast.add({
      title: 'Please add atleast One Category ',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  }
  else {
    openItem.value = true
  }
}

function countBanner() {
  if (fetchedImages.value.length >= 3) {
    toast.add({
      title: 'Cant add  more than 3',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  }
  else {
    openOffer.value = true
  }
}

function editItem(obj) {
  itemData.value = obj
  openEditModal.value = true
}
function openModal() {
  data.value = {}
  openItem.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div v-if="loading" class="h-40 flex items-center justify-center">
    <Icon
      name="i-mingcute-loading-line"
      class="animate-spin text-[45px] text-primary"
    />
  </div>
  <template v-else>
    <div class="main-container pt-2">
      <div class="max-container">
        <div class="font-[poppins] text-2xl leading-normal md:text-[40px] font-semibold pt-3 ">
          {{ fetchedShopData.name }}
        </div>
      </div>
    </div>

    <div class="main-container py-5">
      <div class="max-container">
        <div class="text-2xl font-bold">
          Categories
        </div>
        <div v-if="fetchedCategories.length !== 0" class="flex flex-col gap-3 py-2">
          <div class=" items-center justify-center flex-col w-full gap-5 grid grid-cols-2 md:grid-cols-6 ">
            <div v-for="item in fetchedCategories" :key="item?.name" class="w-full border p-2 gap-2 items-center border-black/50 rounded-md flex justify-between  ">
              <div class=" flex justify-between max-md:flex-col max-md:items-center">
                <div v-if="item.name" class=" text-xl truncate max-w-[120px]">
                  {{ item.name }}
                </div>
              </div>
              <UButton size="xl" variant="solid" class="bg-red-600 hover:bg-red-500" @click="deleteCategory(item.encrypted_id)">
                <Icon name="i-heroicons-trash" />
              </UButton>
            </div>
          </div>
          <UButton size="xl" class=" text-lg mt-3 mx-auto " @click="opened = true">
            Add more
          </UButton>
        </div>
        <div v-else class="flex flex-col items-center justify-center gap-3">
          <div
            class=" bg-white flex items-center justify-center font-medium text-2xl"
          >
            <Icon name="i-mdi-error" class="text-primary" />
            No Categories Found
          </div>
          <UButton size="xl" class=" text-lg mt-3 my-auto" @click="opened = true">
            You can add from Here
          </UButton>
        </div>
      </div>
    </div>
    <div class="main-container py-5">
      <div class="max-container">
        <div class="text-2xl font-bold">
          Items
        </div>
        <div v-if="fetchedItems.length !== 0" class="flex flex-col gap-3">
          <div class="  w-full gap-5 grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 justify-center ">
            <div v-for="item in fetchedItems " :key="item?.name" class="w-full border p-2 gap-2 items-center border-black/50 rounded-md flex flex-col max-w-[300px]">
              <div class="h-[calc(100%-80px)] flex-shrink-0 ">
                <img :src="item.image_name" class="object-cover rounded-md w-full h-full max-h-[200px] object-center" alt="">
              </div>

              <div class="flex flex-col gap-2 justify-start">
                <div v-if="item.name" class=" text-xl truncate max-w-[120px] h-full">
                  {{ item.name }}
                </div>
                <div class="flex gap-2 ">
                  <UButton size="xl" variant="solid" class="bg-red-600 hover:bg-red-500" @click="deleteItem(item.encrypted_id)">
                    <Icon name="i-heroicons-trash" />
                  </UButton>
                  <UButton size="xl" variant="solid" class="bg-primary hover:bg-primary/80" @click="editItem(item)">
                    <Icon name="i-heroicons-pencil-square" />
                  </UButton>
                </div>
              </div>
            </div>
          </div>
          <UButton size="xl" class=" text-lg mt-3 mx-auto " @click="openModal()">
            Add more
          </UButton>
        </div>
        <div v-else class="flex flex-col items-center justify-center gap-3">
          <div
            class=" bg-white flex items-center justify-center font-medium text-2xl"
          >
            <Icon name="i-mdi-error" class="text-primary" />
            No Items Found
          </div>
          <UButton size="xl" class=" text-lg mt-3 my-auto" @click="checkCategory">
            You can add from Here
          </UButton>
        </div>
      </div>
    </div>
    <div class="main-container py-5">
      <div class="max-container">
        <div class="text-2xl font-bold flex flex-col pb-3">
          Banners
          <span class="text-sm">
            <Icon name="i-heroicons-information-circle" />
            You can add Upto 3 offer banners
          </span>
        </div>
        <div v-if="fetchedImages.length !== 0" class="flex flex-col gap-3">
          <div class="  w-full gap-5 grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 justify-center ">
            <div v-for="item in fetchedImages " :key="item?.name" class="w-full border p-2 gap-2 items-center border-black/50 rounded-md flex flex-col max-w-[300px]">
              <div class="h-[calc(100%-40px)] flex-shrink-0 ">
                <img :src="item.image_url" class="object-cover rounded-md w-full h-full max-h-[200px] object-center" alt="">
              </div>

              <div class="flex flex-col gap-2 justify-start">
                <div class="flex gap-2 ">
                  <UButton size="xl" variant="solid" class="bg-red-600 hover:bg-red-500" @click="deleteBanner(item.id)">
                    <Icon name="i-heroicons-trash" />
                  </UButton>
                </div>
              </div>
            </div>
          </div>
          <UButton size="xl" class=" text-lg mt-3 mx-auto " @click="countBanner()">
            Add more
          </UButton>
        </div>
        <div v-else class="flex flex-col items-center justify-center gap-3">
          <div
            class=" bg-white flex items-center justify-center font-medium text-2xl"
          >
            <Icon name="i-mdi-error" class="text-primary" />
            No Items Found
          </div>
          <UButton size="xl" class=" text-lg mt-3 my-auto" @click="countBanner()">
            You can add from Here
          </UButton>
        </div>
      </div>
    </div>
  </template>
  <ModalCategoryAddition v-model="opened" :shop-id="fetchedShopData.id" @submit-success="fetchCategoryList" />
  <ModalBannerAddition v-model="openOffer" :shop-id="fetchedShopData.id" @submit-success="fetchImagesList" />
  <ModalItemAddition v-model="openItem" :category-list="fetchedCategories" :shop-id="fetchedShopData.id" @submit-success="fetchItemsList" />
  <ModalItemEdit v-model="openEditModal" :data="itemData" :category-list="fetchedCategories" :shop-id="fetchedShopData.id" @submit-success="fetchItemsList" />
</template>
