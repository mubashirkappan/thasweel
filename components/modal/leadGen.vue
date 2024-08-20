<script setup>
import { z } from 'zod'
import { storeToRefs } from 'pinia'
import { useCartStore } from '/composables/cartData'

const props = defineProps({
  custom: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
  },
})
const cartStore = useCartStore()

const authStatus = useAuth()
const { signPop, loginPop } = storeToRefs(authStatus)

const state = reactive({
  phoneNumber: undefined,
  name: undefined,
  address: undefined,
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
    address: z.string(),
  })

// const config = useRuntimeConfig()
const loading = ref(false)
// const toast = useToast()

async function submit() {
  loading.value = true
  const body = {
    phonenumber: state.phoneNumber,
    name: state.name,
    address: state.address,
    items: cartStore.itemsWithPrices,
  }
  console.log(body)

  try {
    await navigator.clipboard.writeText(JSON.stringify(body))
    console.log('Copied to clipboard successfully!')
  }
  catch (err) {
    console.error('Failed to copy to clipboard: ', err)
  }
  finally {
    loading.value = false
  }
}

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

  <UModal v-model="signPop" :ui="{ width: 'sm:max-w-[1000px]' }">
    <div class="relative  p-4">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark-20-solid"
        class="-my-1 absolute top-2 right-1"
        @click="signPop = false"
      />
      <div class="py-2  text-xl md:text-3xl text-center font-bold">
        Check Out
      </div>
      <div class="grid md:grid-cols-2 gap-3 md:gap-10">
        <div class="border border-red-500  rounded-xl p-4 md:my-3">
          <div class=" text-lg md:text-xl font-semibold ">
            Items List
          </div>
          <div class="flex flex-col max-h-[200px] md:max-h-[calc(100%-50px)] md:h-full overflow-scroll w-full py-3">
            <div v-for="item in cartStore.itemsWithPrices" :key="item" class="flex justify-between w-full">
              <span>
                {{ item.name }}
              </span>
              <div>
                {{ item.quantity }} x {{ item.pricePerItem }}={{ item.totalPrice }}
              </div>
            </div>
          </div>
          <UDivider size="lg" type="dotted" />
          <div class="flex justify-between w-full">
            <span>
              Total
            </span>
            <div>
              {{ cartStore.totalAmount }}
            </div>
          </div>
        </div>
        <div class="border border-red-500  rounded-xl p-4 md:my-3 flex flex-col items-center justify-center">
          <UForm :state="state" class="space-y-4 flex items-center justify-center flex-col w-full " :schema="schema" @submit="submit">
            <UFormGroup label="Phone Number" required name="phoneNumber" class="w-full">
              <UInput v-model="state.phoneNumber" />
            </UFormGroup>
            <UFormGroup label="Name" required name="name" class="w-full">
              <UInput v-model="state.name" />
            </UFormGroup>
            <UFormGroup label="Address" name="address" class="w-full">
              <UInput v-model="state.address" />
            </UFormGroup>
            <UButton label="Buy Now and Send Message" size="xl" class="self-end" type="submit" />
          </UForm>
        </div>
      </div>
    </div>
  </UModal>
</template>
