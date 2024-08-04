<script setup>
const props = defineProps({ modelValue: Number })
const emit = defineEmits(['update:modelValue'])

const count = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  count.value = newValue
})

watch(count, (newValue) => {
  if (newValue >= 0)
    emit('update:modelValue', newValue)
})
</script>

<template>
  <div class="flex gap-2 items-center font-semibold font-[poppins]">
    <button :disabled="count <= 0" class=" text-xl" @click="count -= 1">
      -
    </button>
    <input v-model="count" disabled type="number" class="bg-[#F2F2F2] font-medium px-1 max-w-[25px] grid place-content-center">

    <button class=" text-xl" @click="count += 1">
      +
    </button>
  </div>
</template>
