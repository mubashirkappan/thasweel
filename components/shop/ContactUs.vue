<script setup lang="ts">
import { z } from 'zod'

const state = reactive({
  phoneNumber: undefined,
  name: undefined,
  email: undefined,
  message: undefined,
})

const schema = z
  .object({
    phoneNumber: z.string(),
    name: z.string().min(2, 'Must be at least 2 characters'),
    email: z.preprocess(val => val === '' ? undefined : val, z.string().email('Invalid email')),
    message: z.string().nullish(),
  })

const unmaskedPhone = ref('')

const loading = ref(false)
const toast = useToast()
const config = useRuntimeConfig()

function submit() {
  loading.value = true
  const body = {
    name: state.name,
    email: state.email,
    phone: Number(unmaskedPhone.value),
    message: state.message || 'Nothing',
  }
  $fetch(`${config.public.apiBaseUrl}/contact-us`, {
    method: 'POST',
    body,
  })
    .then(() => {
      toast.add({ title: 'We will connect you shortly', icon: 'i-heroicons-check-badge', color: 'green' })
      Object.keys(state).forEach(key => (state[key] = undefined))
      unmaskedPhone.value = ''
    })
    .catch((error) => {
      const errorMessage = error?.data?.message || 'An unknown error occurred'
      toast.add({ title: errorMessage, color: 'red', icon: 'i-heroicons-x-circle' })
    })
    .finally(() => {
      loading.value = false
    })
}
defineExpose({ unmaskedPhone })
</script>

<template>
  <div class="flex items-center justify-center p-10">
    <div class="border p-2 rounded-md border-red-500 w-full max-w-[700px] p-10">
      <div class="py-2  text-xl md:text-3xl text-center font-bold">
        Contact Us
      </div>
      <UForm :state="state" class="space-y-4 flex items-center justify-center flex-col w-full " :schema="schema" @submit="submit">
        <UFormGroup label="Phone Number" required name="phoneNumber" class="w-full">
          <UInput v-model="state.phoneNumber" v-maska:unmaskedPhone.unmasked="'##-###-#####'" />
        </UFormGroup>
        <UFormGroup label="Name" required name="name" class="w-full">
          <UInput v-model="state.name" />
        </UFormGroup>
        <UFormGroup label="Email" required name="email" class="w-full">
          <UInput v-model="state.email" />
        </UFormGroup>
        <UFormGroup label="Message" name="message" class="w-full">
          <UTextarea v-model="state.message" />
        </UFormGroup>
        <UButton label="Request a Call Back" :loading size="xl" class="self-end" type="submit" />
      </UForm>
    </div>
  </div>
</template>
