<script setup>
defineProps({
  item: Object,

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
      <div v-if="item.delivery === 1" class="flex justify-between w-full gap-10 text-sm md:text-lg max-lg:text-center ">
        <div v-if="item.free_delivery_above !== 0">
          Free Delivery Above <span class="font-semibold text-primary">₹{{ item.free_delivery_above }}/- </span>
        </div>
        <div v-else>
          No <span class="font-semibold text-primary">Minimum </span> Order Limit
        </div>
        <div v-if="item.km !== 0">
          Within  <span class="font-semibold text-primary">{{ item.km }}km </span> range
        </div>
        <div v-else>
          <span class="font-semibold text-primary">Free Delivery</span> all over the Country
        </div>
      </div>
      <div v-else class="flex justify-center w-full gap-10 text-sm md:text-lg ">
        <div>
          Take Away Only
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
