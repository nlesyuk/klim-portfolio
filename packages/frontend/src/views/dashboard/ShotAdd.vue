<template>
  <section class="dashboard-add-shot">
    <form class="dashboard__form" @submit.prevent="submit">
      <div class="dashboard__label">
        <span>Please upload shots</span>
        <input
          type="file"
          @change="getFiles"
          ref="files"
          v-show="selectedImages && !selectedImages.length"
        />
        <ul class="dashboard__list-imgs">
          <li v-for="(file, idx) in selectedImages" :key="idx">
            <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>

            <button type="button" @click="removeSelectedImage(file.url)">
              delete
            </button>

            <div v-if="file.workId" class="dashboard__badge badge-green">
              Linked to post-id: {{ file.workId }}
            </div>

            <img :src="file.url" alt="preview" />

            <div class="dashboard__select">
              <select v-model="file.workId">
                <option disabled selected value="null">
                  Please linking the Shot to the Work
                </option>
                <option
                  v-for="(item, idx) of videos"
                  :key="idx"
                  :value="item.id"
                >
                  {{ item.title }}
                </option>
              </select>
            </div>

            <h3 class="dashboard__text">
              Please choose related category(ies):
            </h3>
            <label
              class="dashboard__label mb0 dashboard__label--inline"
              v-for="category in categories"
              :key="category"
            >
              <input
                type="checkbox"
                :value="category"
                v-model="file.categories"
              />
              <span>{{ category }}</span>
            </label>

            <label class="dashboard__label mb0">
              <input
                type="radio"
                :name="`format${idx}`"
                value="vertical"
                v-model="file.format"
              />
              <span class="inline">vertical</span>
            </label>
            <label class="dashboard__label">
              <input
                type="radio"
                :name="`format${idx}`"
                value="horizontal"
                v-model="file.format"
              />
              <span class="inline">horizontal</span>
            </label>
          </li>
        </ul>
      </div>
      <div class="dashboard__btns-container">
        <button
          type="submit"
          class="dashboard__submit"
          :disabled="!isAllowCreateShots"
        >
          Add shot(s)
        </button>
        <button
          type="reset"
          class="dashboard__submit"
          :disabled="!isLoading"
          @click="reset"
        >
          Reset
        </button>
        <div class="dashboard__status">
          <div class="dashboard__status--success" v-if="isSuccess">
            Shot was added
          </div>
          <div class="dashboard__status--fail" v-if="serverError">
            Server error: {{ serverError }}
          </div>
        </div>
        <Spiner v-if="isLoading" :isCenter="false" />
      </div>
    </form>
  </section>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { getHeightAndWidthFromDataUrl } from "../../helper";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
const ShotsRepository = RepositoryFactory.get("shots");

export default {
  data() {
    return {
      isLoading: false,
      isSuccess: false,
      serverError: null,
      selectedImages: []
    };
  },
  computed: {
    ...mapState({
      videos: state => state.videos.videos, // for drop down list in new added shot
      categories: state => state.shots.categories
    }),
    isAllowCreateShots() {
      if (!this.selectedImages?.length) {
        return false;
      }
      return this.selectedImages.every(
        file => file.workId && file.categories.length > 0
      );
    }
  },
  methods: {
    ...mapActions(["getAllVideos"]),
    getFiles() {
      const files = this.$refs.files.files;
      Array.from(files).forEach(file => {
        getHeightAndWidthFromDataUrl(file).then(resol => {
          const format = resol.height > resol.width ? "vertical" : "horizontal";
          this.selectedImages.push({
            file: file,
            photoOriginalName: file.name,
            workId: null,
            categories: ["all"],
            url: URL.createObjectURL(file),
            format
          });
        });
      });
    },
    removeSelectedImage(url) {
      this.selectedImages = this.selectedImages.filter(v => v.url != url);
    },
    reset() {
      this.selectedImages = [];
    },
    async submit() {
      try {
        this.isLoading = true;

        const formData = new FormData();

        for (const item of this.selectedImages) {
          formData.append("photos[]", item.file);
        }
        const images = JSON.parse(JSON.stringify(this.selectedImages));
        const shots = Array.from(images).map(v => {
          delete v.file;
          delete v.url;
          return { ...v };
        });
        formData.append("shots", JSON.stringify(shots));

        await ShotsRepository.create(formData);
        this.isSuccess = true;
        this.reset();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        this.serverError = e.response.statusText;
      } finally {
        this.isLoading = false;
        setTimeout(() => {
          this.isSuccess = false;
        }, 20 * 1000);
      }
    }
  },
  created() {
    if (!this.videos) {
      this.getAllVideos();
    }
  }
};
</script>
