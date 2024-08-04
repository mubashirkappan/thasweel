<script setup>
import { useCartStore } from '/composables/cartData'

const props = defineProps({
  data: Object,
  shopId: Number,
})
// Adjust the path as needed

const cartStore = useCartStore()
// const authStatus = useAuth()
// const { loggedIn, loginPop, token, ItemsCount } = storeToRefs(authStatus)

// const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()
const count = ref({})

onMounted(() => {
  count.value = Object.keys(props.data).reduce((acc, key) => {
    acc[key] = 1
    return acc
  }, {})
})
const itemNames = computed(() => cartStore.itemCounts)
function submit(item, count) {
  loading.value = true
  if (count < 1) {
    toast.add({ title: 'cart item need to be greater than or equal to 1', color: 'red', icon: 'i-heroicons-x-circle' })
    loading.value = false
    return
  }
  cartStore.addItem(item, count)
  toast.add({ title: "Items added to cart", color: 'green', icon: 'i-heroicons-check-badge' })
  loading.value = false

  // if (!loggedIn.value) {
  //   loginPop.value = true
  //   loading.value = false
  //   return
  // }

  // $fetch(`${config.public.apiBaseUrl}/add-to-cart`, {
  //   headers: {
  //     Authorization: `Bearer ${token.value}`,
  //   },
  //   body: {
  //     item_id: itemId,
  //     shop_id: props.shopId,
  //     count,
  //   },
  //   method: 'POST',
  // })
  //   .then((response) => {
  //     ItemsCount.value = response.data.cartItemCountNotPurchased
  //     toast.add({ title: `${response.message}
  //     to `, color: 'green', icon: 'i-heroicons-check-badge' })
  //   })
  //   .catch(({ data }) => {
  //     toast.add({ title: data.message, color: 'red', icon: 'i-heroicons-x-circle' })
  //   })
  //   .finally(() => {
  //     loading.value = false
  //   })
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
              ₹{{ item.db_price }}
            </div>
            <div class="line-through text-[#adadad] font-medium text-sm">
              ₹{{ item.price }}
            </div>
          </div>
        </div>
      </div>
      <UButton
        :loading="loading"
        size="lg"
        class="flex items-center justify-center"
        @click="submit(item.name, count[key])"
      >
        <Icon name="lucide:shopping-cart" />
        Add to cart
      </UButton>
    </div>
  </div>
</template>
