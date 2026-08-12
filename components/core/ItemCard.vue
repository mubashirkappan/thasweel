<script setup>
import { useCartStore } from '/composables/cartData'

const props = defineProps({
  data: Object,
  shopId: [Number, String],
})

const cartStore = useCartStore()
const loading = ref(false)
const toast = useToast()
const count = ref({})
const preparationPref = ref({})
const itemNote = ref({})

function syncWithCart() {
  if (props.data) {
    Object.keys(props.data).forEach((key) => {
      const item = props.data[key]
      const existingInCart = cartStore.cartItems.find(i => i.name === item.name)
      if (existingInCart) {
        count.value[key] = existingInCart.count
        preparationPref.value[key] = existingInCart.preparation_preference || 'separate'
        itemNote.value[key] = existingInCart.item_note || ''
      } else {
        if (!count.value[key]) count.value[key] = 1
        if (!preparationPref.value[key]) preparationPref.value[key] = 'separate'
        if (itemNote.value[key] === undefined) itemNote.value[key] = ''
      }
    })
  }
}

onMounted(() => {
  syncWithCart()
})

watch(() => cartStore.cartItems, () => {
  syncWithCart()
}, { deep: true })

watch(() => props.data, () => {
  syncWithCart()
}, { deep: true })

function getItemUnitLabel(item) {
  if (item.unit) return item.unit;
  if (item.unit_value && item.unit_type) return `${item.unit_value} ${item.unit_type}`;
  return '1 pc';
}

function isWeightBased(item) {
  const unitStr = typeof item === 'string' ? item : (item?.unit || item?.unit_type || '');
  if (!unitStr) return false;
  return /(\bkg\b|\bg\b|\blb\b|\boz\b|kilo|gram|pound|ounce)/i.test(unitStr);
}

function submit(item, quantity, price, key) {
  loading.value = true
  if (quantity < 1) {
    toast.add({ timeout: 1500, title: 'Cart item count must be greater than or equal to 1', color: 'red', icon: 'i-heroicons-x-circle' })
    loading.value = false
    return
  }

  const unit = getItemUnitLabel(item)
  const pref = preparationPref.value[key] || 'separate'
  const note = itemNote.value[key] || ''
  const existingItem = cartStore.cartItems.find(i => i.name === item.name)

  if (existingItem) {
    if (existingItem.count === quantity && existingItem.preparation_preference === pref && existingItem.item_note === note) {
      toast.add({ timeout: 1500, title: 'Item already in cart with same preferences', color: 'red', icon: 'i-heroicons-x-circle' })
      loading.value = false
      return
    }
  }

  cartStore.addItem(item.name, quantity, price, props.shopId, unit, pref, note)
  
  if (existingItem)
    toast.add({ timeout: 1500, title: 'Cart updated', color: 'green', icon: 'i-heroicons-check-badge' })
  else
    toast.add({ timeout: 1500, title: 'Item added to cart', color: 'green', icon: 'i-heroicons-check-badge' })
  
  loading.value = false
}

function removeItem(itemName) {
  cartStore.removeItem(itemName)
  toast.add({ timeout: 1500, title: 'Item removed from cart', color: 'green', icon: 'i-heroicons-check-badge' })
}

function isInCart(itemName) {
  return cartStore.cartItems.some(i => i.name === itemName)
}
</script>

<template>
  <template v-for="(item, key) in data" :key="item.id">
    <div v-if="item.active" class="flex flex-col p-4 sm:p-5 border border-gray-200 rounded-xl max-w-[400px] w-full mx-auto bg-white shadow-sm hover:shadow-md transition-shadow h-full justify-between">
      <div>
        <div class="max-h-[150px] h-[150px] overflow-hidden relative rounded-lg bg-gray-50 flex items-center justify-center">
          <img :src="item.image_name" class="object-contain max-h-[150px] w-full h-full" :alt="item.image_name">
          <div v-if="item.unit || item.unit_type" class="absolute top-1 right-1 bg-primary/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            {{ getItemUnitLabel(item) }}
          </div>
        </div>
        <div class="flex flex-col justify-between mt-2">
          <div>
            <div class="text-base font-semibold text-[#253D4E] flex items-center justify-between gap-2">
              <span class="truncate">{{ item.name }}</span>
            </div>
            <div v-if="item.description" class="text-sm font-medium py-1.5 text-gray-500 line-clamp-2">
              {{ item.description }}
            </div>
          </div>
          <div class="flex flex-col gap-2.5 pb-2 mt-2">
            <CoreCounter v-model="count[key]" />

            <!-- Preparation Choice for Quantity > 1 (Weight-based items only) -->
            <div v-if="count[key] > 1 && isWeightBased(item)" class="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-xs space-y-1.5">
              <span class="font-bold text-amber-900 block">Fulfillment Preference:</span>
              <div class="flex flex-col gap-1 text-gray-700">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" :name="`pref-${item.id}`" value="separate" v-model="preparationPref[key]" class="text-primary focus:ring-primary">
                  <span>{{ count[key] }} separate {{ getItemUnitLabel(item) }} items</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" :name="`pref-${item.id}`" value="single_combined" v-model="preparationPref[key]" class="text-primary focus:ring-primary">
                  <span class="font-semibold text-primary">1 single combined piece (Total weight)</span>
                </label>
              </div>
            </div>

            <!-- Item Note / Special Instructions -->
            <div class="mt-1">
              <label class="block text-[11px] font-semibold text-gray-500 mb-1">
                Note / Special Instructions:
              </label>
              <input
                v-model="itemNote[key]"
                type="text"
                placeholder="e.g. less sugar, extra sauce"
                class="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-700 bg-gray-50/50"
              />
            </div>

            <div class="flex gap-1 items-baseline mt-1">
              <div class="text-primary font-semibold text-2xl sm:text-3xl">
                <span class="text-xs sm:text-sm">{{ cartStore.getCurrency }}</span>{{ Number(item.db_price).toFixed(2) }}
              </div>
              <div v-if="item.price && Number(item.price) > Number(item.db_price)" class="line-through text-[#adadad] font-medium text-xs sm:text-sm">
                <span class="text-[10px] sm:text-xs">{{ cartStore.getCurrency }} </span>{{ Number(item.price).toFixed(2) }}
              </div>
              <span v-if="item.unit || item.unit_type" class="text-xs text-gray-400 font-medium ml-1">
                / {{ getItemUnitLabel(item) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons Container - Responsive Flex Layout -->
      <div class="mt-3 pt-2 border-t border-gray-100 w-full">
        <div v-if="isInCart(item.name)" class="flex gap-2 w-full">
          <UButton
            :loading="loading"
            size="md"
            class="flex-1 flex items-center justify-center min-w-0"
            @click="submit(item, count[key], item.db_price, key)"
          >
            <Icon name="lucide:shopping-cart" class="shrink-0 mr-1" />
            <span class="truncate">Update Cart</span>
          </UButton>
          <UButton
            size="md"
            variant="outline"
            color="red"
            class="flex items-center justify-center shrink-0 px-3"
            @click="removeItem(item.name)"
          >
            <Icon name="lucide:trash" class="shrink-0" />
            <span class="hidden sm:inline ml-1">Delete</span>
          </UButton>
        </div>
        <UButton
          v-else
          :loading="loading"
          size="md"
          class="w-full flex items-center justify-center"
          @click="submit(item, count[key], item.db_price, key)"
        >
          <Icon name="lucide:shopping-cart" class="shrink-0 mr-1" />
          <span>Add to cart</span>
        </UButton>
      </div>
    </div>
  </template>
</template>