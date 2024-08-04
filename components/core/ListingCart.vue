<script setup>
defineProps({
  title: String,
  search: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div class="main-container">
    <div class="pt-10 max-container">
      <div class="font-semibold text-[40px] mb-3 w-max text-[#253D4E] after:w-full relative after:h-[4px] after:left-0 after:bottom-0 after:bg-gradient-to-r after:from-primary after:from-50% after:to-black/5 after:to-50% after:absolute">
        {{ title }}
      </div>
      <div v-if="search" class="relative min-h-[40px] max-w-[500px] w-full ">
        <input
          type="text"
          class="bg-gray-100 h-full min-h-[40px] w-full pl-3 pr-[80px] placeholder:text-gray-300"
          placeholder="Search Virtual mall on your location"
        >
        <NuxtLink
          to="/"
          class="bg-primary absolute right-0 flex items-center justify-center top-0 h-full w-[80px] group text-white"
        >
          Search
        </NuxtLink>
      </div>
      <div class="grid grid-cols-4 gap-5 pb-4 mt-3">
        <slot />
      </div>
    </div>
  </div>
</template>
