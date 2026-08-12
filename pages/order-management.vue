<script setup>
import { useCartStore } from '/composables/cartData'

definePageMeta({
  middleware: ['shop-owner-add'],
})

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

function isWeightBased(unit) {
  if (!unit) return false;
  return /(\bkg\b|\bg\b|\blb\b|\boz\b|kilo|gram|pound|ounce)/i.test(String(unit));
}

const countryTimeZones = {
  AED: 'Asia/Dubai',
  INR: 'Asia/Kolkata',
  SAR: 'Asia/Riyadh',
  QAR: 'Asia/Qatar',
  BHR: 'Asia/Bahrain',
  BD: 'Asia/Bahrain',
}

const filterStatus = ref('all')
const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') return fetchedOrderData.value
  return fetchedOrderData.value.filter(order => order.status === filterStatus.value)
})

const pendingCount = computed(() => fetchedOrderData.value.filter(o => o.status !== 'deliverd').length)
const deliveredCount = computed(() => fetchedOrderData.value.filter(o => o.status === 'deliverd').length)

function onShopChange(id) {
  shopId.value = id
  const shop = fetchedShopData.value.find(s => s.id === id)
  countryCode.value = shop?.currency || null
  cartStore.setCurrency(shop?.currency)
  filterStatus.value = 'all'
  fetchOrder(id)
}

function fetchShopList() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/shop/list?from=thasweel`, {
    headers: { Authorization: `Bearer ${token.value}` },
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
      toast.add({ title: msg, color: 'red', icon: 'i-heroicons-x-circle' })
      loading.value = false
    })
}

function fetchOrder(id) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/order-list?shop_id=${id}`, {
    headers: { Authorization: `Bearer ${token.value}` },
    method: 'GET',
  })
    .then((response) => {
      fetchedOrderData.value = response.data
    })
    .catch((err) => {
      const msg = err?.data?.message || err?.message || 'Failed to load orders.'
      fetchError.value = msg
      toast.add({ title: msg, color: 'red', icon: 'i-heroicons-x-circle' })
    })
    .finally(() => {
      loading.value = false
    })
}

function DeliverNow(id, shop_id) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/deliverd`, {
    headers: { Authorization: `Bearer ${token.value}`, accept: 'application/json' },
    body: { order_id: id },
    method: 'POST',
  })
    .then(() => { fetchOrder(shop_id) })
    .catch((err) => {
      const msg = err?.data?.response || err?.data?.message || err?.message || 'Failed to update order.'
      toast.add({ title: msg, color: 'red', icon: 'i-heroicons-x-circle' })
    })
    .finally(() => { loading.value = false })
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'Not specified') return null
  const normalized = String(dateStr).replace(/(\.\d{3})\d+/, '$1')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}
function isValidDate(dateStr) { return parseDate(dateStr) !== null }
function formatVisibleDate(dateStr, country) {
  const date = parseDate(dateStr)
  if (!date) return null
  
  const now = new Date()
  
  // 1. Get the target timezone immediately
  const timeZone = countryTimeZones[country] || 'UTC'

  // 2. Format short comparison strings using the target timezone 
  // (Prevents local midnight differences from breaking the "Today" match)
  const todayTargetStr = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone }).format(now)
  const dateTargetStr = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone }).format(date)

  // 3. If it's today in the target timezone, apply target timezone to the clock time
  if (dateTargetStr === todayTargetStr) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone })}`
  }

  // 4. Otherwise, format the full date using the target timezone
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone }).format(date)
  }
  catch {
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
  }
}

onMounted(() => { fetchShopList() })
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-container px-4 py-5 flex items-center gap-3">
        <NuxtLink to="/shop-management" class="text-gray-400 hover:text-primary transition-colors">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 font-[poppins]">
            Order Management
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Track and manage all incoming orders
          </p>
        </div>
      </div>
    </div>

    <div class="max-container px-4 py-8">

      <!-- Loading -->
      <div v-if="loading" class="h-60 flex items-center justify-center">
        <Icon name="i-mingcute-loading-line" class="animate-spin text-[45px] text-primary" />
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="flex flex-col items-center justify-center py-20 gap-3">
        <Icon name="i-heroicons-exclamation-triangle" class="text-5xl text-red-400" />
        <p class="text-gray-500 text-center">{{ fetchError }}</p>
        <UButton size="md" @click="fetchShopList()">Retry</UButton>
      </div>

      <!-- Main Content -->
      <div v-else>

        <!-- Shop Switcher (if multiple shops) -->
        <div v-if="fetchedShopData.length > 1" class="mb-6">
          <label class="block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Shop</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="shop in fetchedShopData"
              :key="shop.id"
              @click="onShopChange(shop.id)"
              :class="[
                'px-4 py-2 rounded-lg border text-sm font-semibold transition-all',
                shopId === shop.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50',
              ]"
            >
              {{ shop.name }}
            </button>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
            <p class="text-3xl font-black text-gray-900">{{ fetchedOrderData.length }}</p>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Total</p>
          </div>
          <div class="bg-amber-50 rounded-xl border border-amber-100 p-4 flex flex-col items-center">
            <p class="text-3xl font-black text-amber-600">{{ pendingCount }}</p>
            <p class="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-1">Pending</p>
          </div>
          <div class="bg-green-50 rounded-xl border border-green-100 p-4 flex flex-col items-center">
            <p class="text-3xl font-black text-green-600">{{ deliveredCount }}</p>
            <p class="text-xs font-semibold text-green-400 uppercase tracking-widest mt-1">Delivered</p>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-5 flex gap-2 bg-white p-1 rounded-lg border border-gray-200 w-fit">
          <button
            v-for="status in ['all', 'pending', 'deliverd']"
            :key="status"
            @click="filterStatus = status"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-all capitalize',
              filterStatus === status ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100',
            ]"
          >
            {{ status === 'deliverd' ? 'Delivered' : status.charAt(0).toUpperCase() + status.slice(1) }}
          </button>
        </div>

        <!-- Order Cards -->
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
                </div>

                <div class="text-gray-700">
                  <p class="font-medium text-lg">{{ order.user_name }}</p>
                  <p class="flex items-center gap-1 text-sm">
                    <Icon name="lucide:phone" class="w-3 h-3" /> {{ order.user_phone_number }}
                  </p>
                  <p class="flex items-center gap-1 text-sm">
                    <Icon name="lucide:map-pin" class="w-3 h-3" /> {{ order.address }}
                  </p>
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
              <div v-for="item in order.items" :key="item.id" class="flex flex-col py-2 border-b border-gray-200 last:border-0 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 font-medium">
                    <span class="font-bold text-gray-900">{{ item.quantity }}x</span> {{ item.name }}
                    <span v-if="item.unit" class="text-xs text-gray-500 font-normal">({{ item.unit }})</span>
                  </span>
                  <span class="font-mono font-medium">{{ item.totalPrice }} {{ cartStore.getCurrency }}</span>
                </div>
                
                <!-- Homebaker Preparation Badge (Weight-based items only) -->
                <div v-if="(item.quantity > 1 || item.preparation_preference) && isWeightBased(item.unit)" class="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span
                    v-if="item.preparation_preference === 'single_combined'"
                    class="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full"
                  >
                    <Icon name="lucide:package-check" class="w-3 h-3" />
                    PREFERENCE: 1 Single Combined Piece (Total Weight)
                  </span>
                  <span
                    v-else-if="item.preparation_preference === 'separate' || item.quantity > 1"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full"
                  >
                    <Icon name="lucide:layers" class="w-3 h-3" />
                    PREFERENCE: {{ item.quantity }} Separate Items ({{ item.unit || '1 pc' }} each)
                  </span>
                  <span v-if="item.item_note" class="text-xs italic text-gray-500">
                    "{{ item.item_note }}"
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredOrders.length === 0" class="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Icon name="lucide:package-open" class="text-5xl text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">No {{ filterStatus === 'deliverd' ? 'delivered' : filterStatus }} orders found.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
