<script setup>
import axios from 'axios'
import { z } from 'zod'

const props = defineProps({
  modelValue: Boolean,
  data: Object,
})
const emit = defineEmits(['update:modelValue', 'submitSuccess'])
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const state = reactive({
  name: undefined,
  username: undefined,
  address: undefined,
  landmark: undefined,
  phoneNumber: undefined,
  email: undefined,
  logo_name: null,
  delivery: false,
  km: null,
  place_id: null,
  take_away: false,
  above_limit: undefined,
  enc_id: false,
})

watch(() => props.data, (newData) => {
  state.name = newData.name
  state.username = newData.slug
  state.address = newData.address
  state.landmark = newData.landmark
  state.phoneNumber = newData.phone
  state.email = newData.email
  state.delivery = (newData.delivery === 1)
  state.km = newData.km
  state.above_limit = newData.above_limit||0
  state.logo_name = null
  state.place_id = newData.place_id
  state.enc_id = newData.encrypt_id
  // state.take_away = (newData.take_away === 1)
  state.take_away = 1
}, { immediate: true })

const schema = z.object({
  name: z.string().min(2, 'Must be at least 2 characters'),
  username: z.string().min(2, 'Must be at least 2 characters').regex(/^\S*$/, 'Username cannot contain spaces'),
  address: z.string().min(2, 'Must be at least 2 characters'),
  landmark: z.string().optional(),
  phoneNumber: z.string()
    .refine(val => /^\d+$/.test(val), {
      message: 'Phone number should contain only digits!',
    })
    .refine(val => val.length === 10, {
      message: 'Phone number must be exactly 10 digits!',
    }),
  place_id: z.any(),
  email: z.preprocess(val => val === '' ? undefined : val, z.string().email('Invalid email')),
  logo_name: z.any().optional(),
  delivery: z.boolean(),
  above_limit: z.number(),
  km: z.number(),  // take_away: z.boolean(),
})

const authStatus = useAuth()
const { token } = storeToRefs(authStatus)
const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()

function changeFile({ target }) {
  state.logo_name = target.files[0]
}
// function checkUsernameAvailabilty() {
//   loading.value = true
//   if (props.data.slug === state.username) {
//     submit()
//     return
//   }
//   $fetch(`${config.public.apiBaseUrl}/check-shop-user-name`, {
//     headers: {
//       Authorization: `Bearer ${token.value}`,
//     },
//     body: {
//       user_name: state.username,
//     },
//     method: 'POST',
//   })
//     .then(() => {
//       submit()
//     })
//     .catch(({ data }) => {
//       toast.add({
//         title: data.message,
//         color: 'red',
//         icon: 'i-heroicons-x-circle',
//       })
//     })
//     .finally(() => {
//       loading.value = false
//     })
// }

async function submit() {
  const formData = new FormData()
  formData.append('name', state.name)
  formData.append('user_name', state.username)
  formData.append('address', state.address)
  formData.append('landmark', state.landmark)
  formData.append('country_code', '+91')
  formData.append('phone', state.phoneNumber)
  formData.append('email', state.email)
  formData.append('logo', state.logo_name)
  formData.append('encrypted_id', state.enc_id)
  formData.append('place_id', state.place_id)
  formData.append('delivery', state.delivery ? 1 : 0)
  formData.append('km', state.km || 0)
  formData.append('take_away', state.take_away ? 1 : 1)
  formData.append('free_delivery_above', state.delivery === true ? state.above_limit : 0)
  formData.append('type_id', 1)
  loading.value = true

  try {
    const response = await axios.post(`${config.public.apiBaseUrl}/shop/update`, formData, {
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
const placeList = ref()

async function fetchLocation() {
  loading.value = true
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/places-list`)
    if (!response.ok)
      throw new Error('Failed to fetch places list')
    const data = await response.json()
    placeList.value = data.data
  }
  catch (error) {
    toast.add({ title: error.message, color: 'red', icon: 'i-heroicons-x-circle' })
  }
  finally {
    loading.value = false
  }
}
onMounted(() => {
  fetchLocation()
})
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
        Register Your Shop Now
      </div>
      <UForm :state="state" class="space-y-4" :schema="schema" @submit="submit">
        <UFormGroup label="Shop Name" required name="name">
          <UInput v-model="state.name" />
        </UFormGroup>
        <!-- <UFormGroup label="Shop Unique Name" disabled description="This will be used for your sharable Link" required name="username">
          <UInput v-model="state.username" disabled />
        </UFormGroup> -->
        <UFormGroup label="Location" required name="location">
          <USelectMenu
            v-model="state.place_id"
            value-attribute="id"
            option-attribute="place"
            :options="placeList"
          />
        </UFormGroup>
        <UFormGroup label="Address" required name="address">
          <UTextarea v-model="state.address" />
        </UFormGroup>
        <UFormGroup label="Landmark" name="landmark">
          <UInput v-model="state.landmark" />
        </UFormGroup>
        <UFormGroup label="Phone Number" required name="phoneNumber">
          <UInput v-model="state.phoneNumber" />
        </UFormGroup>
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" />
        </UFormGroup>
        <UFormGroup label="Logo" required name="logo">
          <input type="file" @change="changeFile">
        </UFormGroup>
        <UFormGroup label="Delivery" name="delivery">
          <UToggle v-model="state.delivery" />
        </UFormGroup>
        <UFormGroup v-if="state.delivery" label="Radius that you can Delivery" name="km">
          <UInput v-model="state.km" type="number" />
        </UFormGroup>
        <UFormGroup v-if="state.delivery" label="Minimum amount Needed to free Delivery" description="If its fully free make it 0" name="above_limit">
          <UInput v-model="state.above_limit" type="number" />
        </UFormGroup>
        <!-- <UFormGroup label="Take Away" name="take_away">
          <UToggle v-model="state.take_away" disabled />
        </UFormGroup> -->
        <UButton
          type="submit"
          :loading="loading"
          class="w-full flex justify-center"
        >
          Edit Shop
        </UButton>
      </UForm>
    </div>
  </UModal>
</template>
