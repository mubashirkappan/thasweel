<script setup>
import { useI18n } from '~/composables/useI18n'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

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
      class="w-full min-h-[40px]"
      :placeholder="t('search_placeholder')"
      @keyup="handleKeyup"
    />
    <UButton
      class="bg-primary rounded-s-none rounded-e-md rtl:rounded-e-none rtl:rounded-s-md absolute right-0 rtl:right-auto rtl:left-0 flex items-center justify-center top-0 h-full w-[60px] group"
      @click="submitAction"
    >
      <Icon
        name="iconamoon:search-bold"
        class="text-xl text-white transition-transform group-hover:scale-125"
      />
    </UButton>
  </div>
</template>
