<script setup>
const data = [
  {
    image: 'temp1',
    link: 'templink1',
  },
  {
    image: 'temp2',
    link: 'templink2',
  },
  {
    image: 'temp3',
    link: 'templink3',
  },
  {
    image: 'temp1',
    link: 'templink1',
  },
  {
    image: 'temp2',
    link: 'templink2',
  },
  {
    image: 'temp3',
    link: 'templink3',
  },
  {
    image: 'temp1',
    link: 'templink1',
  },
  {
    image: 'temp2',
    link: 'templink2',
  },
  {
    image: 'temp3',
    link: 'templink3',
  },
  {
    image: 'temp1',
    link: 'templink1',
  },
  {
    image: 'temp2',
    link: 'templink2',
  },
  {
    image: 'temp3',
    link: 'templink3',
  },
]
</script>

<template>
  <div class="pt-8 md:pt-14 main-container">
    <div class="max-container">
      <div class="font-bold text-2xl md:text-[44px] text-black text-center">
        Explore the Shops
      </div>
      <div class="pt-5 md:pt-10">
        <div
          class="grid gap-y-5 md:gap-4 grid-cols-3 lg:grid-cols-5 relative after:absolute after:h-[1px] after:w-full after:right-0 after:bottom-0 after:bg-gray-300 pb-4"
        >
          <div
            v-for="item in data"
            :key="item"
            class="relative after:absolute after:h-[80%] after:w-[1px] after:right-0 after:top-0 after:bg-gray-300 borderCstm"
          >
            <a
              :href="item.link"
              class="flex items-start justify-center w-full transition-transform transform hover:scale-110"
            >
              <img :src="`/img/home/successStories/${item.image}.png`" alt="" class="max-md:max-w-[80px]">
            </a>
          </div>
        </div>
        <!-- <div class="flex flex-col items-center justify-center">
          <div class="text-xl md:text-4xl font-bold text-center text-black pt-8 md:pt-14">
            Over 150 local area shops are affiliated with us
          </div>
          <a
            href=""
            class="bg-[#fc544c] border border-[#fc544c] hover:bg-white hover:text-[#fc544c] text-white p-3 block w-max rounded-md mt-3 max-md:text-sm  md:mt-5"
          >
            Register Now
            <Icon name="maki:arrow" />
          </a>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
@media screen and (min-width: 1024px) {
  .borderCstm:nth-child(5n) {
    @apply lg:after:hidden;
  }
}

@media screen and  (max-width: 1024px) {
  .borderCstm:nth-child(3n) {
    @apply after:hidden;
  }
}
/* 
@media screen and (min-width: 640px) and (max-width: 768px) {
  .borderCstm:nth-child(2n) {
    @apply sm:after:hidden;
  }
}
@media screen and (max-width: 640px) {
  .borderCstm {
    @apply after:hidden;
  }
} */
</style>
