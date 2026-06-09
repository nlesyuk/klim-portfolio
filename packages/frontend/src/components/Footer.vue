<template>
  <footer class="footer">
    <p class="footer__text">{{ description }}</p>
    <p v-if="contacts" class="footer__text">
      contact me
      <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
    </p>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useContactsQuery } from "@/composables/useContacts";
import { currentUser } from "@/helper/constants";

const { data } = useContactsQuery();
const contacts = computed(
  () => data.value as Record<string, string> | undefined,
);
const description = currentUser?.footerDescription ?? "";
</script>
