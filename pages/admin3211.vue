<script setup>
const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()
const shopList = ref([])
const route = useRoute()
const search = ref(true)

let query

async function fetchData(query) {
  loading.value = true
  try {
    let response
    if (query)
      response = await fetch(`${config.public.apiBaseUrl}/shops?city=${query}`)

    else response = await fetch(`${config.public.apiBaseUrl}/shops`)
    if (!response.ok)
      throw new Error('Failed to fetch places list')
    const data = await response.json()
    shopList.value = data.data
  }
  catch (error) {
    toast.add({ title: error.message, color: 'red', icon: 'i-heroicons-x-circle' })
  }
  finally {
    loading.value = false
  }
}
function getData() {
  if (route.query.selected) {
    query = route.query.selected
    fetchData(query)
    search.value = false
  }
  else {
    fetchData()
  }
}
onMounted(getData)
</script>

<template>
  <ShopHero />
  <!-- <ShopCategory /> -->
  <CoreListing title="Popular Nearby Shops" :search="search">
    <div v-if="shopList.length !== 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 py-4 mt-3">
      <CoreShopCard :data="shopList" />
    </div>
    <div
      v-else
      class="py-[100px] bg-white flex items-center justify-center font-medium text-2xl"
    >
      <Icon name="i-mdi-error" class="text-primary" />
      No Data Found
    </div>
  </CoreListing>
</template>
