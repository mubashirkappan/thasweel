<script setup>
import { storeToRefs } from 'pinia'

const props = defineProps({
  custom: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
  },
})

const config = useRuntimeConfig()
const loading = ref(false)
const authStatus = useAuth()
const isOpen = ref(false)
const toast = useToast()
const { token, loggedIn, loginPop } = storeToRefs(authStatus)

const referCode = ref()
const referCodeLink = ref()

function fetchData() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/refer`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      referCode.value = response.data
      referCodeLink.value = linkGen(referCode.value)
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
function handleClick() {
  if (!loggedIn.value) {
    loginPop.value = true
    return
  }

  fetchData()
  isOpen.value = true
}
function linkGen(value) {
  return `www.dibimall.com/?mode=register&code=${value}`
}

function copyToClipboard(text, method) {
  navigator.clipboard.writeText(text).then(() => {
    toast.add({
      title: `${method === 'code' ? 'Code' : 'Link'} Successfully Copied`,
      icon: 'i-heroicons-check-badge',
    })
  }).catch((error) => {
    toast.add({
      title: error,
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  })
}
</script>

<template>
  <UButton
    v-if="!custom"
    class="border border-primary bg-primary min-h-[40px] flex gap-1 items-center justify-center px-3 font-semibold rounded text-white hover:bg-white hover:text-primary transition-colors"
    @click="handleClick"
  >
    <Icon name="i-mdi-hand-coin-outline" class="" />
    Refer a Friend
  </UButton>
  <UButton v-else :variant="variant" @click="handleClick">
    <slot />
  </UButton>
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
            Refer A Friend
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

      <div class="pb-3 cursor-pointer" @click="loading ? '' : copyToClipboard(referCodeLink)">
        <UInput v-model="referCodeLink" trailing icon="i-heroicons-clipboard-document-20-solid" class="pointer-events-none" :loading="loading" />
      </div>
      <div class="w-full grid md:grid-cols-2 gap-2">
        <UButton :loading="loading" class="w-full justify-center items-center" @click="copyToClipboard(referCodeLink)">
          Copy Link
        </UButton>
        <UButton :loading="loading" class="w-full justify-center items-center" variant="outline" @click="copyToClipboard(referCode, 'code')">
          Copy Code
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>
