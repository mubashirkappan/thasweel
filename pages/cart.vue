<script setup>
import { useCartStore } from '/composables/cartData'

definePageMeta({
  middleware: ['auth'],
  // or middleware: 'auth'
})

const cartStore = useCartStore()
const authStatus = useAuth()
const { token, ItemsCount } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(true)
const toast = useToast()
const formattedData = ref()
const isOpen = ref(false)
const link = ref()

function isWeightBased(unit) {
  if (!unit) return false;
  return /(\bkg\b|\bg\b|\blb\b|\boz\b|kilo|gram|pound|ounce)/i.test(String(unit));
}

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
      toast.add({
        title: response.message,
        color: 'green',
        icon: 'i-heroicons-check-badge',
      })
      fetchData()
      openWhatsAppFromLink(response.data.link)
    })
    .catch(({ data }) => {
      toast.add({
        title: data?.message || 'Failed to confirm order',
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

function openWhatsAppFromLink(rawLink) {
  if (!rawLink) return
  try {
    const url = new URL(rawLink)
    const phone = url.pathname.replace('/', '')
    const text = url.searchParams.get('text') || ''
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
    const encodedText = encodeURIComponent(text)

    let targetUrl = ''
    if (isAndroid) {
      targetUrl = `intent://send?phone=${phone}&text=${encodedText}#Intent;scheme=whatsapp;package=com.whatsapp;end`
    } else {
      targetUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`
    }

    if (!isAndroid) {
      const win = window.open(targetUrl, '_blank')
      if (!win) {
        window.location.href = targetUrl
      }
    } else {
      window.location.href = targetUrl
    }
  } catch (e) {
    window.location.href = rawLink
  }
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
            <div class="flex flex-col justify-between h-full w-full">
              <div class="flex flex-col justify-between h-full">
                <div>
                  <div class="text-base font-semibold mt-2 text-[#253D4E] flex items-center gap-2 flex-wrap">
                    <span>{{ cartItem.item_name }}</span>
                    <UBadge v-if="cartItem.unit || cartItem.item?.unit" color="gray" variant="soft" size="xs">
                      {{ cartItem.unit || cartItem.item?.unit }}
                    </UBadge>
                  </div>

                  <!-- Homebaker Preparation Badge (Weight-based items only) -->
                  <div v-if="cartItem.count > 1 && isWeightBased(cartItem.unit || cartItem.item?.unit)" class="mt-1">
                    <span
                      v-if="cartItem.preparation_preference === 'single_combined'"
                      class="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded"
                    >
                      <Icon name="lucide:package" class="w-3 h-3" />
                      One {{ cartItem.item_name || 'item' }} with total weight
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
                    >
                      <Icon name="lucide:layers" class="w-3 h-3" />
                      {{ cartItem.count }} Separate Items ({{ cartItem.unit || '1 pc' }} each)
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-3 pb-2 mt-2">
                  <div class="flex flex-wrap gap-1 items-center">
                    <div class="text-primary font-semibold text-2xl">
                      <span class="text-xs">{{ cartStore.getCurrency }}</span>{{ cartItem.dibi_price }}
                    </div>

                    <div class="text-gray-500 font-medium text-sm">
                      x {{ cartItem.count }} = <span class="font-bold text-gray-900">{{ cartStore.getCurrency }}{{ cartItem.dibi_price * cartItem.count }}</span>
                    </div>
                  </div>

                  <div class="flex gap-4">
                    <UButton variant="soft" color="red" size="xs" class="text-red-400" @click="deleteFromCart(cartItem.item_id)">
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
</template>
