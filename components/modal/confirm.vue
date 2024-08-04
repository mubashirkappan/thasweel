<script setup>
const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'submitSuccess'])
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

</script>

<template>
     <UModal v-model="isOpen" prevent-close>
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
          Confirmation
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="pb-3">
       Are you sure 
      </div>
      <div class="w-full grid md:grid-cols-2 gap-2">
        <UButton class="w-full justify-center items-center" @click="emit('submitSuccess')">
          LogOut
        </UButton>
        <UButton class="w-full justify-center items-center" variant="outline" @click="isOpen = false">
          Cancel
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>