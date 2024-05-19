<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'title',
})
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-[#fdfcfa]">
    <h1 class="font-light text-6xl text-center mx-8 mb-8">
      {{ title }}
    </h1>
    <p>
      <span class="text-xl">oomori-blog.pages.dev</span>
    </p>
  </div>
</template>

