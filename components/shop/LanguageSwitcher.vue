<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const props = defineProps({
  shopSlug: {
    type: String,
    default: '',
  },
})

const { currentLocale, setLocale } = useI18n()
</script>

<template>
  <div class="inline-flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 shadow-sm text-xs font-semibold select-none">
    <button
      type="button"
      class="px-2.5 py-1 rounded-full transition-all duration-200"
      :class="currentLocale === 'en' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-black'"
      @click="setLocale('en', shopSlug)"
    >
      EN
    </button>
    <button
      type="button"
      class="px-2.5 py-1 rounded-full transition-all duration-200 font-arabic"
      :class="currentLocale === 'ar' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-black'"
      @click="setLocale('ar', shopSlug)"
    >
      العربية
    </button>
  </div>
</template>
