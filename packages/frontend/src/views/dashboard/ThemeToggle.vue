<template>
  <div class="dashboard__form-item">
    <label class="dashboard__label">
      <span>Choose theme: {{ currentTheme }}</span>
      <div class="dashboard__theme-toggle">
        <label>
          <input type="radio" name="theme" value="light" v-model="theme" />
          <span>light</span>
        </label>
        <label>
          <input type="radio" name="theme" value="dark" v-model="theme" />
          <span>dark</span>
        </label>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { themes } from "@/helper";

const defaultProp = "not choosed";

const props = withDefaults(defineProps<{ currentTheme?: string }>(), { currentTheme: defaultProp });
const emit = defineEmits<{ onThemeChange: [value: string] }>();

const theme = ref("light");

watch(theme, (value) => { emit("onThemeChange", value); });
watch(() => props.currentTheme, (value) => {
  if (value && value !== defaultProp) theme.value = value;
});
</script>
