<template>
    <figure class="flex flex-col items-start justify-center py-8 w-full h-full">
        <div class="flex justify-center items-center w-24 h-24 rounded-lg lg:h-12 lg:w-12 dark:bg-blue-900" :class="{'bg-blue-100 dark:bg-blue-900': image == 'docs.svg', 'bg-pink-100 dark:bg-pink-900': image == 'connect.svg', 'bg-indigo-100 dark:bg-indigo-900': image == 'insight.svg'}">
                <img :src="image" :alt="title">
        </div>
        <blockquote class="mx-auto mt-2 text-gray-500 mb-2 dark:text-gray-400 w-full">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white my-2">{{ title }}</h3>
            <ul class="">
                <li v-for="desc in description" class="flex items-start mb-6 space-x-3 rtl:space-x-reverse">
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-5 h-5 rounded-full ring-white shrink-0" :class="{'bg-blue-100 dark:bg-blue-900': image == 'docs.svg', 'bg-pink-100 dark:bg-pink-900': image == 'connect.svg', 'bg-indigo-100 dark:bg-indigo-900': image == 'insight.svg'}">
                            <svg class="w-2.5 h-2.5 text-blue-100 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12" :class="{'text-blue-100 dark:text-blue-300': image == 'docs.svg', 'text-pink-100 dark:text-pink-300': image == 'connect.svg', 'text-indigo-100 dark:text-indigo-300': image == 'insight.svg'}">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                            </svg>
                        </div>
                    </div>
                    <p class="">{{ desc }}</p>
                </li>
            </ul>
        </blockquote>
    </figure>
</template>

<script setup lang="ts">
defineProps<{title: string, description: string[], image: string}>();
</script>