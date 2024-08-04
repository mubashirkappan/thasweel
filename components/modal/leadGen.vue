<script setup>
import { z } from 'zod'
import { storeToRefs } from 'pinia'

const props = defineProps({
  custom: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
  },
})
const authStatus = useAuth()
const { signPop, loginPop } = storeToRefs(authStatus)

const state = reactive({
  phoneNumber: undefined,
  email: undefined,
  name: undefined,
  referral: undefined,
  password: undefined,
  confirm_password: undefined,
  is_owner: false,
  isChecked: false,
})

const schema = z
  .object({
    phoneNumber: z.string()
      .refine(val => /^\d+$/.test(val), {
        message: 'Phone number should contain only digits!',
      })
      .refine(val => val.length === 10, {
        message: 'Phone number must be exactly 10 digits!',
      }),
    name: z.string().min(2, 'Must be at least 2 characters'),
    address: z.string,
  })
  .refine(data => data.password === data.confirm_password, {
    message: 'Passwords don\'t match',
    path: ['confirm_password'], // path of error
  })

// function navigateToLogin() {
//   window.location.href = '/?mode=register'
// }

const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()
const showPassword = ref(false)

function submit() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/customer-register`, {
    headers: {
      accept: 'application/json',
    },
    body: {
      phonenumber: state.phoneNumber,
      email: state.email,
      name: state.name,
      password: state.password,
      is_owner: state.is_owner,
      reffered_by: state.referral,
      password_confirmation: state.confirm_password,
      method: 'normal',
    },
    method: 'POST',
  })
    .then((response) => {
      toast.add({ title: response.message, icon: 'i-heroicons-check-badge' })
      signPop.value = false
    })
    .catch(({ data }) => {
      toast.add({ title: data.message, color: 'red', icon: 'i-heroicons-x-circle' })
    })
    .finally(() => {
      loading.value = false
    })
}

const route = useRoute()
if (route.query.code)
  state.referral = route.query.code

function handleSlotClick() {
  loginPop.value = false
  signPop.value = true
}
</script>

<template>
  <UButton
    v-if="!custom"
    class="flex items-center justify-center px-3 text-black transition-colors bg-white border border-black rounded hover:bg-black hover:text-white"
    @click="signPop = true"
  >
    Sign Up
  </UButton>
  <UButton v-else :variant="variant" @click="handleSlotClick">
    <slot />
  </UButton>

  <UModal v-model="signPop">
    <div class="relative pt-0 p-6">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark-20-solid"
        class="-my-1 absolute top-2 right-1"
        @click="signPop = false"
      />
      <div class="py-2 text-3xl text-center font-bold">
        Register Now
      </div>
      <UForm :state="state" class="space-y-4" :schema="schema" @submit="submit">
        <UFormGroup label="Phone Number" required name="phoneNumber">
          <UInput v-model="state.phoneNumber" />
        </UFormGroup>
        <UFormGroup label="Name" required name="name">
          <UInput v-model="state.name" />
        </UFormGroup>
      
       
      </UForm>
      <div class="text-sm font-semibold flex justify-start max-md:flex-col items-center pt-4 gap-x-3">
        Already registered
        <ModalLogin :custom="true" variant="ghost">
          <span class="text-primary">
            Please Log In
          </span>
        </ModalLogin>
      </div>
    </div>
  </UModal>
</template>
