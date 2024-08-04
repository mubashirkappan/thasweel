<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const shop = ref(route.query.shop)
const loading = ref(true)
const toast = useToast()
const itemList = ref()
const categoryList = ref()
const shopDetail = ref()
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
function reloadItems() {
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
watch([selectedCategory, selectedKeyword], (newValues) => {
  fetchItems()
})
onMounted(getData)
</script>

<template>
  <template v-if="!loading">
    <template v-if="shopDetail">
      <ShopDetailsInfo :item="shopDetail" />
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
              No products found for the selected search criteria.
            </span>
            <span class="text-primaryOne cursor-pointer" @click="reloadItems()">
              Clear search
            </span>
          </div>
        </div>
      </CoreListing>
    </template>
    <div
      v-else
      class="w-screen h-screen bg-white flex items-center justify-center font-medium text-2xl"
    >
      <Icon name="i-mdi-error" class="text-primary" />
      No Data Found
    </div>
  </template>
  <div
    v-else
    class="w-screen h-screen flex items-center bg-white justify-center"
  >
    <Icon
      name="i-mingcute-loading-line"
      class="animate-spin text-[45px] text-primaryOne"
    />
  </div>
</template>
