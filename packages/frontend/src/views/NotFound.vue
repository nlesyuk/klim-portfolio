<template>
  <div class="not-found">
    <h2 class="not-found__code glitch" data-text="404">404</h2>
    <h1 class="not-found__text glitch" data-text="Page not found">Page not found</h1>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { setTitle } from "@/helper";

onMounted(() => setTitle("Not found"));
</script>
