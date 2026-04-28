<script setup>
import { storeToRefs } from 'pinia'
import { data } from '~/data/shops'
import { useCartStore } from '/composables/cartData'

definePageMeta({
  middleware: ['shop-owner-add'],
})
const cartStore = useCartStore()
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
const fetchedOrderData = ref([])
const orderLoading = ref(false)
const opened = ref(false)
const openItem = ref(false)
const openOffer = ref(false)
const openEditModal = ref(false)
const itemData = ref([])

const countryTimeZones = {
  AED: 'Asia/Dubai',
  INR: 'Asia/Kolkata',
  SAR: 'Asia/Riyadh',
  QAR: 'Asia/Qatar',
  BHR: 'Asia/Bahrain',
}
const filterStatus = ref('all')
const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') return fetchedOrderData.value
  return fetchedOrderData.value.filter(order => order.status === filterStatus.value)
})
// Normalize 6-digit MySQL microseconds (e.g. .000000Z) → 3-digit JS milliseconds (.000Z)
// new Date() is spec-compliant only with 3 digits; production Node.js SSR rejects 6 digits
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'Not specified') return null
  const normalized = String(dateStr).replace(/(\.(\d{3}))\d+/, '$1')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}
function isValidDate(dateStr) {
  return parseDate(dateStr) !== null
}
function formatVisibleDate(dateStr, country) {
  const date = parseDate(dateStr)
  if (!date) return null
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
  }
  try {
    const timeZone = countryTimeZones[country] || 'UTC'
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone,
    }).format(date)
  }
  catch {
    // Fallback if timezone not in Node ICU data
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
  }
}

function fetchData() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/shop/list?from=thasweel`, {
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
      cartStore.setCurrency(fetchedShopData.value.currency)
    })
    .catch((err) => {
      toast.add({
        title: err?.data?.message || err?.message || 'Failed to load shop.',
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      fetchCategoryList()
      fetchItemsList()
      fetchImagesList()
      fetchOrders()
    })
}
function fetchOrders() {
  orderLoading.value = true
  $fetch(`${config.public.apiBaseUrl}/order-list?shop_id=${fetchedShopData.value.id}`, {
    headers: { Authorization: `Bearer ${token.value}` },
    method: 'GET',
  })
    .then((response) => {
      fetchedOrderData.value = response.data
    })
    .catch((err) => {
      toast.add({
        title: err?.data?.message || err?.message || 'Failed to load orders.',
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      orderLoading.value = false
    })
}
function DeliverNow(orderId) {
  orderLoading.value = true
  $fetch(`${config.public.apiBaseUrl}/deliverd`, {
    headers: { Authorization: `Bearer ${token.value}`, accept: 'application/json' },
    body: { order_id: orderId },
    method: 'POST',
  })
    .then(() => {
      fetchOrders()
    })
    .catch((err) => {
      toast.add({
        title: err?.data?.response || err?.data?.message || err?.message || 'Failed to update order.',
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
      orderLoading.value = false
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

function toggleVisibilityItem(value) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/items/status-change/${value}`, {
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
  if (fetchedImages.value.length >= 5) {
    toast.add({
      title: 'Cant add  more than 5',
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
        <div class="text-2xl font-bold pb-2">
          Items
        </div>
        <div v-if="fetchedItems.length !== 0" class="flex flex-col gap-3">
          <div class="  w-full gap-5 grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 justify-center ">
            <div v-for="item in fetchedItems " :key="item?.name" class="w-full border p-2 gap-2 items-center border-black/50 rounded-md flex flex-col max-w-[300px] relative" :class="{ 'after:bg-white after:absolute after:h-full after:w-full after:top-0 after:right-0 after:rounded-md after:opacity-80': !item.active }">
              <div class="h-[calc(100%-80px)] flex-shrink-0 ">
                <img :src="item.image_name" class="object-cover rounded-md w-full h-full max-h-[200px] object-center" alt="">
              </div>

              <div class="flex flex-col gap-2 justify-start">
                <div v-if="item.name" class=" text-xl truncate max-w-[120px] h-full">
                  {{ item.name }}
                </div>
                <div class="flex gap-2 ">
                  <UButton size="xl" variant="solid" class="bg-primary hover:bg-primary/80" @click="toggleVisibilityItem(item.encrypted_id)">
                    <Icon name="i-mdi-eye-off-outline" />
                  </UButton>
                  <UButton size="xl" variant="solid" class="bg-red-600 hover:bg-red-500" @click="deleteItem(item.encrypted_id)">
                    <Icon name="i-heroicons-trash" />
                  </UButton>
                  <UButton size="xl" variant="solid" class="bg-primary hover:bg-primary/80" @click="editItem(item)">
                    <Icon name="i-heroicons-pencil-square" />
                  </UButton>
                </div>
              </div>
              <UButton v-if="!item.active" size="xl" variant="solid" class="bg-primary hover:bg-primary/80 absolute z-10 left-1/2 top-1/2 -translate-x-[50%]  -translate-y-[50%]" @click="toggleVisibilityItem(item.encrypted_id)">
                <Icon name="i-mdi-eye-outline" />
              </UButton>
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

    <!-- Orders Section -->
    <div class="main-container py-5">
      <div class="max-container">
        <div class="text-2xl font-bold pb-4">
          Orders
        </div>

        <!-- Order loading -->
        <div v-if="orderLoading" class="h-20 flex items-center justify-center">
          <Icon name="i-mingcute-loading-line" class="animate-spin text-[40px] text-primary" />
        </div>

        <template v-else>
          <!-- Filter tabs -->
          <div class="mb-4 flex gap-2 bg-white p-1 rounded-lg border border-gray-200 w-fit">
            <button
              v-for="status in ['all', 'pending', 'deliverd']"
              :key="status"
              @click="filterStatus = status"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all capitalize',
                filterStatus === status ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              ]"
            >
              {{ status }}
            </button>
          </div>

          <!-- Order cards -->
          <div class="space-y-4">
            <div
              v-for="(order, index) in filteredOrders"
              :key="order.id"
              class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start">
                <div class="space-y-1">
                  <div class="flex items-baseline gap-2">
                    <h3 class="text-xl font-bold text-gray-900">Order #{{ filteredOrders.length - index }}</h3>
                    <span class="text-xs text-gray-400 font-mono">ID: {{ order.id }}</span>
                  </div>
                  <div class="text-gray-700">
                    <p class="font-medium text-lg">{{ order.user_name }}</p>
                    <p class="flex items-center gap-1 text-sm"><Icon name="lucide:phone" class="w-3 h-3" /> {{ order.user_phone_number }}</p>
                    <p class="flex items-center gap-1 text-sm"><Icon name="lucide:map-pin" class="w-3 h-3" /> {{ order.address }}</p>
                  </div>
                  <div class="mt-4 pt-4 border-t border-gray-50 flex flex-wrap items-center gap-4">
                    <div v-if="isValidDate(order.delivery_time)" class="flex items-center gap-2">
                      <span class="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Delivery</span>
                      <div class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 text-xs font-bold">
                        {{ formatVisibleDate(order.delivery_time, fetchedShopData.currency) }}
                      </div>
                    </div>
                    <div class="text-xs text-gray-400 flex items-center gap-1">
                      <Icon name="lucide:clock" class="w-3 h-3" />
                      <span>Placed: {{ formatVisibleDate(order.created_at, fetchedShopData.currency) }}</span>
                    </div>
                  </div>
                </div>

                <div class="text-right">
                  <p class="text-2xl font-black text-primary">
                    {{ order.total_price }} <span class="text-sm font-normal uppercase">{{ cartStore.getCurrency }}</span>
                  </p>
                  <div class="mt-3">
                    <div v-if="order.status === 'deliverd'" class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                      <Icon name="lucide:check-circle" />
                      Completed
                    </div>
                    <div v-else class="flex flex-col items-end gap-2">
                      <span class="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">
                        <Icon name="lucide:loader" class="animate-spin" />
                        Pending
                      </span>
                      <UButton color="primary" variant="solid" size="md" class="mt-2" @click="DeliverNow(order.id)">
                        Deliver Now
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Summary</h4>
                <div v-for="item in order.items" :key="item.id" class="flex justify-between py-1 border-b border-gray-200 last:border-0 text-sm">
                  <span class="text-gray-600">
                    <span class="font-bold text-gray-900">{{ item.quantity }}x</span> {{ item.name }}
                  </span>
                  <span class="font-mono font-medium">{{ item.totalPrice }} {{ cartStore.getCurrency }}</span>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="filteredOrders.length === 0" class="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Icon name="lucide:package-open" class="text-5xl text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">No {{ filterStatus }} orders found.</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </template>
  <ModalCategoryAddition v-model="opened" :shop-id="fetchedShopData.id" @submit-success="fetchCategoryList" />
  <ModalBannerAddition v-model="openOffer" :shop-id="fetchedShopData.id" @submit-success="fetchImagesList" />
  <ModalItemAddition v-model="openItem" :category-list="fetchedCategories" :shop-id="fetchedShopData.id" @submit-success="fetchItemsList" />
  <ModalItemEdit v-model="openEditModal" :data="itemData" :category-list="fetchedCategories" :shop-id="fetchedShopData.id" @submit-success="fetchItemsList" />
</template>
