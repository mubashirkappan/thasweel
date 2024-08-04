<script setup>
defineProps({
  data: Object,
})
function submitAction(name) {
  // console.log('hii')
  window.location.href = `/${name}`
}
</script>

<template>
  <div v-for="item in data" :key="item" class="flex flex-col gap-5 p-5 border border-gray-200 rounded-xl max-w-[400px] w-full mx-auto">
    <div class="max-h-[150px] h-full">
      <img :src="item.logo_name" class="object-contain w-full h-full" :alt="item.logo_name">
    </div>
    <div class="flex flex-col justify-between h-full">
      <CoreRating v-if="!item.rating === 0" :rating="item.rating" />
      <div>
        <div class="text-sm text-[#ADADAD] mt-2">
          {{ item.category }}
        </div>
        <div class="text-[#253D4E] text-lg font-semibold mt-2">
          {{ item.name }}
        </div>
        <div class="flex items-center gap-1">
          <div>
            <Icon name="ion:location-outline" class="text-xl" />
          </div>
          <div>
            {{ item.address }}
          </div>
        </div>
      </div>
      {{ item.data }}
      <UButton
        class="bg-[#fc544c] border border-[#fc544c] text-center hover:bg-white hover:text-[#fc544c] text-white p-3 block w-full rounded-md mt-4"
        @click="submitAction(item.slug)"
      >
        Shop From Us
      </UButton>
    </div>
  </div>
</template>
