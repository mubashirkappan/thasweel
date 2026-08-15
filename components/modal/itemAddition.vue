<script setup>
import axios from 'axios'
import { z } from 'zod'

const props = defineProps({ modelValue: Boolean, shopId: Number, categoryList: Array })
const emit = defineEmits(['update:modelValue', 'submitSuccess'])
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const unitOptions = [
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Pound (lb)', value: 'lb' },
  { label: 'Ounce (oz)', value: 'oz' },
  { label: 'Piece (pcs)', value: 'pcs' },
  { label: 'Dozen (12 pcs)', value: 'dozen' },
  { label: 'Half Dozen (6 pcs)', value: 'half dozen' },
  { label: 'Slice', value: 'slice' },
  { label: 'Portion', value: 'portion' },
  { label: 'Tray / Platter', value: 'tray' },
  { label: 'Litre (L)', value: 'litre' },
  { label: 'Millilitre (ml)', value: 'ml' },
  { label: 'Box', value: 'box' },
  { label: 'Pack', value: 'pack' },
  { label: 'Jar', value: 'jar' },
  { label: 'Bottle', value: 'bottle' },
  { label: 'Can', value: 'can' },
  { label: 'Set / Combo', value: 'set' },
  { label: 'Custom Unit...', value: 'custom' },
]

const state = reactive({
  name: undefined,
  price: undefined,
  dibi_price: undefined,
  count: undefined,
  unit_type: 'kg',
  unit_value: 1,
  custom_unit: '',
  category_id: undefined,
  image: null,
  active: true,
  offer: false,
  allow_note: true,
  amount: undefined,
})
const schema = z.object({
  name: z.string().min(2, 'Must be at least 2 characters'),
  price: z.coerce.number().positive("Price must be a positive number"),
  dibi_price: z.coerce.number().positive("Price must be a positive number"),
  image: z.any(),
  count: z.number(),
  active: z.boolean(),
  offer: z.boolean(),
  allow_note: z.boolean().optional(),
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
const initialState = {
  name: '',
  price: '',
  dibi_price: '',
  count: '',
  unit_type: 'kg',
  unit_value: 1,
  custom_unit: '',
  image: null,
  category_id: null,
  active: true,
  offer: false,
  allow_note: true
}
async function submit() {
  const constructedUnit = state.unit_type === 'custom'
    ? (state.custom_unit || '1 pc')
    : `${state.unit_value || 1} ${state.unit_type}`

  const formData = new FormData()
  formData.append('name', state.name)
  formData.append('price', state.price)
  formData.append('dibi_price', state.dibi_price)
  formData.append('image', state.image)
  formData.append('count', state.count)
  formData.append('unit_type', state.unit_type)
  formData.append('unit_value', state.unit_value || 1)
  formData.append('unit', constructedUnit)
  formData.append('shop_id', props.shopId)
  formData.append('category_id', state.category_id)
  formData.append('active', state.active ? 1 : 0)
  formData.append('offer', state.offer ? 1 : 0)
  formData.append('allow_note', state.allow_note ? 1 : 0)

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
    Object.assign(state, initialState)
    isOpen.value = false
  }
  catch (error) {
    toast.add({ title: error?.response?.data?.message || 'Error creating item', color: 'red', icon: 'i-heroicons-x-circle' })
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
          <UInput v-model="state.name" placeholder="e.g. Chocolate Cake" />
        </UFormGroup>
        
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Price" required name="price">
            <UInput v-model="state.price" type="number" step="0.001" />
          </UFormGroup>
          <UFormGroup label="Discounted Price" description="Actual Selling Price" required name="dibi_price">
            <UInput v-model="state.dibi_price" type="number" step="0.001" />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <UFormGroup label="Unit Size / Quantity" required name="unit_value" description="e.g. 1, 0.5, 500">
            <UInput v-model="state.unit_value" type="text" placeholder="1" />
          </UFormGroup>
          <UFormGroup label="Unit Type" required name="unit_type">
            <USelectMenu
              v-model="state.unit_type"
              value-attribute="value"
              option-attribute="label"
              :options="unitOptions"
            />
          </UFormGroup>
          <div v-if="state.unit_type === 'custom'" class="col-span-2">
            <UFormGroup label="Specify Custom Unit" required name="custom_unit">
              <UInput v-model="state.custom_unit" placeholder="e.g. 1 Box of 6" />
            </UFormGroup>
          </div>
        </div>

        <UFormGroup label="Available Stock Count" required name="count">
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
        <UFormGroup label="Allow Customer Note / Special Instructions" name="allow_note">
          <UToggle v-model="state.allow_note" />
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
