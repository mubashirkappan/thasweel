<script setup>
const props = defineProps({
  rating: {
    type: Number,
    default: 0,
  },
  size: {
    type: String,
    default: 'text-sm',
  },
})
const remaining = computed(() => 5 - props.rating)
</script>

<template>
  <div class="flex items-center" :class="size">
    <Icon v-for="i in rating" :key="i" name="ic:round-star" class="text-[#FDC040]" />
    <Icon
      v-for="i in remaining"
      :key="i"
      name="ic:round-star"
      class="text-[#D4D4D4]"
    />
    <span class="ms-1 text-[#ADADAD]">({{ rating }})</span>
  </div>
</template>
