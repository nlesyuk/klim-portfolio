<template>
  <div class="not-found">
    <h2 class="not-found__code glitch" data-text="404">404</h2>
    <h1 class="not-found__text glitch" data-text="Page not found">
      Page not found
    </h1>
  </div>
</template>

<script>
import { setTitle } from "@/helper";
export default {
  mounted() {
    setTitle("Not found");
  }
};
</script>
