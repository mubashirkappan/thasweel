<script setup lang="ts">
import { z } from 'zod'

const state = reactive({
  phoneNumber: undefined,
  name: undefined,
  // email: undefined,
  message: undefined,
})

const schema = z.object({
  phoneNumber: z.string(),
  name: z.string().min(2, 'Must be at least 2 characters'),
  // email: z.preprocess(val => val === '' ? undefined : val, z.string().email('Invalid email')),
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
    // email: state.email,
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
  <div class="flex items-center justify-center p-4 md:p-10">
    
    <div class="border rounded-md border-red-500 w-full max-w-[600px] px-4 py-6 md:p-10 bg-white">
      
      <div class="pb-4 text-lg md:text-3xl text-center font-bold text-gray-800">
        <!-- Restaurant, cafe, food brand owners contact us -->
         Fooddly Snacks Making Contest
      </div>

      <UForm 
        :state="state" 
        class="space-y-4 flex flex-col w-full" 
        :schema="schema" 
        @submit="submit"
      >
      
      <UFormGroup label="Name" required name="name" class="w-full">
        <UInput v-model="state.name" placeholder="Your Name" />
      </UFormGroup>
      
      <UFormGroup label="Phone Number" required name="phoneNumber" class="w-full">
        <UInput v-model="state.phoneNumber" v-maska:unmaskedPhone.unmasked="'##-###-#####'" placeholder="99-999-99999" />
      </UFormGroup>

        <UFormGroup label="Place and District" name="message" class="w-full">
          <UInput v-model="state.message" placeholder="Place and District" />

          <!-- <UTextarea v-model="state.message" placeholder="Type your message here..." /> -->
        </UFormGroup>

        <!-- label="Request a Call Back"  -->
        <div class="pt-2 w-full flex justify-end">
           <UButton 
             label="Register Now" 
             :loading="loading" 
             size="xl" 
             class="w-full md:w-auto justify-center" 
             type="submit" 
           />
        </div>
      </UForm>
    </div>
  </div>
</template>