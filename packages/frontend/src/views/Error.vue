<template>
  <div class="not-found">
    <h2 class="not-found__code glitch" :data-text="statusCode">
      {{ statusCode }}
    </h2>
    <h1 class="not-found__text glitch" :data-text="message">{{ message }}</h1>
  </div>
</template>

<script>
export default {
  props: {
    statusCode: {
      type: [Number, String],
      default: 400
    },
    message: {
      type: [String],
      default: "Some error"
    }
  }
};
</script>
