<template>
  <footer class="footer">
    <p class="footer__text">{{ description }}</p>
    <p class="footer__text" v-if="contacts">
      contact me
      <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
    </p>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGeneralStore } from "@/stores/general";
import { currentUser } from "@/helper/constants";

const store = useGeneralStore();
const contacts = computed(() => store.contacts as Record<string, string> | null);
const description = currentUser?.footerDescription ?? "";
</script>
