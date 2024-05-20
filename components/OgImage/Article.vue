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
      <img class="p-0 m-0 mr-4" width="32" height="32"
        src='data:image/png;base64,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' />
      <span class="text-xl">oomori-blog.pages.dev</span>
    </p>
  </div>
</template>
