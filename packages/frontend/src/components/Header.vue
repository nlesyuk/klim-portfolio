<template>
  <header class="header">
    <ul class="header__social">
      <li v-if="contacts?.facebook"><a :href="contacts.facebook" target="_blank"><svg width="24" height="24" viewBox="0 0 24 24"><use xlink:href="#svg-sprite--facebook"></use></svg></a></li>
      <li v-if="contacts?.instagram"><a :href="contacts.instagram" target="_blank"><svg width="24" height="24" viewBox="0 0 24 24"><use xlink:href="#svg-sprite--instagram"></use></svg></a></li>
      <li v-if="contacts?.vimeo"><a :href="contacts.vimeo" target="_blank"><svg width="24" height="24" viewBox="0 0 24 24"><use xlink:href="#svg-sprite--vimeo"></use></svg></a></li>
    </ul>
    <router-link :class="['header__logo-link', { 'cinematographer-active': isCinematographerMode }]" :to="{ path: '/' }">
      <img v-if="isCinematographerMode" src="@/assets/cinematographer-logo.svg" alt="logo" />
      <img v-else src="@/assets/photographer-logo.svg" alt="logo" />
    </router-link>
    <Nav class="header__nav" />
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Nav from "./Nav.vue";
import { useContactsQuery } from "@/composables/useContacts";
import { isCinematographerMode } from "@/helper/constants";

const { data } = useContactsQuery();
const contacts = computed(() => data.value as Record<string, string> | undefined);
</script>
