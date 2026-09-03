<script setup>
import { useI18n } from '~/composables/useI18n'

const props = defineProps({
  modelValue: [Number, null],
  data: Array,
})

const emit = defineEmits(['update:modelValue'])

const { t, currentLocale } = useI18n()
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

function getCategoryName(item) {
  if (!item) return ''
  if (currentLocale.value === 'ar') {
    return item.ar_name || item.name_ar || item.name_arabic || item.category_name_ar || item.name
  }
  return item.name
}
</script>

<template>
  <div class="main-container">
    <div class="pt-5 max-container">
      <div class="font-semibold text-xl md:text-4xl mb-3 w-max text-[#65696d] after:w-full relative after:h-[4px] after:left-0 rtl:after:left-auto rtl:after:right-0 after:-bottom-1 after:bg-gradient-to-r rtl:after:bg-gradient-to-l after:from-primary after:from-50% after:to-black/5 after:to-50% after:absolute">
        {{ t('select_product_categories') }}
      </div>
      <div class="flex flex-wrap gap-3 py-1 md:py-5">
        <div v-for="item in data" :key="item.id" class="flex gap-1 text-sm md:text-xl items-center">
          <input
            :id="item.id"
            type="checkbox"
            :checked="selected === item.id"
            @change="handleSelection(item.id)"
          >
          <label :for="item.id">{{ getCategoryName(item) }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

