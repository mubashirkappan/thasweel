<script setup>
import { items } from '/data/items'
</script>

<template>
  <div class="main-container">
    <div class="max-container">
        <!-- <NuxtLink to="/">
        <Icon name="icon-park-outline:left" /> Back to result
      </NuxtLink> -->
      <div class=" font-[poppins] text-[40px] font-semibold">
        Product
      </div>
      <div>
        <CoreProductCard :item="items[0]" />
      </div>
    </div>
  </div>
  <CoreListing title="Products Available in ">
    <CoreItemCard :data="items" />
  </CoreListing>
</template>
