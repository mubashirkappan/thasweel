<script setup>
defineProps({
  images: Object,
})
</script>

<template>
  <!-- <div>
        {{ images }}
    </div> -->
  <Swiper
    :modules="[SwiperAutoplay, SwiperPagination]"
    :slides-per-view="1"
    :loop="true"
    effect="creative"
    :autoplay="{
      delay: 4000, // Adjust the delay as needed
      disableOnInteraction: false,
    }"
    :pagination="{
      clickable: true,
    }"
  >
    <SwiperSlide v-for="slide in images" :key="slide">
      <img :src="slide.image_url" class="object-contain rounded-md w-full h-full max-h-[285px] md:max-h-[400px] object-center" alt="">
    </SwiperSlide>
  </Swiper>
</template>
