<script setup>
definePageMeta({
  middleware: ['auth'],
})

const authStatus = useAuth()
const { token } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(true)
const toast = useToast()
// const order = ref([])
const tempData = ref()
function fetchData() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/get-orders`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      tempData.value = response.data
      loading.value = false
    })
    .catch(({ data }) => {
      loading.value = false
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

onMounted(() => {
  fetchData()
})
// const selected = ref(true)
</script>

<template>
  <div class="main-container">
    <div class="max-container">
      <div class="font-[poppins] text-[40px] font-semibold">
        Order Details
      </div>
    </div>
  </div>
  {{ tempData }}
</template>
