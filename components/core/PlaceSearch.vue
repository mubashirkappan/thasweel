<script setup>
const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()

const placeList = ref([])

async function fetchData() {
  loading.value = true
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/places-list`)
    if (!response.ok)
      throw new Error('Failed to fetch places list')
    const data = await response.json()
    placeList.value = extractKeyValues(data.data, 'place')
  }
  catch (error) {
    toast.add({ title: error.message, color: 'red', icon: 'i-heroicons-x-circle' })
  }
  finally {
    loading.value = false
  }
}

const selected = ref(null)

function submitAction() {
  if (selected.value) {
    const queryParams = new URLSearchParams({ selected: selected.value }).toString()
    window.location.href = `/shopList?${queryParams}`
  }
}

function extractKeyValues(array, key) {
  return array.map(item => item[key])
}

watch(selected, (newVal) => {
  if (newVal)
    submitAction()
})

onMounted(fetchData)
</script>

<template>
  <div class="relative min-h-[40px] max-w-[400px] w-full flex items-center">
    <USelectMenu
      v-model="selected"
      :ui="{ base: 'min-h-[40px]', icon: { base: 'hidden' } }"
      searchable
      searchable-placeholder="Search a location"
      class="w-full min-h-[40px]"
      placeholder="Search Virtual mall on your location"
      :options="placeList"
    />
    <UButton
      :disabled="!selected"
      class="bg-primary rounded-s-none absolute right-0 flex items-center justify-center top-0 h-full w-[60px] group"
    >
      <Icon
        name="iconamoon:search-bold"
        class="text-xl text-white transition-transform group-hover:scale-125"
      />
    </UButton>
  </div>
</template>
