<script setup>
import { storeToRefs } from 'pinia'

defineProps({
  optionalNav: {
    type: Boolean,
    default: true,
  },
})

const authStatus = useAuth()
const { loggedIn, token, ItemsCount, leadGen } = storeToRefs(authStatus)
const isOpen = ref(false)

const hero = ref(false)
function heroView() {
  window.scrollY > 400 ? (hero.value = true) : (hero.value = false)
}
const route = useRoute()
if (route.query.mode === 'register')
  leadGen.value = true

// if (route.query.mode === 'register')
//   leadGen.value = true
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
      class="max-container "
    >
      <div class="flex gap-3 items-center justify-between w-full py-2 md:py-4">
        <div>
          <img src="/img/logo.svg" class="max-w-[140px]" alt="">
        </div>
        <template v-if="route.path === '/'">
          <div v-if="!loggedIn" class="flex min-h-[40px] gap-3">
            <ModalLogin />
          </div>

          <div v-else class="flex items-center gap-2 ">
            <UButton class="rounded-full aspect-square flex-shrink-0" to="/profile">
              <Icon class="text-2xl" name="i-heroicons-user" />
            </UButton>
            <UButton class="rounded-full aspect-square flex-shrink-0" @click="isOpen = true">
              <Icon class="text-2xl" name="ant-design:logout-outlined" />
            </UButton>
          </div>
        </template>
      </div>
    </div>

    <ModalConfirm v-model="isOpen" @submit-success="logOut" />
  </div>
</template>
