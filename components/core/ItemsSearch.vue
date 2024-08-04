<script setup>
const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const search = ref(props.modelValue)

function submitAction() {
  emit('update:modelValue', search.value)
}

function handleKeyup(event) {
  if (event.key === 'Enter')
    submitAction()
}
</script>

<template>
  <div class="relative min-h-[40px] max-w-[400px] w-full flex items-center">
    <UInput
      v-model="search"
      :ui="{ base: 'min-h-[40px]', icon: { base: 'hidden' } }"
      class="w-full  min-h-[40px] "
      placeholder="Search for a Item "
      @keyup="handleKeyup"
    />
    <UButton
      class="bg-primary rounded-s-none absolute right-0 flex items-center justify-center top-0 h-full w-[60px] group"
      @click="submitAction"
    >
      <Icon
        name="iconamoon:search-bold"
        class="text-xl text-white transition-transform group-hover:scale-125"
      />
    </UButton>
  </div>
</template>
