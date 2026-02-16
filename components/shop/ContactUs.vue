<script setup lang="ts">
import { z } from 'zod'

const state = reactive({
  phoneNumber: undefined,
  name: undefined,
  message: undefined,
})

const schema = z.object({
  phoneNumber: z.string(),
  name: z.string().min(2, 'Must be at least 2 characters'),
  message: z.string().nullish(),
})

const unmaskedPhone = ref('')
const loading = ref(false)
const toast = useToast()
const config = useRuntimeConfig()

// New state to track if submission was successful
const success = ref(false)

function submit() {
  loading.value = true
  const body = {
    name: state.name,
    phone: Number(unmaskedPhone.value),
    message: state.message || 'Nothing',
  }
  
  $fetch(`${config.public.apiBaseUrl}/contact-us`, {
    method: 'POST',
    body,
  })
    .then(() => {
      // 1. Show the success UI
      success.value = true
      
      // 2. Clear the data
      Object.keys(state).forEach(key => (state[key] = undefined))
      unmaskedPhone.value = ''
      
      // Optional: Keep the toast if you want double confirmation
      toast.add({ title: 'Registration Successful!', icon: 'i-heroicons-check-badge', color: 'green' })
    })
    .catch((error) => {
      const errorMessage = error?.data?.message || 'An unknown error occurred'
      toast.add({ title: errorMessage, color: 'red', icon: 'i-heroicons-x-circle' })
    })
    .finally(() => {
      loading.value = false
    })
}

// Function to reset the form if they want to register another person
function resetForm() {
  success.value = false
}

defineExpose({ unmaskedPhone })
</script>

<template>
  <div class="flex items-center justify-center p-10">
    <div class="border  rounded-md border-red-500 w-full max-w-[700px] px-3 py-4 md:p-10">
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

<style scoped>
/* Simple fade animation */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>