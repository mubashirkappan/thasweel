<script setup>
// const config = useRuntimeConfig()
// try {
//   const response = await $fetch(`${config.public.apiBaseUrl}/shop/list`)
//   console.log(response)
// }
// catch (error) {
//   console.error('Failed to fetch data:', error)
// }
</script>

<template>
  <div
    class="w-full min-h-[50vh] md:min-h-[calc(100vh-132px)] bg-[url('img/home/hero.png')] bg-no-repeat bg-cover flex items-center after:h-full after:w-full after:absolute after:top-0 after:left-0 after:bg-black/20 relative"
  >
    <div class="relative z-10 main-container">
      <div class="max-container py-10">
        <div class="text-white max-md:text-center md:max-w-[70%] flex flex-col items-center md:items-start gap-5">
          <h1 class="text-2xl md:text-[60px] font-bold leading-tight">
            Discover Your City's Best Shops at Your Fingertips Anywhere, Anytime
          </h1>
          <ModalRefer />
        </div>
      </div>
    </div>
  </div>
</template>
