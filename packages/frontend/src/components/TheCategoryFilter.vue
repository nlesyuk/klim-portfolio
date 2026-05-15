<template>
  <nav class="categories">
    <button
      v-for="cat in categories"
      :key="cat"
      class="categories__item"
      :class="{ active: $route.query.filter === cat.toLowerCase() }"
      @click="router.push({ path: '/', query: { filter: cat.toLowerCase() } })"
    >
      {{ cat }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { categories } from "@/helper/constants";

const router = useRouter();
const $route = useRoute();
</script>

<style lang="scss">
@import "../scss/_variables";
@import "../scss/_mixins";

.categories {
  display: flex;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 8px;

  &__item {
    border: none;
    background-color: $grey-light;
    padding: 8px 16px;
    color: $grey;
    cursor: pointer;
    @include transition-default;
    &:hover,
    &.active {
      background-color: $accent;
      color: $primary;
      @include transition-default;
    }
    &:first-child {
      border-radius: 4px 0 0 4px;
    }
    &:last-child {
      border-radius: 0 4px 4px 0;
    }
  }
}
</style>
