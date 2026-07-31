<script setup>
import { z } from 'zod'
import { useCartStore } from '/composables/cartData'

const props = defineProps({
  custom: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
  },
  shopDetails: {
    type: Object,
  },
})

const unmaskedPhone = ref('')
const leadGen = ref(false)
const cartStore = useCartStore()

const state = reactive({
  phoneNumber: undefined,
  name: undefined,
  address: null,
})

const schema = z
  .object({
    phoneNumber: z.string(),
    name: z.string().min(2, 'Must be at least 2 characters'),
    address: z.string().nullish(),
  })

// const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()
const config = useRuntimeConfig()
function submit() {
  loading.value = true
  const whatsappWindow = window.open('', '_blank');
  const body = {
    phonenumber: unmaskedPhone.value,
    name: state.name,
    address: state.address || 'Nothing',
    delivery_time: state.deliveryDate || 'Not specified',
    items: cartStore.itemsWithPrices,
    total_price: cartStore.totalAmount,
    shop_id: props.shopDetails.id,
  }

$fetch(`${config.public.apiBaseUrl}/order`, {
  method: 'POST',
  body,
})
  .then((response) => {
    toast.add({ title: response.message, icon: 'i-heroicons-check-badge', color: 'green' })
    const message = generateMessage(body)
    cartStore.$reset()
  
    const cleanCC = String(props.shopDetails.country_code).replace(/\D/g, '')
    const cleanPhone = String(props.shopDetails.phone).replace(/\D/g, '')

    const whatsappLink = `https://wa.me/${cleanCC}${cleanPhone}?text=${encodeURIComponent(message)}`
    
    // 2. Update the pre-opened window's location instead of calling window.open again inside setTimeout
    whatsappWindow.location.href = whatsappLink;
    
    loading.value = false
  })
  .catch((error) => {
    // 3. If it fails, close the blank window we opened earlier
    whatsappWindow.close();
    
    console.error('Failed to submit order:', error)
    const errorMessage = error?.data?.message || 'An unknown error occurred'
    toast.add({ title: errorMessage, color: 'red', icon: 'i-heroicons-x-circle' })
  })
  .finally(() => {
    loading.value = false
  })
}

function generateMessage(data) {
  // Use a clean phone number (no spaces or dashes)
  const phone = unmaskedPhone.value || state.phoneNumber 
  // Optional: Format the date to be more readable
  const deliveryTime = state.deliveryDate ? state.deliveryDate.replace('T', ' ') : 'As soon as possible'

  let message = `Hi, I would like to place the following order:\n\n`
  message += `*Name:* ${state.name}\n`
  message += `*Phone:* ${phone}\n`
  message += `*Address:* ${state.address}\n`
  message += `*Delivery Time:* ${deliveryTime}\n\n`
  
  data.items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`
    message += `   - Qty: ${item.quantity}\n`
    message += `   - Price: ${cartStore.getCurrency}${item.totalPrice}\n\n`
  })
  
  message += `*Total Price: ${cartStore.getCurrency}${data.total_price}*\n\n`
  message += 'Please confirm the order. Thank you!'
  return message
}
defineExpose({ unmaskedPhone })

function handleSlotClick() {
  leadGen.value = true
}
</script>

<template>
  <UButton
    v-if="!custom"
    class="flex items-center justify-center px-3 text-black transition-colors bg-white border border-black rounded hover:bg-black hover:text-white"
    @click="leadGen = true"
  >
    Sign Up
  </UButton>
  <UButton v-else :variant="variant" @click="handleSlotClick">
    <slot />
  </UButton>

  <UModal v-model="leadGen" :ui="{ width: 'sm:max-w-[1000px]' }">
    <div class="relative  p-4">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark-20-solid"
        class="-my-1 absolute top-2 right-1"
        @click="leadGen = false"
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
              {{ cartStore.getCurrency }} {{ cartStore.totalAmount }}
            </div>
          </div>
        </div>
        <div class="border border-red-500  rounded-xl p-4 md:my-3 flex flex-col items-center justify-center">
          <UForm :state="state" class="space-y-4 flex items-center justify-center flex-col w-full " :schema="schema" @submit="submit">
            <UFormGroup label="Phone Number" required name="phoneNumber" class="w-full">
              <UInput v-model="state.phoneNumber" v-maska:unmaskedPhone.unmasked="'##-###-#####'" />
            </UFormGroup>
            <UFormGroup label="Name" required name="name" class="w-full">
              <UInput v-model="state.name" />
            </UFormGroup>
            <UFormGroup label="Address" name="address" class="w-full">
              <UInput v-model="state.address" />
            </UFormGroup>
            <UFormGroup label="Delivery Date & Time" name="deliveryDate" class="w-full">
              <UInput 
                v-model="state.deliveryDate" 
                type="datetime-local" 
                :min="new Date().toISOString().slice(0, 16)"
              />
            </UFormGroup>
            <UButton label="Buy Now and Send Message" :loading size="xl" class="self-end" type="submit" />
          </UForm>
        </div>
      </div>
    </div>
  </UModal>
</template>
