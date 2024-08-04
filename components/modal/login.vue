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

const state = reactive({
  identifier: undefined,
  password: undefined,
})
const schema = z
  .object({
    identifier: z.string().refine((val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      const isPhoneNumber = /^\d{10}$/.test(val)
      return isEmail || isPhoneNumber
    }, {
      message: 'Must be a valid email or a 10-digit phone number',
    }),
    password: z.string().min(8, 'Must be at least 8 characters'),
  })

const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()
const showPassword = ref(false)

const authStatus = useAuth()
const { loggedIn, signPop, loginPop, token, isOwner, ItemsCount } = storeToRefs(authStatus)

const data = ref()

function submit() {
  loading.value = true
  $fetch(`${config.public.apiBaseUrl}/customer-login`, {
    headers: {
      accept: 'application/json',
    },
    body: {
      identifier: state.identifier,
      password: state.password,
      method: 'normal',
    },
    method: 'POST',
  })
    .then((response) => {
      data.value = response.data
      ItemsCount.value = data.value.total_items
      loginPop.value = false
      loggedIn.value = true
      token.value = data.value.token
      isOwner.value = data.value.is_owner
    })
    .catch(({ data }) => {
      toast.add({ title: data.message, color: 'red', icon: 'i-heroicons-x-circle' })
    })
    .finally(() => {
      loading.value = false
    })
}
function handleSlotClick() {
  loginPop.value = true
  signPop.value = false
}
</script>

<template>
  <UButton
    v-if="!custom"
    class="flex items-center justify-center px-3 text-white transition-colors border rounded border-primary bg-primary hover:bg-white hover:text-primary"
    @click="loginPop = true"
  >
    Log In
  </UButton>
  <UButton v-else :variant="variant" @click="handleSlotClick">
    <slot />
  </UButton>
  <UModal v-model="loginPop">
    <div class="relative pt-0 p-6">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark-20-solid"
        class="-my-1 absolute top-2 right-1"
        @click="loginPop = false"
      />
      <div class="py-2 text-3xl text-center font-bold">
        Log in
      </div>
      <UForm :state="state" class="space-y-4" :schema="schema" @submit="submit">
        <UFormGroup label="Phone Number/ Email Address" name="identifier" required>
          <UInput v-model="state.identifier" />
        </UFormGroup>
        <div />
        <UFormGroup label="Password" name="password" required>
          <div class="relative">
            <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'" />
            <Icon
              :name="showPassword ? 'i-mdi-eye-outline' : 'i-mdi-eye-off-outline'"
              class="absolute transform -translate-y-1/2 cursor-pointer top-1/2 right-3"
              @click="showPassword = !showPassword"
            />
          </div>
        </UFormGroup>
        <UButton
          type="submit"
          :loading="loading"
          class="w-full flex justify-center"
        >
          Log In
        </UButton>
      </UForm>
      <div class="text-sm font-semibold flex justify-start max-md:flex-col items-center pt-4 gap-x-3">
        Don't have an account?
        <ModalRegister :custom="true" variant="ghost">
          <span class="text-primary">
            Create an account
          </span>
        </ModalRegister>
      </div>
    </div>
  </UModal>
</template>
