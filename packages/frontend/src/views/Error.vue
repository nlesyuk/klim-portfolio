<template>
  <div class="not-found">
    <h2 class="not-found__code glitch" :data-text="statusCode">
      {{ statusCode }}
    </h2>
    <h1 class="not-found__text glitch" :data-text="message">{{ message }}</h1>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ statusCode?: number | string; message?: string }>(),
  {
    statusCode: 400,
    message: "Some error",
  },
);
</script>
