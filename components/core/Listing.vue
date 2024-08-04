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
    <div class="pt-5 max-container">
      <div class="font-semibold text-xl  md:text-4xl mb-3 w-max text-[#65696d] after:w-full relative after:h-[4px] after:left-0 after:-bottom-1 after:bg-gradient-to-r after:from-primary after:from-50% after:to-black/5 after:to-50% after:absolute">
        {{ title }}
      </div>
      <!-- <CorePlaceSearch v-if="search" /> -->
      <slot name="search" />
      <slot name="noItemsFound" />

     
        <slot />
    
    </div>
  </div>
</template>
