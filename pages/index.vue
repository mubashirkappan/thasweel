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
  <div>
    
    <div class="block w-full bg-gray-50 md:hidden">
        <img 
            src="/img/shop/mobile_hero.webp" 
            alt="Fooddly Mobile Home" 
            class="w-full h-auto"
        >
        <ShopContactUs />
    </div>

    <div class="hidden md:block lg:hidden w-full">
      <img 
        src="/img/shop/tab_hero_new.webp" 
        alt="Fooddly Tablet View" 
        class="w-full h-auto object-cover" 
      >
        <ShopContactUs />

      </div>

    <div class="hidden min-h-screen lg:block font-sans">
      <ShopHero />
      <ShopContactUs />
    </div>

  </div>
</template>