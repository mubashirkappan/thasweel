<script setup>
const props = defineProps({
  modelValue: [Number, null],
  data: Array,
})

const emit = defineEmits(['update:modelValue'])

const selected = ref(props.modelValue)

function handleSelection(id) {
  if (selected.value === id) {
    selected.value = null
    emit('update:modelValue', null)
  }
  else {
    selected.value = id
    emit('update:modelValue', id)
  }
}
</script>

<template>
  <div class="main-container">
    <div class="pt-5 max-container">
      <div class="font-semibold text-xl  md:text-4xl mb-3 w-max text-[#65696d] after:w-full relative after:h-[4px] after:left-0 after:-bottom-1 after:bg-gradient-to-r after:from-primary after:from-50% after:to-black/5 after:to-50% after:absolute">
        Select Product Categories
      </div>
      <div class="flex flex-wrap gap-3 py-1 md:py-5 ">
        <div v-for="item in data" :key="item.id" class="flex gap-1 text-sm md:text-xl">
          <input
            :id="item.id"
            type="checkbox"
            :checked="selected === item.id"
            @change="handleSelection(item.id)"
          >
          <label :for="item.id">{{ item.name }}</label>
        </div>
      </div>
    </div>
  </div>
</template>
