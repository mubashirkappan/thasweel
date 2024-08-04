<script setup>
import axios from 'axios'
import { z } from 'zod'

const props = defineProps({ modelValue: Boolean, shopId: Number })
const emit = defineEmits(['update:modelValue', 'submitSuccess'])
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const state = reactive({
  name: undefined,
})

const schema = z.object({
  name: z.string().min(2, 'Must be at least 2 characters'),
})

const authStatus = useAuth()
const { token } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()

async function submit() {
  const formData = new FormData()
  formData.append('name', state.name)
  formData.append('shop_id', props.shopId)
  loading.value = true
  try {
    const response = await axios.post(`${config.public.apiBaseUrl}/categories/create`, formData, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    })
    toast.add({ title: response.data.message, icon: 'i-heroicons-check-badge' })
    emit('submitSuccess')
    isOpen.value = false
  }
  catch (error) {
    toast.add({ title: error.response.data.message, color: 'red', icon: 'i-heroicons-x-circle' })
  }
  finally {
    state.name = ''
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model="isOpen">
    <div class="relative pt-0 p-6">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark-20-solid"
        class="-my-1 absolute top-2 right-1"
        @click="isOpen = false"
      />
      <div class="py-2 text-3xl text-center font-bold">
        Add Category
      </div>
      <UForm :state="state" class="space-y-4" :schema="schema" @submit="submit">
        <UFormGroup label="Category" required name="name">
          <UInput v-model="state.name" />
        </UFormGroup>
        <UButton
          type="submit"
          :loading="loading"
          class="w-full flex justify-center"
        >
          Add Category
        </UButton>
      </UForm>
    </div>
  </UModal>
</template>
