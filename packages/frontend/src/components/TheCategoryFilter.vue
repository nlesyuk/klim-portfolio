<template>
  <nav class="categories">
    <router-link
      exact
      exact-active-class="active"
      tag="button"
      class="categories__item"
      v-for="cat in categories"
      :key="cat"
      :to="{ path: '/', query: { filter: `${cat}`.toLowerCase() } }"
    >
      {{ cat }}
    </router-link>
  </nav>
</template>

<script>
import { categories } from "@/helper/constants";

export default {
  computed: {
    categories() {
      return categories;
    }
  }
};
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
    &:hover {
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
