<script setup>
import { onMounted, ref } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  slug: String,
})
const config = useRuntimeConfig()

const qrCode = ref('')
const toast = useToast()
const isLoading = ref(true) // Add a loading state

async function generateQRCode(data) {
  try {
    if (data)

    console.log(config.public.apiBaseUrl);
    console.log(config.public.frontendUrl);
    console.log(4);
      qrCode.value = await QRCode.toDataURL(`${config.public.frontendUrl}/${data}`)
  }
  catch (error) {
    toast.add({
      title: `Error generating QR code: ${error.message || error}`,
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  }
  finally {
    isLoading.value = false // Set loading to false after the QR code is generated
  }
}

function downloadQRCode() {
  if (!qrCode.value) {
    toast.add({
      title: 'QR Code not generated yet.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
    return
  }

  const link = document.createElement('a')
  link.href = qrCode.value
  link.download = 'qrcode.png'
  link.click()
}

onMounted(() => {
  if (props.slug)
    generateQRCode(props.slug)
})
</script>

<template>
  <div>
    <div v-if="isLoading" class="w-screen h-screen flex items-center bg-white justify-center">
      <Icon name="i-mingcute-loading-line" class="animate-spin text-[45px] text-primary" />
    </div>
    <div v-else>
      <div v-if="qrCode" class="flex flex-col justify-center gap-5">
        <NuxtImg width="300" height="300" preset="default" :src="qrCode" alt="QR Code" />
        <UButton class=" mx-auto" size="xl" @click="downloadQRCode">
          Download QR Code
        </UButton>
      </div>
      <div v-else>
        <p>No QR Code generated.</p>
      </div>
    </div>
  </div>
</template>
