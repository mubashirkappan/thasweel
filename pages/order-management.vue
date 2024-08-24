<script setup>
const authStatus = useAuth()
const loading = ref(true)
const config = useRuntimeConfig()
const { token } = storeToRefs(authStatus)
const toast = useToast()
const fetchedShopData = ref([])
const fetchedOrderData = ref([])
const shopId = ref(null)

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
      shopId.value = fetchedShopData.value[0].id
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

onMounted(() => {
  fetchShopList()
})
</script>

<template>
  <div class="main-container py-10">
    <div class="max-container">
      <div v-if="!loading" class="space-y-4">
        <div
          v-for="order in fetchedOrderData"
          :key="order.id"
          class="border border-gray-300 rounded-lg p-4 shadow-sm"
        >
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold">
                Order #{{ order.id }}
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
            </div>
            <div>
              <p class="text-lg font-semibold text-blue-600">
                {{ order.total_price }} SAR
              </p>
              <p :class="order.is_completed ? 'text-green-500' : 'text-red-500'">
                {{ order.is_completed ? 'Completed' : 'Pending' }}
              </p>
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
                  {{ item.name }} ({{ item.quantity }} x {{ item.price_per_item }} SAR)
                </span>
                <span class="font-semibold">{{ item.totalPrice }} SAR</span>
              </li>
            </ul>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            Order Date: {{ new Date(order.created_at).toLocaleString() }}
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
