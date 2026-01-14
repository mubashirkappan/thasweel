<script setup>
import { storeToRefs } from 'pinia'

// 1. Get Runtime Config
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

// 2. Fetch the Shop List
const { data: shopOptions, pending } = await useFetch('/shops', {
  baseURL: config.public.apiBaseUrl,
  transform: (response) => {
    return response.data || [] 
  }
})

// 3. Initialize Selection
const selectedShopSlug = ref(route.query.destination || null)

// 4. Watch for changes
watch(selectedShopSlug, (newSlug) => {
  if (newSlug) {
    router.push(`/${newSlug}`)
  }
})

defineProps({
  optionalNav: {
    type: Boolean,
    default: true,
  },
})

const authStatus = useAuth()
const { loggedIn, token, leadGen } = storeToRefs(authStatus)
const isOpen = ref(false)
const hero = ref(false)

function heroView() {
  window.scrollY > 400 ? (hero.value = true) : (hero.value = false)
}

if (route.query.mode === 'register')
  leadGen.value = true

function logOut() {
  loggedIn.value = false
  token.value = null
}

onMounted(() => {
  window.addEventListener('scroll', heroView)
})
</script>

<template>
  <div class="main-container z-[100] bg-white shadow-black/10 shadow-xl" :class="hero ? 'fixed' : ''">
    
    <div class="max-container w-full mx-auto px-2 md:px-8">
      
      <div class="flex items-center justify-between w-full py-2 md:py-4">
        
        <div class="shrink-0 flex items-center gap-2">
            <img src="/img/fooddly_logo_only.jpeg" class="w-[35px] md:w-[60px]" alt="Logo">
            <img src="/img/brand_name_green.jpeg" class="w-[70px] md:w-[100px]" alt="Fooddly">
        </div>        
        <!-- <div class="shrink-0">
          <img src="/img/fooddly_logo_only.jpeg" class="w-[100px] md:w-[140px]" alt="">
          <img src="/img/fooddly_name.jpeg" class="w-[100px] md:w-[140px]" alt="">
        </div> -->

<!-- <div class="flex-1 md:flex-none md:w-72 mx-2">
   <USelectMenu 
     v-model="selectedShopSlug" 
     :options="shopOptions"
     :loading="pending"
     placeholder="Search..."
     value-attribute="slug"
     option-attribute="slug"
     searchable 
     searchable-placeholder="Search..."
     icon="i-heroicons-map-pin"
     class="w-full"
   />
</div> -->

        <template v-if="route.path === '/' || route.path.startsWith('/')">
           <div v-if="!loggedIn" class="flex min-h-[40px] gap-2 shrink-0">
            <ModalLogin />
          </div>

          <div v-else class="flex items-center gap-2 shrink-0">
            <UButton class="rounded-full aspect-square flex-shrink-0" to="/profile">
              <Icon class="text-xl md:text-2xl" name="i-heroicons-user" />
            </UButton>
            <UButton class="rounded-full aspect-square flex-shrink-0" @click="isOpen = true">
              <Icon class="text-xl md:text-2xl" name="ant-design:logout-outlined" />
            </UButton>
          </div>
        </template>
      </div>
    </div>

    <ModalConfirm v-model="isOpen" @submit-success="logOut" />
  </div>
</template>