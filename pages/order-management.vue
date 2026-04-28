<script setup>
import { useCartStore } from '/composables/cartData'

const cartStore = useCartStore()
const authStatus = useAuth()
const loading = ref(true)
const fetchError = ref(null)
const config = useRuntimeConfig()
const { token } = storeToRefs(authStatus)
const toast = useToast()
const fetchedShopData = ref([])
const fetchedOrderData = ref([])
const countryCode = ref(null)
const shopId = ref(null)

const countryTimeZones = {
  AED: 'Asia/Dubai', // Dubai
  INR: 'Asia/Kolkata', // India
  SAR: 'Asia/Riyadh', // Saudi Arabia
  QAR: 'Asia/Qatar', // Qatar
  BHR: 'Asia/Bahrain', // Bahrain
}
function formatDateToCountryTimeZone(date, country) {
  const timeZone = countryTimeZones[country] || 'UTC' // Fallback to UTC if country not found
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(date))
}
const filterStatus = ref('all')
const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') return fetchedOrderData.value
  return fetchedOrderData.value.filter(order => order.status === filterStatus.value)
})
function fetchShopList() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/shop/list?from=thasweel`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      fetchedShopData.value = response.data
      shopId.value = fetchedShopData.value[0]?.id
      countryCode.value = fetchedShopData.value[0]?.currency
      cartStore.setCurrency(fetchedShopData.value[0]?.currency)
      if (shopId.value)
        fetchOrder(shopId.value)
      else
        loading.value = false
    })
    .catch((err) => {
      const msg = err?.data?.message || err?.message || 'Failed to load shops.'
      fetchError.value = msg
      toast.add({
        title: msg,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
      loading.value = false
    })
}

function fetchOrder(id) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/order-list?shop_id=${id}`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      fetchedOrderData.value = response.data
    })
    .catch((err) => {
      const msg = err?.data?.message || err?.message || 'Failed to load orders.'
      fetchError.value = msg
      toast.add({
        title: msg,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function DeliverNow(id, shop_id) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/deliverd`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
      accept: 'application/json',
    },
    body: {
      order_id: id,
    },
    method: 'POST',
  })
    .then((response) => {
      fetchOrder(shop_id)
    })
    .catch((err) => {
      const msg = err?.data?.response || err?.data?.message || err?.message || 'Failed to update order.'
      toast.add({
        title: msg,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      loading.value = false
    })
}
function isValidDate(dateStr) {
  if (!dateStr || dateStr === 'Not specified') return false
  const d = new Date(dateStr)
  return !isNaN(d.getTime())
}
function formatVisibleDate(dateStr, country) {
  if (!isValidDate(dateStr)) return null

  const date = new Date(dateStr)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
  }

  const timeZone = countryTimeZones[country] || 'UTC'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(date)
}

onMounted(() => {
  fetchShopList()
})
</script>

<template>
  <div class="main-container py-10 bg-gray-50 min-h-screen">
    <div class="max-container">

      <!-- Loading spinner -->
      <div v-if="loading" class="h-60 flex items-center justify-center">
        <Icon name="i-mingcute-loading-line" class="animate-spin text-[45px] text-primary" />
      </div>

      <!-- Error state -->
      <div v-else-if="fetchError" class="flex flex-col items-center justify-center py-20 gap-3">
        <Icon name="i-heroicons-exclamation-triangle" class="text-5xl text-red-400" />
        <p class="text-gray-500 text-center">{{ fetchError }}</p>
        <UButton size="md" @click="fetchShopList()">Retry</UButton>
      </div>

      <!-- Main content -->
      <div v-else>
        <div class="mb-6 flex gap-2 bg-white p-1 rounded-lg border border-gray-200 w-fit">
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

        <div class="space-y-4">
        <div
          v-for="(order, index) in filteredOrders"
          :key="order.id"
          class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <div class="flex items-baseline gap-2">
                <h3 class="text-xl font-bold text-gray-900">
                  Order #{{ filteredOrders.length - index }}
                </h3>
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
                    {{ formatVisibleDate(order.delivery_time, countryCode) }}
                  </div>
                </div>
              
                <div class="text-xs text-gray-400 flex items-center gap-1">
                  <Icon name="lucide:clock" class="w-3 h-3" />
                  <span>Placed: {{ formatVisibleDate(order.created_at, countryCode) }}</span>
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
                  <UButton
                    color="primary"
                    variant="solid"
                    size="md"
                    class="mt-2"
                    @click="DeliverNow(order.id, order.shop_id)"
                  >
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

          <div v-if="filteredOrders.length === 0" class="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Icon name="lucide:package-open" class="text-5xl text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">No {{ filterStatus }} orders found.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
