<template>
    <BaseLayout>
        <section id="about" class="py-16 px-6 max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">About Me</h2>

            <div class="grid md:grid-cols-2 gap-10 items-center">
                <!-- Profile / Image -->
                <div class="flex justify-center">
                    <!-- Replace src with your profile picture -->
                    <img
                        src="/profile.png"
                        alt="Your portrait"
                        class="w-48 h-48 rounded-full object-cover shadow-lg ring-2 ring-indigo-500/70 dark:ring-fuchsia-500/60"
                    />
                </div>

                <!-- Bio -->
                <div class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        <p class="mb-4">
                            Hi 👋 I’m <span class="font-semibold text-neutral-900 dark:text-white">Aine Dixon</span>, a passionate 
                            <span class="text-indigo-600 dark:text-indigo-400">software developer</span> who loves building 
                            impactful products at the intersection of 
                            <span class="text-indigo-600 dark:text-indigo-400">systems, performance, and user experience</span>.
                        </p>
                        <p class="mb-4">
                            My work spans from <span class="font-medium text-neutral-900 dark:text-white">system-level development</span> 
                            (OS programming, embedded systems, IoT) to 
                            <span class="font-medium text-neutral-900 dark:text-white">frontend and DX improvements</span>. 
                            I enjoy bridging high-level usability with low-level performance.
                        </p>
                        <p>
                            Beyond code, I’m deeply interested in 
                            <span class="text-indigo-600 dark:text-indigo-400">teaching, open-source, and innovation</span>. 
                            I believe in using technology not only to solve problems but also 
                            to empower others to create.
                        </p>
                </div>
            </div>

            <!-- Skills / Highlights -->
            <div class="mt-12">
                <h3 class="text-xl font-semibold mb-4 text-center text-neutral-900 dark:text-neutral-100">Core Skills</h3>
                <div class="flex flex-wrap justify-center gap-3">
                    <span class="px-4 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm">Rust</span>
                    <span class="px-4 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm">Vue 3</span>
                    <span class="px-4 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm">TypeScript</span>
                    <span class="px-4 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm">Supabase</span>
                    <span class="px-4 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm">Embedded Systems</span>
                    <span class="px-4 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm">Systems Programming</span>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="mt-12 text-center">
                <p class="text-neutral-600 dark:text-neutral-400 mb-6">
                    🚀 Always excited to collaborate on new challenges. Let’s build something impactful together!
                </p>
                <span
                    @click="$router.push('/contact')"
                    class="inline-block cursor-pointer px-6 py-2.5 rounded-md font-medium text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-neutral-900 transition-colors"
                >Get in Touch</span>
            </div>
        </section>
    </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from '@/layouts/BaseLayout.vue'
</script>
