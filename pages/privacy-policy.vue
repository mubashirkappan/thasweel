<script setup>
const authStatus = useAuth()
const { signPop } = storeToRefs(authStatus)

const route = useRoute()
if (route.query.mode && route.query.mode === 'onboarding')
  signPop.value = false
onUnmounted(() => {
  console.log('hii')
  if (route.query.mode && route.query.mode === 'onboarding')
    signPop.value = true
})
</script>

<template>
  <div class="main-container">
    <div class="max-container">
      <h1 class="text-3xl font-bold mb-4 pt-4">
        Privacy Policy
      </h1>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          Introduction
        </h2>
        <p class="text-gray-700">
          Welcome to DIBIMALL. We value your privacy and strive to protect your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our website
          <NuxtLink to="www.dibimall.com" class="text-primary">
            www.dibimall.com
          </NuxtLink>.
        </p>
      </section>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          About Us
        </h2>
        <p class="text-gray-700">
          DIBIMALL is a platform that lists shops and other businesses. We connect end users with shop owners to facilitate transactions and business interactions. However, we do not handle any financial transactions between the end user and the shop owner. All monetary dealings are solely between the end user and the respective shop owner.
        </p>
      </section>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          Information We Collect
        </h2>
        <p class="text-gray-700">
          We collect the following types of information:
        </p>
        <ul class="list-disc list-inside text-gray-700">
          <li><strong>Personal Information:</strong> This may include your name, email address, phone number, and other contact details when you register on our website or contact us for support.</li>
          <li><strong>Usage Data:</strong> We collect information about how you use our website, such as your IP address, browser type, and pages visited. This helps us improve our services and enhance user experience.</li>
        </ul>
      </section>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          How We Use Your Information
        </h2>
        <p class="text-gray-700">
          We use the collected information for the following purposes:
        </p>
        <ul class="list-disc list-inside text-gray-700">
          <li><strong>To Provide and Maintain Our Service:</strong> We use your information to operate and maintain our website, ensuring it functions smoothly and efficiently.</li>
          <li><strong>To Improve Our Services:</strong> Usage data helps us understand how users interact with our website, allowing us to make improvements and enhance user experience.</li>
          <li><strong>To Communicate with You:</strong> We may use your contact information to respond to your inquiries, provide support, and send important updates about our services.</li>
        </ul>
      </section>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          Data Sharing and Disclosure
        </h2>
        <p class="text-gray-700">
          We do not share, sell, or rent your personal information to third parties without your consent, except in the following circumstances:
        </p>
        <ul class="list-disc list-inside text-gray-700">
          <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
          <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of our company, your information may be transferred to the new owners.</li>
        </ul>
      </section>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          Data Security
        </h2>
        <p class="text-gray-700">
          We take the security of your data seriously and implement appropriate measures to protect it from unauthorized access, alteration, or disclosure. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure.
        </p>
      </section>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          Your Rights
        </h2>
        <p class="text-gray-700">
          You have the following rights regarding your personal information:
        </p>
        <ul class="list-disc list-inside text-gray-700">
          <li><strong>Access and Update:</strong> You can access and update your personal information by logging into your account on our website.</li>
          <li>
            <strong>Delete:</strong> You can request the deletion of your personal information by contacting us at <NuxtLink href="mailto:mail@dibimall.com" class="text-primary">
              mail@dibimall.com
            </NuxtLink>.
          </li>
          <li><strong>Opt-out:</strong> You can opt-out of receiving marketing communications from us by following the unsubscribe link in our emails or contacting us directly.</li>
        </ul>
      </section>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          Changes to This Privacy Policy
        </h2>
        <p class="text-gray-700">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we will notify you of significant changes via email or a notice on our website.
        </p>
      </section>

      <section class="mb-5">
        <h2 class="text-2xl font-semibold mb-2">
          Contact Us
        </h2>
        <p class="text-gray-700">
          If you have any questions or concerns about this Privacy Policy, please contact us at:
        </p>
        <address class="text-gray-700 mt-3">
          DIBIMALL<br>
          <NuxtLink href="mailto:mail@dibimall.com" class="text-primary">
            mail@dibimall.com
          </NuxtLink><br>
          <NuxtLink href="tel: 9020775050 " class="text-primary">
            9020775050
          </NuxtLink><br>
        </address>
      </section>

      <footer class="text-gray-500 text-sm pb-3">
        Effective Date: 1/07/2024
      </footer>
    </div>
  </div>
</template>
