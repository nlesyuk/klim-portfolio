<template>
  <div>
    <ul class="dashboard__list-imgs" v-if="shot">
      <li>
        <span class="dashboard__badge badge-yellow">id: {{ shot.id }}</span>
        <div v-if="shot.workId" class="dashboard__badge badge-green">
          Linked to post-id: {{ shot.workId }}
        </div>

        <button type="button" v-if="shot.src" @click="removeImage">
          delete
        </button>

        <img v-if="shot.src" :src="shot.src" alt="preview" />
        <div v-else>
          <span>Please upload shots</span>
          <input type="file" @change="getFiles" ref="file" />
        </div>

        <div class="dashboard__select">
          <select v-model="shot.workId">
            <option disabled selected value="null">
              Please linking the Shot to the Work
            </option>
            <option v-for="(item, idx) of videos" :key="idx" :value="item.id">
              {{ item.title }}
            </option>
          </select>
        </div>

        <p class="dashboard__text">Please choose category for this shot:</p>
        <label
          class="dashboard__label mb0"
          v-for="(category, idx) of myCategories"
          :key="idx"
        >
          <template>
            <input
              type="checkbox"
              v-model="shot.categories"
              :value="category.name"
              :disabled="category.isDisabled"
            />
            <span class="inline">{{ category.name }}</span>
          </template>
        </label>

        <label class="dashboard__label mb0">
          <input
            type="radio"
            name="format"
            value="vertical"
            v-model="shot.format"
          />
          <span class="inline">vertical</span>
        </label>
        <label class="dashboard__label">
          <input
            type="radio"
            name="format"
            value="horizontal"
            v-model="shot.format"
          />
          <span class="inline">horizontal</span>
        </label>

        <button
          type="button"
          @click="update"
          class="dashboard__submit"
          :disabled="isLoading"
        >
          Update shot
        </button>
        <button
          type="button"
          @click="close"
          class="dashboard__submit"
          :disabled="isLoading"
        >
          Close
        </button>
        <Spiner v-if="isLoading" :isCenter="false" />
      </li>
    </ul>
    <p v-else class="dashboard__badge badge-red">Something went wrong</p>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { getHeightAndWidthFromDataUrl } from "../../helper";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
const ShotRepository = RepositoryFactory.get("shots");

export default {
  props: {
    shot: {
      type: Object,
      required: true
    },
    videos: {
      required: true
    }
  },
  computed: {
    ...mapState({
      categories: state => state.shots.categories
    }),
    myCategories() {
      if (
        this.shot.categories.includes("all") &&
        this.shot.categories.length != 1
      ) {
        return Array.from(this.categories).map(name => ({
          name,
          isDisabled: name != "all"
        }));
      }
      return Array.from(this.categories).map(name => ({
        name,
        isDisabled: false
      }));
    }
  },
  data() {
    return {
      isLoading: false
    };
  },
  methods: {
    removeImage() {
      this.shot.src = "";
    },
    getFiles() {
      const files = this.$refs.file.files;
      Array.from(files).forEach(file => {
        getHeightAndWidthFromDataUrl(file).then(res => {
          this.shot.format = res.height > res.width ? "vertical" : "horizontal";
          this.shot.src = URL.createObjectURL(file);
          this.shot.file = file;
        });
      });
    },
    async update() {
      this.isLoading = true;
      const { id, src, workId, categories, format, file } = this.shot;
      let shotCategories = "";
      if (Array.from(categories).some(v => v === "all")) {
        shotCategories = ["all"];
      } else {
        shotCategories = Array.from(categories).filter(v => v != "all");
      }

      try {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("format", format);
        formData.append("workId", workId);
        formData.append("categories", JSON.stringify(shotCategories));
        if (file) {
          formData.append("photos[]", file);
        } else {
          formData.append("src", src);
        }

        const data = {};
        for (const pair of formData.entries()) {
          data[pair[0]] = pair[1];
        }

        await ShotRepository.update(formData);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    close() {
      this.$emit("close");
    },
    leaveAll() {
      this.shot.categories = ["all"];

      return false;
    }
  }
};
</script>
