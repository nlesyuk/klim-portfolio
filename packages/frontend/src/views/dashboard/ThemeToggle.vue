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

<script>
import { themes } from "@/helper";

const defaultProp = "not choosed";

export default {
  props: {
    currentTheme: {
      type: String,
      default: defaultProp,
      validator(value) {
        return [...themes, defaultProp].includes(value);
      }
    }
  },
  data() {
    return {
      theme: "light"
    };
  },
  watch: {
    theme(value) {
      this.$emit("onThemeChange", value);
    },
    currentTheme(value) {
      if (value != defaultProp) {
        this.theme = value;
      }
    }
  }
};
</script>
