<script setup>
import { useCartStore } from '/composables/cartData'

const cartStore = useCartStore()
const authStatus = useAuth()
const loading = ref(true)
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
      shopId.value = fetchedShopData.value[0].id
      countryCode.value = fetchedShopData.value[0].currency
      cartStore.setCurrency(fetchedShopData.value[0].currency)
      if (shopId.value)
        fetchOrder(shopId.value)
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
    .catch(({ data }) => {
      toast.add({
        title: data.response,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      loading.value = false
    })
}
function formatVisibleDate(dateStr, country) {
  if (!dateStr) return null;
  
  const date = new Date(dateStr);
  const now = new Date();
  
  // Basic formatting options
  const options = {
    day: 'numeric',
    month: 'short', // "Jan", "Feb", etc.
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  }

  const timeZone = countryTimeZones[country] || 'UTC';
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone }).format(date);
}

onMounted(() => {
  fetchShopList()
})
</script>

<template>
  <div class="main-container py-10">
    <div class="max-container">
      <div v-if="!loading" class="space-y-4">
        <div
          v-for="(order, index) in fetchedOrderData"
          :key="order.id"
          class="border border-gray-300 rounded-lg p-4 shadow-sm"
        >
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold">
                Order #{{ index + 1 }}
              </h3>
              <p class="text-gray-600">
                {{ order.user_name }}
              </p>
              <p class="text-gray-600">
                Phone: {{ order.user_phone_number }}
              </p>
              <p class="text-gray-600">
                Address: {{ order.address }}
              </p>
              <div class="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
                
                <div v-if="order.delivery_time" class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase text-gray-400 tracking-wider">Estimated Delivery</span>
                  <div class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 flex items-center gap-1 text-sm font-semibold">
                    <Icon name="lucide:truck" class="w-4 h-4" />
                    {{ formatVisibleDate(order.delivery_time, countryCode) }}
                  </div>
                </div>
              
                <div class="text-sm text-gray-500 flex items-center gap-1">
                  <Icon name="lucide:calendar" class="w-4 h-4" />
                  <span>Ordered: {{ formatVisibleDate(order.created_at, countryCode) }}</span>
                </div>
              
              </div>
            </div>
            <div>
              <p class="text-lg font-semibold text-blue-600">
                {{ order.total_price }} {{ cartStore.getCurrency }}
              </p>
              <div v-if="order.status === 'deliverd'" class="text-green-500">
                Completed
              </div>
              <div v-else class="text-red-500">
                Pending
                <UButton
                  :loading="loading"
                  size="sm"
                  @click="DeliverNow(order.id, order.shop_id)"
                >
                  <Icon name="lucide:shopping-cart" />
                  Deliver Now
                </UButton>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <h4 class="font-semibold">
              Items:
            </h4>
            <ul class="list-disc pl-5 text-gray-800">
              <li
                v-for="item in order.items"
                :key="item.id"
                class="flex justify-between"
              >
                <span>
                  {{ item.name }} ({{ item.quantity }} x {{ item.price_per_item }} {{ cartStore.getCurrency }})
                </span>
                <span class="font-semibold">{{ item.totalPrice }} {{ cartStore.getCurrency }}</span>
              </li>
            </ul>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            Order Date: {{ formatDateToCountryTimeZone(order.created_at, countryCode) }}
          </div>
        </div>
      </div>
      <div
        v-else
        class="w-screen h-screen flex items-center bg-white justify-center"
      >
        <Icon
          name="i-mingcute-loading-line"
          class="animate-spin text-[45px] text-primary"
        />
      </div>
    </div>
  </div>
</template>
