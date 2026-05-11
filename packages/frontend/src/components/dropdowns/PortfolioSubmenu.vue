<template>
  <nav class="header__nav-submenu">
    <ul>
      <li v-for="cat in $options.categories" :key="cat">
        <router-link
          exact
          exact-active-class="active"
          :to="{ path: '/portfolio', query: { filter: cat } }"
          class="header__nav-submenu-item"
        >
          {{ cat }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>
<script>
import { categories } from "@/helper/constants";
const cats = categories.filter(v => v !== "personal");

export default {
  categories: cats
};
</script>
