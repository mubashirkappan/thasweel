<script setup>
import { useCartStore } from '/composables/cartData'

const cartStore = useCartStore()

const props = defineProps({
  item: Object,
})

const isTakeaway = computed(() => {
  if (!props.item) return false
  const s = props.item
  return (
    s.take_away === 1 ||
    s.take_away === true ||
    s.take_away === '1'
  )
})
</script>

<template>
  <div class="flex flex-col items-center justify-center md:min-h-[calc(100vh-200px)] p-4">
    <div class="flex flex-col items-center gap-5  max-md:border border-black rounded-lg p-2 max-md:w-full max-md:max-w-[500px]">
      <div class="flex flex-col items-center gap-4 ">
        <div class="max-h-[250px] max-w-[250px] h-full">
          <img :src="item.logo_name" class="object-cover rounded-md w-full h-full max-h-[250px] object-center" alt="">
        </div>
        <div class="flex flex-col items-center gap-3">
          <div class="text-xl md:text-4xl font-bold ">
            {{ item.name }}
          </div>
        </div>
      </div>
      <div class="items-center gap-1 md:hidden flex">
        <div>
          <Icon name="ion:location-outline" class="text-xl" />
        </div>
        <div class="font-medium">
          {{ item.address }}
        </div>
      </div>
      <div v-if="item.delivery === 1" class="flex flex-col items-center gap-3 w-full max-w-xl mx-auto text-sm md:text-base">
        <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
          <div v-if="item.free_delivery_above && Number(item.free_delivery_above) > 0">
            Free Delivery Above <span class="font-semibold text-primary"><span class="text-xs">{{ cartStore.getCurrency }}</span>{{ item.free_delivery_above }}/- </span>
          </div>
          <div v-else>
            No <span class="font-semibold text-primary">Minimum </span> Order Limit
          </div>
          <div v-if="item.km && Number(item.km) > 0">
            Within <span class="font-semibold text-primary">{{ Math.abs(Number(item.km)) }}km </span> range
          </div>
          <div v-else-if="!item.km || Number(item.km) === 0">
            <span class="font-semibold text-primary">Free Delivery</span> all over the Country
          </div>
        </div>
        <div v-if="item.courier_charge_extra === 1 || item.courier_charge_extra === true" class="text-center">
          <span class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1 rounded-full text-xs md:text-sm font-medium shadow-sm">
            <Icon name="lucide:truck" class="text-amber-600 shrink-0" />
            Courier / Delivery Charges Extra
          </span>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center w-full gap-2 text-sm md:text-base text-center">
        <div v-if="isTakeaway">
          Take Away Only
        </div>
        <div v-if="item.courier_charge_extra === 1 || item.courier_charge_extra === true">
          <span class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1 rounded-full text-xs md:text-sm font-medium shadow-sm">
            <Icon name="lucide:truck" class="text-amber-600 shrink-0" />
            Courier / Delivery Charges Extra
          </span>
        </div>
      </div>
      <div>
        <div class="items-center gap-1 hidden md:flex">
          <div>
            <Icon name="ion:location-outline" class="text-xl" />
          </div>
          <div class="font-medium">
            {{ item.address }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
