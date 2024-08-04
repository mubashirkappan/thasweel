<script setup>
import { storeToRefs } from 'pinia'

defineProps({
  optionalNav: {
    type: Boolean,
    default: true,
  },
})

const authStatus = useAuth()
const { loggedIn, token, ItemsCount, signPop } = storeToRefs(authStatus)
const isOpen = ref(false)

const hero = ref(false)
function heroView() {
  window.scrollY > 400 ? (hero.value = true) : (hero.value = false)
}
const route = useRoute()
if (route.query.mode === 'register')
  signPop.value = true

// if (route.query.mode === 'register')
//   signPop.value = true
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
    <div
      class="max-container relative after:h-[1px] after:absolute after:w-[200vw] after:bg-gray-300 after:bottom-0 after:left-[-10vw] after:hidden md:after:block"
    >
      <div class="flex gap-3 items-center justify-between w-full py-2 md:py-4">
        <NuxtLink to="/">
          <img src="/img/logo.svg" class="max-w-[140px]" alt="">
        </NuxtLink>
        <!-- <CorePlaceSearch class="hidden md:block" /> -->
        <div v-if="!loggedIn" class="flex min-h-[40px] gap-3">
          <ModalLogin />
          <ModalRegister />
        </div>

        <div v-else class="flex items-center gap-2 ">
          <UButton class="rounded-full aspect-square flex-shrink-0" to="/profile">
            <Icon class="text-2xl" name="i-heroicons-user" />
          </UButton>
          <UChip :text="ItemsCount" size="2xl">
            <UButton variant="outline" to="/cart" class="rounded-full aspect-square flex-shrink-0">
              <Icon class="text-2xl" name="i-heroicons-outline-shopping-cart" />
            </UButton>
          </UChip>

          <UButton class="rounded-full aspect-square flex-shrink-0" @click="isOpen = true">
            <Icon class="text-2xl" name="ant-design:logout-outlined" />
          </UButton>
        </div>
      </div>
    </div>

      <div class="flex items-center justify-between w-full py-2 max-md:flex-col gap-2">
        <div class="flex gap-3 max-md:w-full  max-sm:max-w-full max-md:max-w-[70%] justify-between">
          <NuxtLink
            to="/"
            class="flex items-center justify-center gap-1 text-gray-800 hover:text-primary text-base max-md:text-xs"
          >
            <Icon name="tabler:home" class="text-2xl" />
            Home
          </NuxtLink>
          <NuxtLink
            to="/"
            class="flex items-center justify-center gap-1 text-gray-800 hover:text-primary text-base max-md:text-xs"
          >
            <Icon name="basil:add-outline" class="text-2xl" />
            Add Your Shop
          </NuxtLink>
          <NuxtLink
            to="/"
            class="flex items-center justify-center gap-1 text-gray-800 hover:text-primary text-base max-md:text-xs"
          >
            <Icon name="fluent:megaphone-24-regular" class="text-2xl" />
            Partners
          </NuxtLink>
        </div>
        <CorePlaceSearch class="md:hidden block md:my-3" />

        <div class="flex min-h-[40px] gap-3 items-center justify-center">
          <NuxtLink
            to="tel:+919020775050"
            class="flex items-center justify-center gap-1 text-primary group"
          >
            <Icon
              name="carbon:phone"
              class="text-2xl transition-transform group-hover:scale-125"
            />
            9020775050
          </NuxtLink>
          <div class="text-sm">
            24/7 support center
          </div>
        </div>
      </div>
    </div> -->
    <ModalConfirm v-model="isOpen" @submit-success="logOut" />
  </div>
</template>
