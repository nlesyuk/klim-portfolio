<template>
  <div class="contact">
    <div v-if="contacts" class="contact__main">
      <div class="contact__top-container">
        <figure class="contact__figure">
          <img v-if="image" :src="image" class="contact__img" loading="lazy" />
          <img
            v-else
            src="@/assets/contact-image.jpg"
            class="contact__img"
            loading="lazy"
          />
        </figure>
        <div class="contact__info">
          <span v-if="contacts.email" class="contact__text">
            Email <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
          </span>
          <span v-if="contacts.phone" class="contact__text">
            phone number <a :href="`tel:${phone}`">{{ contacts.phone }}</a>
          </span>
          <div class="contact__text">
            social media
            <ul class="contact__social">
              <li>
                <a :href="contacts.facebook" target="_blank"
                  ><svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#svg-sprite--facebook"></use></svg
                ></a>
              </li>
              <li>
                <a :href="contacts.instagram" target="_blank"
                  ><svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#svg-sprite--instagram"></use></svg
                ></a>
              </li>
              <li>
                <a :href="contacts.telegram" target="_blank"
                  ><svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#svg-sprite--telegram"></use></svg
                ></a>
              </li>
              <li>
                <a :href="contacts.vimeo" target="_blank"
                  ><svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#svg-sprite--vimeo"></use></svg
                ></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        v-if="description"
        class="contact__description"
        v-html="description"
      ></div>
      <iframe
        v-if="isActivateCalendar"
        src="https://calendar.google.com/calendar/embed?src=jj25uk5sp09g04sk4g9pru6538%40group.calendar.google.com&ctz=Europe%2FKiev"
        width="800"
        height="600"
        frameborder="0"
        scrolling="no"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useContactsQuery } from "@/composables/useContacts";
import { setTitle } from "@/helper";

const route = useRoute();
const { data } = useContactsQuery();

const isActivateCalendar = ref(false);

const contacts = computed(() => data.value);
const image = computed(() => contacts.value?.image);
const phone = computed(() => {
  if (!contacts.value?.phone) return null;
  return String(contacts.value.phone)
    .replace(/[^\w\s]/gi, "")
    .replace(/\s/gi, "");
});
const description = computed(() => {
  const d = contacts.value?.description;
  if (!d) return undefined;
  try {
    return JSON.parse(d);
  } catch {
    return d;
  }
});

onMounted(() => {
  setTitle("Contact");
  if (route.query.calendar === "on") {
    isActivateCalendar.value = true;
    setTitle("Calendar");
  }
});
</script>
