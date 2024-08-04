<script setup>
import axios from 'axios'
import { z } from 'zod'

const props = defineProps({ modelValue: Boolean, shopId: Number, categoryList: Array })
const emit = defineEmits(['update:modelValue', 'submitSuccess'])
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const state = reactive({
  name: undefined,
  price: undefined,
  dibi_price: undefined,
  count: undefined,
  category_id: undefined,
  image: null,
  active: true,
  offer: false,
  amount: undefined,
})
const schema = z.object({
  name: z.string().min(2, 'Must be at least 2 characters'),
  price: z.number(),
  dibi_price: z.number(),
  image: z.any(),
  count: z.number(),
  active: z.boolean(),
  offer: z.boolean(),
}).refine(data => data.dibi_price <= data.price, {
  message: 'dibi_price should be equal to or lower than price',
  path: ['dibi_price'],
})
const authStatus = useAuth()
const { token } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()



function changeFile(event) {
  state.image = event.target.files[0]
}

async function submit() {
  const formData = new FormData()
  formData.append('name', state.name)
  formData.append('price', state.price)
  formData.append('dibi_price', state.dibi_price)
  formData.append('image', state.image)
  formData.append('count', state.count)
  formData.append('shop_id', props.shopId)
  formData.append('category_id', state.category_id)
  formData.append('active', state.active ? 1 : 0)
  formData.append('offer', state.offer ? 1 : 0)

  loading.value = true

  try {
    const response = await axios.post(`${config.public.apiBaseUrl}/items/create`, formData, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'multipart/form-data',
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
        Add your Items
      </div>
      <UForm :state="state" class="space-y-4" :schema="schema" @submit="submit">
        <UFormGroup label="Item Name" required name="name">
          <UInput v-model="state.name" />
        </UFormGroup>
        <UFormGroup label="Price" required name="price">
          <UInput v-model="state.price" type="number" />
        </UFormGroup>
        <UFormGroup label="Discounted Price" description="Actual Price" required name="dibi_price">
          <UInput v-model="state.dibi_price" type="number" />
        </UFormGroup>
        <UFormGroup label="Count" required name="count">
          <UInput v-model="state.count" type="number" />
        </UFormGroup>
        <UFormGroup label="Image" required name="image">
          <input type="file" @change="changeFile">
        </UFormGroup>
        <UFormGroup label="Category" required name="category">
          <USelectMenu
            v-model="state.category_id"
            value-attribute="id"
            option-attribute="name"
            :options="categoryList"
          />
        </UFormGroup>
        <UFormGroup label="Active" name="active">
          <UToggle v-model="state.active" />
        </UFormGroup>
        <UFormGroup label="Offer" name="Offer">
          <UToggle v-model="state.offer" />
        </UFormGroup>
        <UButton
          type="submit"
          :loading="loading"
          class="w-full flex justify-center"
        >
          Register
        </UButton>
      </UForm>
    </div>
  </UModal>
</template>
