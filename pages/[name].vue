<script setup>
import { useCartStore } from '/composables/cartData'

const cartStore = useCartStore()
const config = useRuntimeConfig()
const route = useRoute()
const shop = ref(route.params.name)
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
    const response = await fetch(
      `${config.public.apiBaseUrl}/shops?shop=${query}`,
    )

    if (!response.ok)
      throw new Error('Failed to list Shops')
    data = await response.json()
    // console.log(`${config.public.apiBaseUrl}/shops?shop=${query}`)
    shopDetail.value = data.data[0]
    itemList.value = data.data[0].items
    categoryList.value = data.data[0].categorys
  }
  catch (error) {
    toast.add({
      title: error.message,
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  }
  finally {
    loading.value = false
    fetchItems()
    fetchImagesList()
  }
}
const listing = ref(null)

async function fetchItems() {
  loading.value = true
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/items`, {
      headers: {
        accept: 'application/json',
      },
      body: {
        shop_id: shopDetail.value.id,
        keyword: selectedKeyword.value,
        category_id: selectedCategory.value,
      },
      method: 'POST',
    })
    listing.value = response.data
  }
  catch (error) {
    toast.add({
      title: error.message,
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  }
  finally {
    loading.value = false
  }
}

async function fetchImagesList() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/offer/inside-shop-list`, {
    headers: {
      accept: 'application/json',
    },
    body: {
      shop_id: shopDetail.value?.id,
    },
    method: 'POST',
  })
    .then((response) => {
      fetchedImages.value = response.data
    })
    .catch(({ data }) => {
      toast.add({
        title: data?.message,
        color: 'red',
        icon: 'i-heroicons-x-circle',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function reloadItems() {
  selectedCategory.value = null
  selectedKeyword.value = null
  fetchItems()
}
function getData() {
  if (!shop.value) {
    navigateTo('/shopList')
  }
  else {
    shop.value = shop.value.replace(/\s+/g, '+')
    fetchShops(shop.value)
  }
}
watch([selectedCategory, selectedKeyword], () => {
  fetchItems()
})
onMounted(
  getData
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
      <CoreListing title="Products Available" :search="false">
        <template #search>
          <CoreItemsSearch v-model="selectedKeyword" />
        </template>
        <template v-if="listing && Object.keys(listing).length">
          <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:py-4 my-3 max-md:min-h-[80vh] max-md:items-center">
            <CoreItemCard :data="listing" :shop-id="shopDetail.id" />
          </div>
        </template>
        <div v-else>
          <div
            class="w-full flex items-center flex-col justify-center font-medium text-xl py-10 min-h-[40vh]"
          >
            <span>
              <Icon name="i-mdi-alert" class="text-red-500 mr-2" />
              No items found
            </span>
            <span class="text-primary cursor-pointer" @click="reloadItems()">
              Clear search
            </span>
          </div>
        </div>
      </CoreListing>
      <div v-if="cartStore.productCount > 0" class="fixed z-[40] bottom-[20px] left-0  w-full  flex justify-center ">
        <div class="max-container mx-5 !w-full  md:!w-[50%]   p-4 text-white bg-secondary-500 md:mx-auto   shadow-xl rounded-lg flex items-center justify-between ">
          <div>
            Proceed with the order of {{ cartStore.productCount }} items
          </div>
          <ModalLeadGen :shop-details="shopDetail" variant="solid" :custom="true"> 
            CLick to Proceed
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
