<script setup>
import { storeToRefs } from 'pinia'

const authStatus = useAuth()
const { token } = storeToRefs(authStatus)

watch(
  () => token.value,
  (newToken, oldToken) => {
    if (newToken !== oldToken)
      window.location.reload() // Trigger a reload when the token changes
  },
)
const route = useRoute()
</script>

<template>
  <CoreNav v-if="route === '/'" />
  <slot />
  <CoreFooter v-if="route === '/'" />
  <CoreFooterSec v-else />
</template>
