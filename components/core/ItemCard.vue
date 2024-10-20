<script setup>
import { useCartStore } from '/composables/cartData'

const props = defineProps({
  data: Object,
  shopId: Number,

})

const cartStore = useCartStore()
const loading = ref(false)
const toast = useToast()
const count = ref({})

onMounted(() => {
  count.value = Object.keys(props.data).reduce((acc, key) => {
    acc[key] = 1
    return acc
  }, {})
})
function submit(itemName, quantity, price) {
  loading.value = true
  if (quantity < 1) {
    toast.add({ timeout: 1500, title: 'Cart item count must be greater than or equal to 1', color: 'red', icon: 'i-heroicons-x-circle' })
    loading.value = false
    return
  }

  const existingItem = cartStore.cartItems.find(i => i.name === itemName)

  if (existingItem) {
    if (existingItem.count === quantity) {
      toast.add({ timeout: 1500, title: 'Item already existing', color: 'red', icon: 'i-heroicons-x-circle' })
      loading.value = false
      return
    }
  }
  cartStore.addItem(itemName, quantity, price)
  if (existingItem)
    toast.add({ timeout: 1500, title: 'Items count Updated', color: 'green', icon: 'i-heroicons-check-badge' })
  toast.add({ timeout: 1500, title: 'Items added to cart', color: 'green', icon: 'i-heroicons-check-badge' })
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
  <!-- {{ itemNames }} -->
  <div v-for="(item, key) in data" :key="item.id" class="flex flex-col p-5 border border-gray-200 rounded-xl max-w-[400px] w-full mx-auto">
    <div class="max-h-[150px] h-full overflow-hidden">
      <img :src="item.image_name" class="object-contain max-h-[150px] w-full h-full" :alt="item.image_name">
    </div>
    <div class="flex flex-col justify-between h-full">
      <div class="flex flex-col justify-between h-full">
        <div>
          <div class="text-base font-semibold mt-2 text-[#253D4E]">
            {{ item.name }}
          </div>
          <div v-if="item.description" class="text-sm font-medium py-3">
            {{ item.description }}
          </div>
        </div>
        <div class="flex flex-col gap-3 pb-2">
          <CoreCounter v-model="count[key]" />
          <div class="flex gap-1 items-center">
            <div class="text-primary font-semibold text-3xl">
              <span class="text-sm">{{ cartStore.getCurrency }}</span>{{ item.db_price }}
            </div>
            <div class="line-through text-[#adadad] font-medium text-sm">
              <span class="text-xs">{{ cartStore.getCurrency }} </span>{{ item.price }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="isInCart(item.name)" class="grid grid-cols-6 gap-2">
        <UButton
          :loading="loading"
          size="lg"
          class="flex items-center justify-center w-full col-span-4"
          @click="submit(item.name, count[key], item.db_price)"
        >
          <Icon name="lucide:shopping-cart" />
          Add to cart
        </UButton>
        <UButton
          size="lg"
          variant="outline"
          class="flex items-center justify-center w-full col-span-2"
          @click="removeItem(item.name)"
        >
          <Icon name="lucide:trash" />
          Delete
        </UButton>
      </div>
      <UButton
        v-else
        :loading="loading"
        size="lg"
        class="flex items-center justify-center w-full col-span-4"
        @click="submit(item.name, count[key], item.db_price)"
      >
        <Icon name="lucide:shopping-cart" />
        Add to cart
      </UButton>
    </div>
  </div>
</template>
