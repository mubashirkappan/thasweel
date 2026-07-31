<script setup>
import { z } from 'zod'
import { useCartStore } from '/composables/cartData'
import { watchEffect } from 'vue'

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

const cartStore = useCartStore()

watchEffect(() => {
  if (props.shopDetails?.id) {
    cartStore.initShopCart(props.shopDetails.id)
  }
})

const unmaskedPhone = ref('')
const leadGen = ref(false)

const state = reactive({
  phoneNumber: undefined,
  name: undefined,
  address: null,
  deliveryDate: undefined
})

const schema = z.object({
  phoneNumber: z.string().min(5, 'Invalid phone number'),
  name: z.string().min(2, 'Must be at least 2 characters'),
  address: z.string().nullish(),
})

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
      leadGen.value = false
    
      const cleanCC = String(props.shopDetails.country_code).replace(/\D/g, '')
      const cleanPhone = String(props.shopDetails.phone).replace(/\D/g, '')

      setTimeout(() => {
        const whatsappLink = `https://wa.me/${cleanCC}${cleanPhone}?text=${encodeURIComponent(message)}`
        window.open(whatsappLink, '_blank')
        loading.value = false
      }, 1000)
    })
    .catch((error) => {
      console.error('Failed to submit order:', error)
      const errorMessage = error?.data?.message || 'An unknown error occurred'
      toast.add({ title: errorMessage, color: 'red', icon: 'i-heroicons-x-circle' })
    })
    .finally(() => {
      loading.value = false
    })
}

function generateMessage(data) {
  const phone = unmaskedPhone.value || state.phoneNumber 
  const deliveryTime = state.deliveryDate ? state.deliveryDate.replace('T', ' ') : 'As soon as possible'

  let message = `Hi, I would like to place the following order:\n\n`
  message += `*Name:* ${state.name}\n`
  message += `*Phone:* ${phone}\n`
  message += `*Address:* ${state.address}\n`
  message += `*Delivery Time:* ${deliveryTime}\n\n`
  
  data.items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`
    message += `   - Qty: ${item.quantity}\n`
    message += `   - Price: ${cartStore.getCurrency}${Number(item.totalPrice).toFixed(2)}\n\n`
  })
  
  message += `*Total Price: ${cartStore.getCurrency}${Number(data.total_price).toFixed(2)}*\n\n`
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
    <div class="relative p-4">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark-20-solid"
        class="-my-1 absolute top-2 right-1"
        @click="leadGen = false"
      />
      <div class="py-2 text-xl md:text-3xl text-center font-bold">
        Check Out
      </div>
      
      <div class="grid md:grid-cols-2 gap-3 md:gap-10">
        <!-- Items Column -->
 <!-- Items Column -->
<div class="border border-red-500 rounded-xl p-4 md:my-3">
  <div class="text-lg md:text-xl font-semibold mb-2">
    Items List
  </div>
  
  <!-- Scrollable Items Container Wrapper -->
  <div class="flex flex-col max-h-[250px] md:max-h-[calc(100%-50px)] md:h-full overflow-y-auto w-full py-1 divide-y divide-gray-100">
    <div v-for="item in cartStore.itemsWithPrices" :key="item.name" class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
      <!-- Item Name Box -->
      <span class="font-medium text-gray-800 text-sm md:text-base break-words max-w-full sm:max-w-[60%]">
        {{ item.name }}
      </span>
      
      <!-- Responsive Calculations Box (Switches positions elegantly on mobile) -->
      <div class="text-xs md:text-sm text-gray-500 font-mono text-left sm:text-right whitespace-nowrap">
        {{ item.quantity }} x {{ Number(item.pricePerItem).toFixed(2) }} = 
        <span class="font-semibold text-gray-900">{{ Number(item.totalPrice).toFixed(2) }}</span>
      </div>
    </div>
  </div> 
  
  <UDivider size="lg" type="dotted" class="my-3" />
  
  <!-- Grand Total Block -->
  <div class="flex justify-between w-full pt-1 text-sm md:text-base">
    <span class="font-semibold text-gray-900">Total</span>
    <div class="font-bold text-gray-900 font-mono">
      {{ cartStore.getCurrency }} {{ Number(cartStore.totalAmount).toFixed(2) }}
    </div>
  </div>
</div>
        
        <!-- Form Column -->
        <div class="border border-red-500 rounded-xl p-4 md:my-3 flex flex-col items-center justify-center">
          <UForm :state="state" class="space-y-4 flex items-center justify-center flex-col w-full" :schema="schema" @submit="submit">
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