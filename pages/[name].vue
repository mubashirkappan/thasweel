<script setup lang="ts">
import { useCartStore } from '/composables/cartData'
import { navigateTo } from '#app'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  layout: 'inner',
})

const cartStore = useCartStore()
const config = useRuntimeConfig()
const route = useRoute()
const { t, syncLocaleFromRoute } = useI18n()

onMounted(() => {
  syncLocaleFromRoute()
})

const shop = ref(route.params.name as string)
const loading = ref(true)
const toast = useToast()
const itemList = ref()
const categoryList = ref()
const shopDetail = ref(null)
const fetchedImages = ref(null)
const selectedCategory = ref(null)
const selectedKeyword = ref(null)

let data
async function fetchShops(query) {
  loading.value = true
  try {
    const rawQuery = query ? query.replace(/\s+/g, '+') : ''
    let resData = null

    const cleaned = rawQuery.replace(/^(ar\/|\/ar\/|ar-|ar_)/i, '')
    const withAr = `ar/${cleaned}`

    const primaryQuery = rawQuery.includes('ar/') ? rawQuery : (route.path.startsWith('/ar/') ? `ar/${cleaned}` : cleaned)
    const fallbackQuery = primaryQuery === withAr ? cleaned : withAr

    // Try primary query first
    try {
      const response = await fetch(
        `${config.public.apiBaseUrl}/shops?shop=${primaryQuery}&from=thasweel`,
      )
      if (response.ok) {
        const json = await response.json()
        if (json?.data && json.data.length > 0 && json.data[0]) {
          resData = json
        }
      }
    } catch (e) {
      // fallback will be tried below
    }

    // Fallback if primary query yielded no shop
    if (!resData?.data || resData.data.length === 0 || !resData.data[0]) {
      const responseFallback = await fetch(
        `${config.public.apiBaseUrl}/shops?shop=${fallbackQuery}&from=thasweel`,
      )
      if (responseFallback.ok) {
        const jsonFallback = await responseFallback.json()
        if (jsonFallback?.data && jsonFallback.data.length > 0 && jsonFallback.data[0]) {
          resData = jsonFallback
        }
      }
    }

    // Check if shop exists in response data
    if (!resData?.data || resData.data.length === 0 || !resData.data[0]) {
      throw new Error('Shop not found')
    }

    data = resData
    shopDetail.value = resData.data[0]
    cartStore.setCurrency(shopDetail.value?.currency)
    itemList.value = resData.data[0]?.items
    categoryList.value = resData.data[0]?.categorys

    // Only fetch items and images if shop details are fully loaded
    await fetchItems()
    await fetchImagesList()
  }
  catch (error) {
    toast.add({
      title: error.message || 'Error loading shop',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
    navigateTo('/')
  }
  finally {
    loading.value = false
  }
}

const listing = ref(null)

async function fetchItems() {
  const shopId = shopDetail.value?.id
  if (!shopId) return

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/items`, {
      headers: {
        accept: 'application/json',
      },
      body: {
        shop_id: shopId,
        keyword: selectedKeyword.value,
        category_id: selectedCategory.value,
      },
      method: 'POST',
    })
    listing.value = response?.data
  }
  catch (error) {
    const errorMsg = error?.data?.message || error.message
    toast.add({
      title: errorMsg,
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  }
}

async function fetchImagesList() {
  const shopId = shopDetail.value?.id
  if (!shopId) return

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/offer/inside-shop-list`, {
      headers: {
        accept: 'application/json',
      },
      body: {
        shop_id: shopId,
      },
      method: 'POST',
    })

    if (response?.data) {
      fetchedImages.value = response.data
    }
  } catch (error) {
    const data = error?.data
    if (data?.message) {
      toast.add({
        title: data.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    }
  }
}

function reloadItems() {
  selectedCategory.value = null
  selectedKeyword.value = null
  fetchItems()
}

function getCleanShopSlug(rawSlug: string): string {
  if (!rawSlug) return ''
  let cleaned = rawSlug.replace(/\s+/g, '+')
  cleaned = cleaned.replace(/^(ar\/|\/ar\/|ar-|ar_)/i, '')
  if (cleaned.includes('/ar/')) {
    cleaned = cleaned.split('/ar/').pop() || cleaned
  }
  return cleaned
}

function getData() {
  if (!shop.value) {
    navigateTo('/shopList')
  }
  else {
    fetchShops(shop.value)
  }
}

const hasAvailableItems = computed(() => {
  if (!listing.value) return false
  const items = Array.isArray(listing.value) ? listing.value : Object.values(listing.value)
  return items.some((item) => {
    if (!item) return false
    if (item.active === false || item.active === 0 || item.active === '0') return false
    const stock = item.available_count !== undefined && item.available_count !== null
      ? item.available_count
      : (item.count !== undefined && item.count !== null ? item.count : null)
    if (stock !== null && stock !== undefined) {
      return Number(stock) > 0
    }
    return true
  })
})

watch([selectedCategory, selectedKeyword], () => {
  fetchItems()
})

onMounted(
  getData,
)
</script>

<template>
  <template v-if="!loading">
    <template v-if="shopDetail">
      <ShopDetailsInfo :item="shopDetail" />
      <div class="pb-2">
        <ShopSwiper :images="fetchedImages" />
      </div>
      <ShopCategory v-model="selectedCategory" :data="categoryList" />
      <CoreListing :title="t('products_available')" :search="false">
        <template #search>
          <CoreItemsSearch v-model="selectedKeyword" />
        </template>
        <div v-if="hasAvailableItems" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:py-4 my-3 items-stretch">
          <CoreItemCard :data="listing" :shop-id="shopDetail.id" />
        </div>
        <div v-else>
          <div
            class="w-full flex items-center flex-col justify-center font-medium text-xl py-10 min-h-[40vh]"
          >
            <span>
              <Icon name="i-mdi-alert" class="text-red-500 mr-2" />
              {{ t('no_items_found') }}
            </span>
            <span class="text-primary cursor-pointer" @click="reloadItems()">
              {{ t('clear_search') }}
            </span>
          </div>
        </div>
      </CoreListing>
      <div v-if="cartStore.productCount > 0" class="fixed z-[40] bottom-[20px] left-0 w-full flex justify-center">
        <div class="max-container mx-5 !w-full md:!w-[50%] p-4 text-white bg-secondary-500 md:mx-auto shadow-xl rounded-lg flex items-center justify-between">
          <div>
            {{ t('proceed_order', { count: cartStore.productCount }) }}
          </div>
          <ModalLeadGen :shop-details="shopDetail" variant="solid" :custom="true">
            {{ t('click_to_proceed') }}
          </ModalLeadGen>
        </div>
      </div>
    </template>
  </template>
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
