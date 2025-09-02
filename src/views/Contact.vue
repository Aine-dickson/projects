
<script setup lang="ts">
import { ref } from "vue";
import BaseLayout from '@/layouts/BaseLayout.vue'

const name = ref("");
const email = ref("");
const message = ref("");
const status = ref("");
const sending = ref(false);
const honeypot = ref("");

function validEmail(v: string) {
  return /.+@.+\..+/.test(v)
}

const handleSubmit = async () => {
  if (sending.value) return
  status.value = ''
  if (!name.value || !email.value || !message.value) {
    status.value = '⚠️ Please fill out all fields.'
    return
  }
  if (!validEmail(email.value)) {
    status.value = '⚠️ Invalid email address.'
    return
  }
  if (message.value.length > 5000) {
    status.value = '⚠️ Message too long.'
    return
  }
  sending.value = true
  try {
     if (honeypot.value) {
        name.value = ''
        email.value = ''
        message.value = ''
        honeypot.value = ''
        return;
    }
    const res = await fetch('https://snowym-ail-7a70.ainedixon03.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, message: message.value, honeypot: honeypot.value })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to send')
    }
    status.value = '✅ Message sent successfully!'
    name.value = ''
    email.value = ''
    message.value = ''
    honeypot.value = ''
  } catch (e: any) {
    status.value = '❌ ' + (e.message || 'Unexpected error')
  } finally {
    sending.value = false
  }
}
</script>

<template>
    <BaseLayout>
        <section id="contact" class="py-16 px-6 max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">Get in Touch</h2>
          <p class="text-center text-neutral-600 dark:text-neutral-400 mb-10">
            I’m always open to discussing new projects, collaborations, or opportunities.
            Feel free to reach out!
          </p>
      
          <!-- Contact Info -->
          <div class="grid gap-6 md:grid-cols-2 mb-12">
            <div class="flex flex-col p-6 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h3 class="font-semibold text-lg mb-3 text-neutral-900 dark:text-neutral-100">Contact Info</h3>
              <ul class="space-y-2 text-neutral-700 dark:text-neutral-300 text-sm">
                <li><span class="font-medium text-neutral-900 dark:text-white">Email:</span> ainedixon01@gmail.com</li>
                <li><span class="font-medium text-neutral-900 dark:text-white">Whatsapp:</span> +256777532858</li>
                <li><span class="font-medium text-neutral-900 dark:text-white">GitHub:</span> github.com/Aine-dickson</li>
                <li><span class="font-medium text-neutral-900 dark:text-white">Twitter/X:</span> twitter.com/BitCraft_handle</li>
              </ul>
            </div>
            <div class="p-6 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h3 class="font-semibold text-lg mb-4 text-neutral-900 dark:text-neutral-100">Send a Message</h3>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <input
                  v-model="name"
                  type="text"
                  placeholder="Your Name"
                  class="w-full px-3 py-2.5 rounded-md bg-white dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="Your Email"
                  class="w-full px-3 py-2.5 rounded-md bg-white dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                <textarea
                  v-model="message"
                  rows="4"
                  placeholder="Your Message"
                  class="w-full px-3 py-2.5 rounded-md bg-white dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                ></textarea>
                <!-- Honeypot field (hidden to users) -->
                <input v-model="honeypot" type="text" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
                <button
                  type="submit"
                  :disabled="sending"
                  class="w-full py-2.5 rounded-md font-medium text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-neutral-900 transition-colors"
                >
                  <span v-if="sending" class="inline-flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle class="opacity-25" cx="12" cy="12" r="10"/><path class="opacity-75" d="M4 12a8 8 0 018-8"/></svg>
                    Sending...
                  </span>
                  <span v-else>Send Message</span>
                </button>
                <p v-if="status" class="text-sm mt-1" :class="status.includes('✅') ? 'text-emerald-500' : status.includes('⚠️') ? 'text-amber-500' : 'text-rose-500'">
                  {{ status }}
                </p>
              </form>
            </div>
          </div>
          <p class="text-center text-xs text-neutral-500 dark:text-neutral-500">📍 Based in Kampala, Uganda – available for remote & local projects.</p>
        </section>
    </BaseLayout>

</template>

