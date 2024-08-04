<script setup>
const data = [
  {
    image: 'search',
    title: 'Discover & Explore',
    data: 'Explore a range of local shops in one place, filtering by categories like Food Courts, Restaurants, Clothing, Electronics, and Home Goods, or search directly for your favorite shop.',
  },
  {
    image: 'shop',
    title: 'Discover New Shopping',
    data: 'Unveil a unique shopping adventure with exclusive deals, uncovering a variety of products from trusted local vendors in one seamless experience.',
  },
  {
    image: 'local',
    title: 'Support Local',
    data: 'Enhance your shopping experience by supporting local businesses online, contributing significantly to the growth and success of your community\'s entrepreneurs.',
  },
  {
    image: 'care',
    title: 'Customer Care',
    data: 'If you have any questions or require help, our dedicated customer service team is on hand to provide guidance and support throughout your entire experience.',
  },
]
</script>

<template>
  <div class="main-container py-10 md:py-20">
    <div class="max-container">
      <h2 class="text-xl md:text-4xl text-center text-black font-semibold">
        How its Work?
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-10 pt-5 md:pt-16">
        <div v-for="item in data" :key="item" class="flex items-center flex-col w-full text-center gap-3">
          <img :src="`/img/home/howItsWork/${item.image}.png`" alt="" class="max-md:max-w-[40px]">
          <div class="font-semibold text-sm md:text-2xl">
            {{ item.title }}
          </div>
          <div class="font-medium text-xs md:text-sm">
            {{ item.data }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
