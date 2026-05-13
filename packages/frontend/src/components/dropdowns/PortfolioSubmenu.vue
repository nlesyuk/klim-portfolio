<template>
  <nav class="header__nav-submenu">
    <ul>
      <li v-for="cat in cats" :key="cat">
        <router-link exact-active-class="active" :to="{ path: '/portfolio', query: { filter: cat } }" class="header__nav-submenu-item">{{ cat }}</router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { categories } from "@/helper/constants";
const cats = categories.filter((v: string) => v !== "personal");
</script>
