<script setup>
definePageMeta({
  middleware: ['auth'],
})

const authStatus = useAuth()
const { token } = storeToRefs(authStatus)
const { isOwner } = storeToRefs(authStatus)

const config = useRuntimeConfig()
const loading = ref(true)
const toast = useToast()
const fetchedData = ref([])

function fetchData() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/get-user`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    method: 'GET',
  })
    .then((response) => {
      fetchedData.value = response.data
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

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="main-container">
    <div class="max-container">
      <div class="font-[poppins] text-2xl md:text-[40px] font-semibold pt-3 ">
        Profile
      </div>
    </div>
  </div>
  <div class="main-container py-10 min-h-[80vh] flex items-center justify-center">
    <div class="max-container">
      <div class="py-10 flex flex-col items-center justify-center gap-3">
        <img src="/img/avtr.png" alt="">

        <div v-if="fetchedData" class="text-2xl font-bold text-center">
          <div v-if="fetchedData.name">
            {{ fetchedData.name }}
          </div>
          <div v-else-if="fetchedData.email">
            {{ fetchedData.email }}
          </div>
          <div v-else>
            {{ fetchedData.phonenumber }}
          </div>

        </div>

        <Icon
          v-if="loading"
          name="i-mingcute-loading-line"
          class="animate-spin text-[45px] text-primary"
        />
      </div>
      <div v-if="!loading" class="flex flex-col items-center justify-center gap-2">
        <UButton v-if="fetchedData.is_owner === 1" class="w-full justify-center max-w-[300px]" size="xl" to="/shop-management">
          <Icon name="i-fluent-mdl2-text-document-settings" />
          <div>
            Shop Settings
          </div>
        </UButton>
        <UButton v-if="fetchedData.is_owner === 1" class="w-full justify-center max-w-[300px]" size="xl" to="/order-management">
          <Icon name="i-fluent-mdl2-text-document-settings" />
          <div>
            Orders
          </div>
        </UButton>
      </div>
    </div>
  </div>
</template>
