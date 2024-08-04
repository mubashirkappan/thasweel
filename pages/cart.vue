<script setup>
definePageMeta({
  middleware: ['auth'],
  // or middleware: 'auth'
})

const authStatus = useAuth()
const { token, ItemsCount } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(true)
const toast = useToast()
const formattedData = ref()
const isOpen = ref(false)
const link = ref()

function fetchData() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/get-cart`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      const tempData = []
      for (const [shopName, cartDetails] of Object.entries(response.data)) {
        tempData.push({
          name: shopName,
          items: cartDetails,
        })
      }
      formattedData.value = tempData
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
function confirmOrder(shopId) {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/confirm-order`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    body: {
      shop_id: shopId,
    },
    method: 'Post',
  })
    .then((response) => {
      ItemsCount.value = response.data.cartItemCountNotPurchased
      isOpen.value = true
      link.value = response.data.link
      toast.add({
        title: response.message,
        color: 'green',
        icon: 'i-heroicons-check-badge',
      })
      fetchData()
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

function deleteFromCart(itemId) {
  loading.value = true

  $fetch(`${config.public.apiBaseUrl}/delete-from-cart`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    body: {
      item_id: itemId,
    },
    method: 'POST',
  })
    .then((response) => {
      ItemsCount.value = response.data.cartItemCountNotPurchased
      toast.add({ title: response.message, color: 'green', icon: 'i-heroicons-check-badge' })
      fetchData()
    })
    .catch(({ data }) => {
      toast.add({ title: data.message, color: 'red', icon: 'i-heroicons-x-circle' })
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
      <!-- <NuxtLink to="/">
        <Icon name="icon-park-outline:left" /> Back to result
      </NuxtLink> -->
      <div class="font-[poppins] text-2xl md:text-[40px] font-semibold pt-3">
        Shopping Cart
      </div>
    </div>
  </div>

  <div v-if="!loading" class="main-container pt-10">
    <template v-if="formattedData.length">
      <div v-for="shop in formattedData" :key="shop" class="max-container">
        <div
          class="font-semibold text-2xl mb-5 w-max text-[#253D4E] after:w-full relative after:h-[4px] after:left-0 after:bottom-0 after:bg-gradient-to-r after:from-primary after:from-50% after:to-black/5 after:to-50% after:absolute"
        >
          Products Under {{ shop.name }}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3  max-md:max-w-[400px] mx-auto">
          <div
            v-for="cartItem in shop.items"
            :key="cartItem"
            class="flex max-sm:flex-col items-center gap-5 p-5 border border-gray-200 rounded-xl"
          >
            <div>
              <img
                :src="`${cartItem.image}`"
                class="object-contain  w-[200px] max-h-[100px] flex-shrink-0"
                :alt="`image of ${cartItem.item_name}` "
              >
            </div>
            <div class="flex flex-col justify-between h-full">
              <div class="flex flex-col justify-between h-full">
                <div>
                  <div class="text-base font-semibold mt-2 text-[#253D4E]">
                    {{ cartItem.item_name }}
                  </div>
                <!-- <div
                  v-if="cartItem.description"
                  class="text-sm font-medium py-3"
                >
                  {{ cartItem.description }}
                </div> -->
                </div>
                <div class="flex flex-col gap-3 pb-2">
                  <div class="flex  flex-wrap  gap-1 items-center">
                    <div class="text-primary font-semibold text-3xl">
                      ₹{{ cartItem.dibi_price }}
                    </div>

                    <div class=" text-[#adadad] font-medium text-xl">
                      x{{ cartItem.count }} = {{ cartItem.dibi_price * cartItem.count }}
                    </div>
                  </div>

                  <div class="flex gap-4">
                    <!-- <div class="text-gray-400 font-[poppins] font-xl">
                      Quantity
                    </div>
                    <CoreCounter :init-value="cartItem.quantity" /> -->
                    <!-- <UDivider orientation="vertical" /> -->
                    <UButton variant="soft" color="red" class="text-red-400" @click="deleteFromCart(cartItem.item_id)">
                      <Icon name="i-heroicons-trash" /> Delete
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="py-4 flex justify-center">
          <UButton
            size="lg"
            variant="outline"
            color="black"
            @click="confirmOrder(shop.items[0].shop_id)"
          >
            <Icon name="lucide:shopping-cart" />
            Proceed To Order
          </UButton>
        </div>
      </div>
    </template>
    <div
      v-else
      class="w-screen h-[50vh] bg-white flex items-center justify-center font-medium text-2xl"
    >
      <Icon name="i-mdi-error" class="text-primary" />
      No Data Found
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
  <UModal v-model="isOpen" prevent-close>
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Order Confirmation
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="pb-3">
        Please click the link below to confirm your order with a quick WhatsApp
        message to the shop owner.
      </div>
      <NuxtLink
        class="bg-[#fc544c] ml-auto border border-[#fc544c] text-center hover:bg-white hover:text-[#fc544c] text-white p-3 rounded-md text-sm font-medium flex items-center justify-center gap-1"
        :to="link"
      >
        <Icon name="ic:outline-whatsapp" class="text-2xl" />
        Proceed To Order
      </NuxtLink>
    </UCard>
  </UModal>
</template>
