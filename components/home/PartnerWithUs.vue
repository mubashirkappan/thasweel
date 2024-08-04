<script setup>
const data = [
  {
    image: 'tag',
    title: 'Best Prices & Deals',
    data: 'Don\'t miss our daily amazing deals and prices',
  },
  {
    image: 'dollar',
    title: 'Bonus',
    data: 'For each Refers You made',
  },
  {
    image: 'easy',
    title: 'Easy to Access',
    data: 'Enjoy freedom of purchasing products from your finger tips',
  },
]
</script>

<template>
  <div>
    <div
      class="py-8 md:py-20 main-container bg-[url(/img/home/partnerWithUs/bg.png)] bg-no-repeat bg-cover"
    >
      <div class="max-container">
        <div class="p-6 md:p-10 bg-white rounded-lg">
          <div class="grid md:grid-cols-10">
            <div
              class="md:col-span-7 order-2 md:order-1 flex flex-col max-md:items-center max-md:text-center gap-2"
            >
              <div
                class="p-2 text-xs font-medium text-white bg-yellow-500 rounded-sm w-min h-min hidden md:block"
              >
                Exclusive
              </div>
              <div class="font-bold text-xl md:text-4xl text-black ">
                Need to expand your Business Connect with Us
              </div>
              <div class=" text-sm md:text-lg">
                “Unlock the potential of your business with our comprehensive
                suite of online marketing tools and expert guidance, all
                available, to effectively grow your customer base and increase
                sales”
              </div>
              <a
                href=""
                class="bg-[#fc544c] border border-[#fc544c] hover:bg-white hover:text-[#fc544c] text-white p-3 max-md:text-sm block w-max rounded-md "
              >
                Register Now
                <Icon name="maki:arrow" />
              </a>
            </div>
            <div
              class="md:col-span-3 grid place-items-center order-1 md:order-2 gap-3"
            >
              <div
                class="p-2 text-xs font-medium text-white bg-yellow-500 rounded-sm w-min h-min md:hidden block"
              >
                Exclusive
              </div>
              <img
                src="/img/home/premium.png"
                alt=""
                class="max-md:max-w-[80px]"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pt-8 md:pt-14 main-container">
      <div class="max-container">
        <div class="grid md:grid-cols-3 gap-10">
          <div
            v-for="item in data"
            :key="item"
            class="flex items-center w-full gap-5 "
          >
            <img :src="`/img/home/partnerWithUs/${item.image}.svg`" alt="">
            <div class="flex flex-col justify-center h-full">
              <div class="text-lg text-[#253D4E] font-semibold">
                {{ item.title }}
              </div>
              <div class="text-base font-medium text-[#ADADAD]">
                {{ item.data }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
