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
  <div class="flex items-center justify-center p-4 md:p-10">
    
    <div class="border rounded-md border-red-500 w-full max-w-[600px] px-4 py-6 md:p-10 bg-white transition-all duration-300">
      
      <div class="pb-4 text-lg md:text-3xl text-center font-bold text-gray-800">
         Fooddly Snacks Making Contest
      </div>

      <div v-if="success" class="flex flex-col items-center justify-center py-10 space-y-4 animate-fade-in">
        <div class="bg-green-100 p-4 rounded-full">
          <UIcon name="i-heroicons-check-circle-solid" class="text-6xl text-green-600" />
        </div>
        <h2 class="text-2xl font-bold text-green-700 text-center">Registration Completed!</h2>
        <p class="text-gray-600 text-center max-w-xs">
          Thank you, {{ state.name || 'participant' }}. We have received your details and will connect with you shortly.
        </p>
        
        <UButton 
          variant="outline" 
          color="gray" 
          class="mt-6" 
          label="Register Another Person" 
          @click="resetForm" 
        />
      </div>

      <UForm 
        v-else
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
        </UFormGroup>

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