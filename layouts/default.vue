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
</script>

<template>
  <CoreNav />
  <slot />
  <CoreFooter />
</template>
