<template>
  <nav class="header__nav-submenu">
    <ul>
      <li v-for="filter in ['all','portrait','landscape','mood']" :key="filter">
        <router-link exact-active-class="active" :to="{ path: '/shots', query: { filter } }" class="header__nav-submenu-item">{{ filter }}</router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts"></script>
