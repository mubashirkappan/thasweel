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

const showWhatsAppModal = ref(false)
const pendingWhatsAppMessage = ref('')
const shopPhone = ref('')

function submit() {
  loading.value = true

  const body = {
    phonenumber: unmaskedPhone.value,
    name: state.name,
    address: state.address || 'Nothing',
    delivery_time: state.deliveryDate || 'Not specified',
    items: cartStore.itemsWithPrices,
    total_price: cartStore.totalAmount,
    shop_id: props.shopDetails?.id,
  }

  $fetch(`${config.public.apiBaseUrl}/order`, {
    method: 'POST',
    body,
  })
    .then((response) => {
      toast.add({ title: response.message || 'Order placed successfully', icon: 'i-heroicons-check-badge', color: 'green' })
      const message = generateMessage(body)
      leadGen.value = false
    
      const cleanCC = String(props.shopDetails?.country_code || '').replace(/\D/g, '')
      const cleanPhone = String(props.shopDetails?.phone || '').replace(/\D/g, '')

      pendingWhatsAppMessage.value = message
      shopPhone.value = `${cleanCC}${cleanPhone}`
      showWhatsAppModal.value = true
    })
    .catch((error) => {
      console.error('Failed to submit order:', error)
      const errorMessage = error?.data?.message || 'An unknown error occurred'
      toast.add({ title: errorMessage, color: 'red', icon: 'i-heroicons-x-circle' })

      // Close modal and redirect to home on critical failures to prevent blank or broken views
      leadGen.value = false
      navigateTo('/')
    })
    .finally(() => {
      loading.value = false
    })
}

function closeWhatsAppModal() {
  showWhatsAppModal.value = false
  cartStore.$reset()
}

function openWhatsApp(targetType) {
  const phone = shopPhone.value
  const text = encodeURIComponent(pendingWhatsAppMessage.value)
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)

  let link = ''
  if (targetType === 'standard') {
    if (isAndroid) {
      link = `intent://send?phone=${phone}&text=${text}#Intent;scheme=whatsapp;package=com.whatsapp;end`
    } else {
      link = `https://api.whatsapp.com/send?phone=${phone}&text=${text}`
    }
  } else if (targetType === 'business') {
    if (isAndroid) {
      link = `intent://send?phone=${phone}&text=${text}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`
    } else {
      link = `https://api.whatsapp.com/send?phone=${phone}&text=${text}`
    }
  } else if (targetType === 'web') {
    link = `https://web.whatsapp.com/send?phone=${phone}&text=${text}`
  } else {
    // Default wa.me universal link
    link = `https://wa.me/${phone}?text=${text}`
  }

  showWhatsAppModal.value = false
  cartStore.$reset()

  if (targetType === 'web' || !isAndroid) {
    const win = window.open(link, '_blank')
    if (!win) {
      window.location.href = link
    }
  } else {
    window.location.href = link
  }
}

function generateMessage(data) {
  const phone = unmaskedPhone.value || state.phoneNumber 
  const deliveryTime = state.deliveryDate ? state.deliveryDate.replace('T', ' ') : 'As soon as possible'

  let message = `Hi, I would like to place the following order:\n\n`
  message += `*Name:* ${state.name}\n`
  message += `*Phone:* ${phone}\n`
  message += `*Address:* ${state.address || 'N/A'}\n`
  message += `*Delivery Time:* ${deliveryTime}\n\n`
  
  data.items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*`
    if (item.unit) message += ` (${item.unit})`
    message += `\n`
    message += `   - Qty: ${item.quantity}\n`
    
    if (item.preparation_preference) {
      if (item.preparation_preference === 'single_combined') {
        message += `   - Fulfillment: 1 Single Combined Piece (Total weight)\n`
      } else if (item.quantity > 1) {
        message += `   - Fulfillment: ${item.quantity} Separate Items\n`
      }
    }

    if (item.item_note && String(item.item_note).trim()) {
      message += `   - Note: ${String(item.item_note).trim()}\n`
    }

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
  <div>
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
          <div class="border border-red-500 rounded-xl p-4 md:my-3">
            <div class="text-lg md:text-xl font-semibold mb-2">
              Items List
            </div>
            
            <!-- Scrollable Items Container Wrapper -->
            <div class="flex flex-col max-h-[250px] md:max-h-[calc(100%-50px)] md:h-full overflow-y-auto w-full py-1 divide-y divide-gray-100">
              <div v-for="item in cartStore.itemsWithPrices" :key="item.name" class="flex flex-col py-2 gap-1">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <!-- Item Name Box -->
                  <span class="font-medium text-gray-800 text-sm md:text-base break-words max-w-full sm:max-w-[60%]">
                    {{ item.name }}
                    <span v-if="item.unit" class="text-xs text-gray-500 font-normal">({{ item.unit }})</span>
                  </span>
                  
                  <!-- Responsive Calculations Box -->
                  <div class="text-xs md:text-sm text-gray-500 font-mono text-left sm:text-right whitespace-nowrap">
                    {{ item.quantity }} x {{ Number(item.pricePerItem).toFixed(2) }} = 
                    <span class="font-semibold text-gray-900">{{ Number(item.totalPrice).toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Preferences & Notes Preview -->
                <div v-if="item.preparation_preference || item.item_note" class="text-xs text-gray-600 flex flex-col gap-0.5 pl-2 border-l-2 border-primary/40 mt-1">
                  <span v-if="item.preparation_preference === 'single_combined'" class="text-purple-700 font-medium">
                    Pref: 1 Single Combined Piece
                  </span>
                  <span v-else-if="item.quantity > 1 && item.preparation_preference === 'separate'" class="text-amber-700 font-medium">
                    Pref: {{ item.quantity }} Separate Items
                  </span>
                  <span v-if="item.item_note" class="italic text-gray-500">
                    Note: {{ item.item_note }}
                  </span>
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

    <!-- WhatsApp Destination Choice Modal -->
    <UModal v-model="showWhatsAppModal" prevent-close :ui="{ width: 'sm:max-w-[480px]' }">
      <div class="relative p-6 flex flex-col items-center text-center space-y-4 bg-white rounded-xl">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1 absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
          @click="closeWhatsAppModal"
        />
        <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm mt-2">
          <Icon name="ic:baseline-whatsapp" class="text-4xl" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900">Order Placed Successfully! 🎉</h3>
          <p class="text-xs text-gray-500 mt-1">Select which WhatsApp application you want to open:</p>
        </div>

        <div class="w-full flex flex-col gap-2.5 pt-2">
          <UButton
            size="lg"
            variant="solid"
            class="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 font-medium py-3 rounded-lg shadow-sm"
            @click="openWhatsApp('standard')"
          >
            <Icon name="ic:baseline-whatsapp" class="text-2xl" />
            <span>Open in Standard WhatsApp</span>
          </UButton>

          <UButton
            size="lg"
            variant="solid"
            class="w-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 font-medium py-3 rounded-lg shadow-sm"
            @click="openWhatsApp('business')"
          >
            <Icon name="lucide:building-2" class="text-2xl" />
            <span>Open in WhatsApp Business</span>
          </UButton>

          <UButton
            size="lg"
            variant="soft"
            color="gray"
            class="w-full flex items-center justify-center gap-2 font-medium py-2.5 rounded-lg"
            @click="openWhatsApp('web')"
          >
            <Icon name="lucide:globe" class="text-xl" />
            <span>Open in WhatsApp Web (Browser)</span>
          </UButton>

          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600 underline pt-2 cursor-pointer"
            @click="openWhatsApp('default')"
          >
            Use Default Link (wa.me)
          </button>
        </div>
      </div>
    </UModal>
  </div>
</template>