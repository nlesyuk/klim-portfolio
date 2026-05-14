<template>
  <section class="dashboard-contacts">
    <form class="dashboard__form dashboard__form--contacts" @submit.prevent="submit">
      <!-- BASE FIELDS -->
      <div class="dashboard__form-item">
        <label :class="['dashboard__label', { 'dashboard__label-error': v$.email.$dirty && v$.email.$error }]">
          <span>email</span>
          <input type="email" v-model="email" />
        </label>
        <label :class="['dashboard__label', { 'dashboard__label-error': v$.phone.$dirty && v$.phone.$error }]">
          <span>phone</span>
          <input type="text" v-model="phone" />
        </label>
        <label :class="['dashboard__label', { 'dashboard__label-error': v$.vimeo.$dirty && v$.vimeo.$error }]">
          <span>vimeo</span>
          <input type="text" v-model="vimeo" />
        </label>
        <label :class="['dashboard__label', { 'dashboard__label-error': v$.facebook.$dirty && v$.facebook.$error }]">
          <span>facebook</span>
          <input type="text" v-model="facebook" />
        </label>
        <label :class="['dashboard__label', { 'dashboard__label-error': v$.telegram.$dirty && v$.telegram.$error }]">
          <span>telegram</span>
          <input type="text" v-model="telegram" />
        </label>
        <label :class="['dashboard__label', { 'dashboard__label-error': v$.instagram.$dirty && v$.instagram.$error }]">
          <span>instagram</span>
          <input type="text" v-model="instagram" />
        </label>
      </div>

      <!-- Description -->
      <div class="dashboard__form-item">
        <label class="dashboard__label">
          <span>Description</span>
          <RichEditor v-model="description" placeholder="description" />
        </label>
        <ThemeToggle :currentTheme="theme" @onThemeChange="setTheme" />
      </div>

      <!-- PHOTO -->
      <div class="dashboard__form-item">
        <div class="dashboard__label">
          <span>Upload photo</span>
          <input type="file" multiple @change="getFiles" ref="filesInput" />
        </div>
        <ul class="dashboard__list-imgs dashboard__list-imgs--single">
          <li v-for="(file, idx) in selectedImages" :key="idx">
            <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
            <span>{{ getName(file) }}</span>
            <img :src="file.src" alt="edit" />
          </li>
        </ul>
      </div>

      <!-- SUBMIT -->
      <div class="dashboard__btns-container">
        <button type="submit" class="dashboard__submit" :disabled="!isDataTheSame">
          {{ isContactAlreadyExist ? "Update" : "Create" }}
        </button>
        <button type="reset" class="dashboard__submit" @click="reset">Reset</button>
        <div class="dashboard__status">
          <div class="dashboard__status--success" v-if="isSuccess">Success</div>
          <div class="dashboard__status--fail" v-if="serverError">Server error: {{ serverError }}</div>
        </div>
        <Spiner v-if="isLoading" :isCenter="false" />
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useContactsQuery, useCreateContacts, useUpdateContacts } from "@/composables/useContacts";
import { themeInstance } from "@/helper";
import RichEditor from "@/components/RichEditor.vue";
import ThemeToggle from "./ThemeToggle.vue";
import Spiner from "@/components/Spiner.vue";

const { data: contactsData } = useContactsQuery();
const { mutate: createContacts, isPending: isCreating } = useCreateContacts();
const { mutate: updateContacts, isPending: isUpdating } = useUpdateContacts();

const filesInput = ref<HTMLInputElement | null>(null);

const email = ref<string | null>(null);
const phone = ref<string | null>(null);
const vimeo = ref<string | null>(null);
const facebook = ref<string | null>(null);
const telegram = ref<string | null>(null);
const instagram = ref<string | null>(null);
const description = ref<string | null>(null);
const selectedImages = ref<{ src: string; file?: File }[]>([]);
const theme = ref<string | null>(null);

const isContactAlreadyExist = ref(false);
const isLoading = ref(false);
const isSuccess = ref(false);
const serverError = ref<string | null>(null);

const rules = {
  email: { required },
  phone: { required },
  vimeo: {},
  facebook: {},
  telegram: {},
  instagram: {},
};

const v$ = useVuelidate(rules, { email, phone, vimeo, facebook, telegram, instagram });

const isDataTheSame = true;

function setContacts(contacts: Record<string, unknown> | null | undefined) {
  if (!contacts) return;
  email.value = contacts.email as string;
  phone.value = contacts.phone as string;
  vimeo.value = contacts.vimeo as string;
  theme.value = contacts.theme as string;
  facebook.value = contacts.facebook as string;
  telegram.value = contacts.telegram as string;
  instagram.value = contacts.instagram as string;
  description.value = (contacts.description as string) ?? "";
  if (contacts.image) selectedImages.value.push({ src: contacts.image as string });
  isContactAlreadyExist.value = true;
}

function getName(file: { src: string }) {
  return `${file.src}`.split("/").pop();
}

function getFiles() {
  selectedImages.value = [];
  const files = filesInput.value?.files;
  if (!files) return;
  Array.from(files).forEach((file) => {
    selectedImages.value.push({ file, src: URL.createObjectURL(file) });
  });
}

function reset() {
  email.value = null;
  phone.value = null;
  vimeo.value = null;
  theme.value = null;
  facebook.value = null;
  telegram.value = null;
  instagram.value = null;
  description.value = null;
  selectedImages.value = [];
}

function setTheme(t: string) {
  theme.value = t;
  themeInstance.setNewTheme(t);
}

async function submit() {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  const formData = new FormData();
  formData.append("email", email.value ?? "");
  formData.append("phone", phone.value ?? "");
  formData.append("vimeo", vimeo.value ?? "");
  formData.append("theme", theme.value ?? "");
  formData.append("telegram", telegram.value ?? "");
  formData.append("facebook", facebook.value ?? "");
  formData.append("instagram", instagram.value ?? "");
  formData.append("description", description.value ?? "");
  const image = selectedImages.value?.[0];
  if (image?.file) formData.append("photos[]", image.file);

  const onSettled = () => {
    isSuccess.value = true;
    setTimeout(() => { isSuccess.value = false; }, 10_000);
  };
  if (isContactAlreadyExist.value) {
    updateContacts(formData, { onSettled });
  } else {
    createContacts(formData, { onSettled });
  }
}

watch(contactsData, (c) => {
  setContacts(c as Record<string, unknown> | undefined);
}, { immediate: true });

watch([isCreating, isUpdating], ([a, b]) => {
  isLoading.value = a || b;
});

onMounted(() => {
  setContacts(contactsData.value as Record<string, unknown> | undefined);
});
</script>
