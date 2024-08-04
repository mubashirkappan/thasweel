<script setup>
definePageMeta({
  middleware: ['auth'],
})

const authStatus = useAuth()
const { token } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(true)
const toast = useToast()
const order = ref([])
function fetchData() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/confirm-orders-list`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      const tempData = []
      for (const [shopName, orderDetails] of Object.entries(response.data)) {
        tempData.push({
          name: shopName,
          items: orderDetails,
        })
      }
      order.value = tempData
      loading.value = false
    })
    .catch(({ data }) => {
      loading.value = false
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
  fetchData()
})
// const selected = ref(true)
</script>

<template>
  <div class="main-container">
    <div class="max-container">
      <div class="font-[poppins] text-[40px] font-semibold">
        Order confirmed
      </div>
    </div>
  </div>
  <div class="main-container">
    <div v-if="loading" class="h-[400px] flex items-center justify-center">
      <Icon

        name="i-mingcute-loading-line"
        class="animate-spin text-[45px] text-primary"
      />
    </div>
    <template v-else-if="order.length <= 2">
      <div
        class="w-screen h-[50vh] bg-white flex flex-col items-center justify-center font-medium text-2xl"
      >
        <Icon name="i-mdi-error" class="text-primary" />
        No Confirmed Order There

        <NuxtLink to="/shopList" class="text-primary">
          Go to Shops
        </NuxtLink>
      </div>
    </template>

    <div v-for="details in order" v-else :key="details" class="max-container">
      <div>
        <template v-if="details.name !== 'overallTotal' && details.name !== 'overallTotalNormal'">
          <div class="bg-gray-50 border border-gray-300 py-3 px-5 text-sm text-gray-600 flex justify-between mt-10">
            <div class="flex  gap-10">
              <div>
                <div>
                  Shop Name
                </div>
                <div>
                  {{ details.name }}
                </div>
              </div>
              <div>
                <div>
                  Ordered Date
                </div>
                <div>
                  <!-- {{ details }} -->
                  {{ details.date.split(' ').slice(0, 3).join(' ') }}
                </div>
              </div>
              <div>
                <div>
                  Total
                </div>
                <div>
                  {{ details.items.total }}
                </div>
              </div>
            </div>
            <!-- <div>
          <div>
            <div>
              Total
            </div>
            <div>
              {{ details.name }}
            </div>
          </div>
        </div> -->
          </div>
          <div
            v-for="cartItem in details.items.items"
            :key="cartItem"
            class="flex max-md:flex-col items-center gap-5 p-5 border border-gray-200 rounded-sm mb-4"
          >
            <div class="md:max-w-[250px]">
              <img
                :src="`${cartItem.image}`"
                class="object-contain  w-[200px] max-h-[100px] flex-shrink-0"
                alt=""
              >
            </div>
            <div class="flex flex-col justify-between h-full">
              <div class="flex flex-col justify-between h-full">
                <div>
                  <div class="text-base font-semibold mt-2 text-[#253D4E]">
                    {{ cartItem.item_name }}
                  </div>
                  <div v-if="cartItem.description" class="text-sm font-medium py-3">
                    {{ cartItem.description }}
                  </div>
                </div>
                <div class="flex flex-col gap-3 pb-2">
                  <div class="flex gap-1 items-center">
                    <div class="text-primary font-semibold text-3xl">
                      ₹{{ cartItem.dibi_price }}
                    </div>
                    <div class=" text-[#adadad] font-medium text-xl">
                      x{{ cartItem.count }} = {{ cartItem.dibi_price * cartItem.count }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <!-- <template v-else-if="details.name !== 'overallTotalNormal'">
          <div class="bg-gray-50 border border-gray-300 py-3 px-5 my-10 text-right">
            <strong>
              Grand Total:
            </strong> {{ details.items }}
          </div>
        </template> -->
      </div>
    </div>
  </div>
</template>
