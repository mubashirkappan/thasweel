<template>
  <div class="relative w-full h-[50vh] md:h-[85vh]">
    <div 
      class="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center"
      style="background-image: url('/img/shop/cropped_hero.webp');"
    >
    </div>

    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

    <div class="absolute bottom-0 left-0 flex flex-col items-start w-full p-8 pb-16 md:p-16 md:pb-24 max-w-4xl">
      <h1 class="flex flex-col text-4xl font-black leading-none tracking-tighter text-white uppercase md:text-7xl lg:text-8xl font-display text-shadow-strong text-left">
        <span>Fresh, Fast & Hot</span>
        <span class="mt-2 text-green-500 md:mt-4">to Your Doorstep!</span>
      </h1>
    </div>
  </div>
</template>

<style scoped>
.text-shadow-strong {
  text-shadow: 0 4px 8px rgba(0,0,0,0.8);
}
.font-display {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>