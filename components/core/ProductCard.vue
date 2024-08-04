<script setup>
defineProps({
  item: Object,
})
</script>

<template>
  <div class="grid grid-cols-12 gap-10">
    <div class="flex col-span-8 gap-4  border border-gray-200 rounded-md overflow-hidden p-5">
      <img :src="`${item.image}`" class="object-cover w-full max-w-[200px]" alt="">
      <div class="flex flex-col justify-between h-full">
        <div class="flex flex-col  justify-center gap-2 h-full">
          <div class=" text-2xl font-semibold mt-2 text-[#253D4E]">
            {{ item.name }}
          </div>
          <div v-if="item.description" class="text-xs font-medium ">
            {{ item.description }}
          </div>
          <div class="flex gap-1 items-center">
            <div class="text-primary font-semibold text-3xl">
              ₹{{ item. discount_price }}
            </div>
            <div class="line-through text-[#adadad] font-medium text-sm">
              ₹{{ item.price }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col justify-center gap-3  col-span-4 p-5  border border-gray-200 rounded-md">
      <div>
        Limited Time offer:
      </div>

      <div class="flex gap-1 items-center">
        <div class="bg-primary font-semibold text-3xl">
          ₹{{ item. discount_price }}
        </div>
        <div class="line-through text-[#adadad] font-medium text-sm">
          ₹{{ item.price }}
        </div>
      </div>
      <CoreCounter />
      <NuxtLink
        :to="`shopDetail?username=${item.username}`"
        class="bg-[#fc544c] border border-[#fc544c] text-center hover:bg-white hover:text-[#fc544c] text-white p-3  w-full rounded-md  text-sm font-medium flex items-center justify-center gap-1"
      >
        <Icon name="lucide:shopping-cart" />
        Add to cart
      </NuxtLink>
    </div>
  </div>
</template>
