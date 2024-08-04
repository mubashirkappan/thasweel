<script setup>
definePageMeta({
  middleware: ['shop-owner-add'],
})

const authStatus = useAuth()
const { token } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(true)
const toast = useToast()
const fetchedUserData = ref([])
const fetchedShopData = ref([])
const opened = ref(false)
const openEdit = ref(false)
const data = ref([])

function fetchData() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/get-user`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      fetchedUserData.value = response.data
    })
    .catch(({ data }) => {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      fetchShopList()
      loading.value = false
    })
}
function fetchShopList() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/shop/list`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      fetchedShopData.value = response.data
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
  $fetch(`${config.public.apiBaseUrl}/shop/delete/${value}`, {
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
      fetchShopList()
      loading.value = false
    })
}
function editItem(obj) {
  // console.log(obj);
  data.value = obj
  openEdit.value = true
}
function openModal() {
  data.value = {}
  opened.value = true
}
onMounted(() => {
  fetchData()
  fetchShopList()
})
</script>

<template>
  <div class="main-container">
    <div class="max-container">
      <div class="font-[poppins] text-2xl md:text-[40px] font-semibold pt-3 ">
        Shop Management
      </div>
    </div>
  </div>
  <div class="main-container py-10">
    <div class="max-container">
      <div class="py-5 flex flex-col items-center justify-center gap-3">
        <img src="/img/avtr.png" alt="">
        <div v-if="fetchedUserData" class="text-2xl font-bold">
          <div v-if="fetchedUserData.name">
            {{ fetchedUserData.name }}
          </div>
          <div v-else-if="fetchedUserData.email">
            {{ fetchedUserData.email }}
          </div>
          <div v-else>
            {{ fetchedUserData.phonenumber }}
          </div>
        </div>
      </div>
      <div v-if="loading" class="h-20 flex items-center justify-center">
        <Icon
          name="i-mingcute-loading-line"
          class="animate-spin text-[45px] text-primary"
        />
      </div>
      <div v-else-if="fetchedShopData.length !== 0" class="flex items-center justify-center flex-col w-full gap-5 ">
        <div class="text-2xl font-bold">
          Shops Under you
        </div>
        <div v-for="items in fetchedShopData" :key="items.slug" class="w-full border px-3 py-5 gap-2 items-center border-black/50 rounded-md  grid md:grid-cols-12">
          <NuxtLink :to="`shop-management/${items.slug}`" class=" flex justify-between max-md:flex-col max-md:items-center md:col-span-10">
            <div v-if="items.name" class="text-primary font-bold text-xl">
              {{ items.name }}
            </div>
            <div v-if="items.email">
              {{ items.email }}
            </div>
            <div v-if="items.phone">
              {{ items.phone }}
            </div>
          </NuxtLink>
          <div class="max-md:flex-col w-full gap-2 md:col-span-2 flex items-center justify-center">
            <!-- <UButton size="xl" variant="solid" class="bg-red-500 hover:bg-red-500/80" @click="deleteItem(items.encrypt_id)">
              <Icon name="i-heroicons-trash" />
            </UButton> -->
            <UButton size="xl" variant="solid" class="bg-primary hover:bg-primary/80" @click="editItem(items)">
              <Icon name="i-heroicons-pencil-square" />
            </UButton>
          </div>
        </div>
        <!-- <UButton size="xl" class=" text-lg mt-3 my-auto" @click="openModal()">
          Add more
        </UButton> -->
      </div>
      <div v-else class="flex flex-col items-center justify-center gap-3">
        <div
          class=" bg-white flex items-center justify-center font-medium text-2xl"
        >
          <Icon name="i-mdi-error" class="text-primary" />
          No Shops Found
        </div>
        <UButton size="xl" class=" text-lg mt-3 my-auto" @click="openModal()">
          You can add from Here
        </UButton>
      </div>
      <ModalShopAddition v-model="opened" @submit-success="fetchShopList" />
      <ModalShopEdit v-model="openEdit" :data="data" @submit-success="fetchShopList" />
    </div>
  </div>
</template>
