<template>
  <section class="dashboard-works-add">
    <form
      class="dashboard__form dashboard__form--preview"
      @submit.prevent="submit"
    >
      <div class="dashboard__side">
        <!-- id -->
        <label v-if="slide" class="dashboard__label">
          <span>Slide id: {{ slide.id }}</span>
        </label>

        <!-- Title -->
        <label
          :class="[
            'dashboard__label',
            { 'dashboard__label-error': $v.title.$dirty && $v.title.$error }
          ]"
        >
          <span>Title</span>
          <input type="text" v-model="slideFields.title" />
          <strong
            class="dashboard__label-error-info"
            v-if="$v.title.$dirty && $v.title.$error"
          >
            Min length is {{ $v.title.$params.minLength.min }}
          </strong>
        </label>

        <!-- Order -->
        <label class="dashboard__label">
          <span>Order</span>
          <select v-model="slideFields.order">
            <option disabled selected value="null">
              Please choose order
            </option>
            <option
              v-for="(item, index) of slidersLength"
              :key="index"
              :value="index"
            >
              {{ index }}
            </option>
          </select>
        </label>

        <!-- Work -->
        <label class="dashboard__label">
          <span>
            Link slide to work
            <b v-if="slideFields.workId === ''">- DISABLED</b>
          </span>
          <select v-model="slideFields.workId">
            <option disabled selected value="null">
              Please choose work
            </option>
            <option
              v-for="(item, index) of preparedWorks"
              :key="index"
              :value="item.id"
            >
              {{ item.id + ": " + item.title }}
            </option>
          </select>
        </label>

        <!-- Photo -->
        <label class="dashboard__label">
          <span>
            Link slide to photo collection
            <b v-if="slideFields.photoId === ''">- DISABLED</b>
          </span>
          <select v-model="slideFields.photoId">
            <option disabled selected value="null">
              Please choose photo collection
            </option>
            <option
              v-for="(item, index) of preparedPhotos"
              :key="index"
              :value="item.id"
            >
              {{ item.id + ": " + item.title }}
            </option>
          </select>
        </label>

        <!-- Type -->
        <label class="dashboard__label">
          <span>Type of slide</span>
          <label class="dashboard__label mb0">
            <input
              type="radio"
              name="type"
              value="image"
              v-model="slideFields.type"
              :disabled="isEdit"
            />
            <span class="inline">image</span>
          </label>
          <label class="dashboard__label">
            <input
              type="radio"
              name="type"
              value="video"
              v-model="slideFields.type"
              :disabled="isEdit"
            />
            <span class="inline">video</span>
          </label>
        </label>

        <!-- IMG section -->
        <template v-if="slideFields.type === 'image'">
          <!-- upload -->
          <div class="dashboard__label">
            <span>Upload photo</span>
            <input type="file" @change="getFiles" ref="files" />
          </div>
          <!-- EDIT -->
          <div v-if="isEdit" class="dashboard__label">
            <ul class="dashboard__list-imgs">
              <li v-for="(file, idx) in slideFields.images" :key="idx">
                <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
                <button type="button" @click="removeSelectedImage(file.src)">
                  remove
                </button>

                <img class="mb16" :src="file.src" alt="add" />
              </li>
            </ul>
          </div>
          <!-- ADD -->
          <div v-else class="dashboard__label">
            <ul class="dashboard__list-imgs">
              <li v-for="(file, idx) in slideFields.images" :key="idx">
                <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
                <button type="button" @click="removeSelectedImage(file.src)">
                  remove
                </button>

                <img class="mb16" :src="file.src" alt="add" />
              </li>
            </ul>
          </div>
        </template>
        <!-- VIDEO section -->
        <template v-else>
          <label class="dashboard__label">
            <span>Vimeo video</span>
            <input
              type="text"
              v-model="slideFields.videos.vimeoId"
              placeholder="vimeo ID"
            />
          </label>
        </template>

        <!-- client errors -->
        <label class="dashboard__label">
          <ul v-if="clientErrors.length" class="dashboard__error-list">
            <li v-for="error in clientErrors" :key="error">
              <span>{{ error }}</span>
            </li>
          </ul>
        </label>

        <!-- btns -->
        <div class="dashboard__btns-container">
          <button
            type="submit"
            class="dashboard__submit"
            v-if="isEdit"
            :disabled="isLoading"
          >
            Update
          </button>
          <button
            type="submit"
            class="dashboard__submit"
            v-else
            :disabled="isLoading"
          >
            Add
          </button>
          <button
            type="reset"
            class="dashboard__submit"
            @click="reset"
            :disabled="isLoading"
          >
            Reset
          </button>
          <!-- server errors/response -->
          <div class="dashboard__status">
            <div class="dashboard__status--success" v-if="isSuccess">
              Success
            </div>
            <div class="dashboard__status--fail" v-if="serverError">
              Server error: {{ serverError }}
            </div>
          </div>
          <Spiner v-if="isLoading" :isCenter="false" />
        </div>
      </div>
      <div class="dashboard__side dashboard__area-preview">
        <div class="dashboard-works-add__preview-cont">
          <template
            v-if="slideFields.type === 'image' && slideFields.images.length"
          >
            <img
              class="dashboard__img"
              v-for="(item, index) in slideFields.images"
              :key="index"
              :src="item.src"
              alt="image"
            />
          </template>
          <template
            v-else-if="
              slideFields.type === 'video' && slideFields.videos.vimeoId
            "
          >
            <VimeoVideoPlayer :id="slideFields.videos.vimeoId" />
          </template>
        </div>
      </div>
    </form>
  </section>
</template>

<script>
import { required, minLength } from "vuelidate/lib/validators";
import VimeoVideoPlayer from "@/components/VimeoVideoPlayer";
import { getHeightAndWidthFromDataUrl } from "../../helper/index";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
const SlidesRepository = RepositoryFactory.get("slides");

export default {
  props: {
    slide: {
      type: Object
    },
    slides: {
      type: Array,
      default: () => []
    },
    works: {
      type: Array,
      default: () => []
    },
    photos: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean
    }
  },
  components: {
    VimeoVideoPlayer
  },
  watch: {
    slide() {
      this.setDataForEdit();
    }
  },
  data() {
    return {
      slideFields: {
        id: null,
        title: "title1",
        order: null,
        type: "image",
        images: [],
        videos: {
          vimeoId: null
        },
        workId: null,
        photoId: null
      },
      // general:
      isLoading: false,
      isSuccess: false,
      clientErrors: [],
      serverError: null,
      disableValue: {
        id: "",
        title: "disable"
      }
    };
  },
  computed: {
    title() {
      return this.slideFields.title;
    },
    // base
    slidersLength() {
      const slides = this.slides;
      if (!slides) {
        return [0];
      }
      const arr = Array.from(slides);
      return arr?.length ? Math.max(arr.length) + 1 : 1;
    },
    preparedWorks() {
      const works = this.works;
      const disableValue = this.disableValue;
      return !works ? [disableValue] : [disableValue, ...works];
    },
    preparedPhotos() {
      const photos = this.photos;
      const disableValue = this.disableValue;
      return !photos ? [disableValue] : [disableValue, ...photos];
    }
  },
  validations: {
    title: {
      required,
      minLength: minLength(2)
    }
  },
  methods: {
    reset() {
      this.slideFields.title = "";
      this.slideFields.order = null;
      this.slideFields.type = "image";
      this.slideFields.images = [];
      this.slideFields.videos = {
        vimeoId: null
      };

      this.$emit("resetForm");
    },
    getFiles() {
      this.slideFields.images = [];
      const files = this.$refs.files.files;

      Array.from(files).forEach(file => {
        getHeightAndWidthFromDataUrl(file).then(resolution => {
          const format =
            resolution.height > resolution.width ? "vertical" : "horizontal";
          this.slideFields.images.push({
            file,
            format,
            src: URL.createObjectURL(file)
          });
        });
      });
    },
    removeSelectedImage(src) {
      this.slideFields.images = this.slideFields.images.filter(
        v => v.src != src
      );
    },
    setOrder() {
      if (this.isEdit) {
        this.slideFields.order = this.slide.order;
      }
      if (this.slides) {
        this.slideFields.order = Array.from(this.slides).length;
      }
    },
    setServerStatusInUI(isSuccess, statusText) {
      if (isSuccess) {
        this.isSuccess = true;
        setTimeout(() => {
          this.isSuccess = false;
          this.$emit("work-create-successfully");
        }, 10 * 1000);
        this.serverError = false;
      } else {
        this.serverError = statusText;
        setTimeout(() => {
          this.serverError = false;
        }, 20 * 1000);
      }
    },

    // send work to a server:
    async submit() {
      this.clientErrors = [];
      if (this.$v.$invalid) {
        this.$v.$touch();
        return;
      }

      const { order, type, videos, images, workId, photoId } = this.slideFields;
      const isImage = type == "image";
      if (type == "image") {
        if (!Array.from(images).length) {
          this.clientErrors.push("Please select at least one image");
          return;
        }
      } else if (type == "video") {
        if (!videos.vimeoId) {
          this.clientErrors.push("Please provide vimeo video ID");
          return;
        }
      } else {
        this.clientErrors.push("Something went wrong");
        return;
      }

      if (order == null || !Number.isInteger(+order)) {
        this.clientErrors.push(
          `Please fill up the order field, now is ${order}`
        );
        return;
      }

      if (!workId && !photoId) {
        this.clientErrors.push("Please fill work or photo ID field");
        return;
      }

      // if (!workId) {
      //   this.clientErrors.push("Please fill work ID field");
      //   return;
      // }
      // if (!photoId) {
      //   this.clientErrors.push("Please fill photo ID field");
      //   return;
      // }

      if (this.isEdit) {
        this.update(isImage);
      } else {
        this.create(isImage);
      }
    },

    // create
    create(isImage) {
      try {
        const {
          title,
          order,
          type,
          videos,
          images,
          workId,
          photoId
        } = this.slideFields;

        const formData = new FormData();
        formData.append("type", type);
        formData.append("title", title);
        formData.append("order", order);
        if (workId || workId === "") {
          formData.append("workId", workId);
        }
        if (photoId || photoId === "") {
          formData.append("photoId", photoId);
        }

        if (isImage) {
          for (const photo of images) {
            formData.append("photos[]", photo.file);
          }
        } else {
          formData.append("videos", JSON.stringify(videos));
        }

        this.isLoading = true;
        SlidesRepository.create(formData)
          .then(() => {
            this.reset();
            this.setServerStatusInUI(true);
          })
          .catch(e => {
            // eslint-disable-next-line no-console
            console.error(e);
            this.setServerStatusInUI(false, e?.response?.data?.message);
          })
          .finally(() => {
            this.isLoading = false;
            this.clientErrors = [];
          });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("AddSlide ERROR", err);
      }
    },

    // edit
    setDataForEdit() {
      const {
        id,
        title,
        order,
        type,
        image,
        videos,
        workId,
        photoId
      } = this.slide;

      this.slideFields.id = id;
      this.slideFields.type = type;
      this.slideFields.title = title;
      this.slideFields.order = order;
      this.slideFields.images = [
        {
          src: image
        }
      ];
      if (videos) {
        this.slideFields.videos =
          typeof videos === "string" ? JSON.parse(videos) : videos;
      } else {
        this.slideFields.videos = {
          vimeoId: null
        };
      }
      this.slideFields.workId = workId;
      this.slideFields.photoId = photoId;
    },
    update(isImage) {
      try {
        const {
          id,
          title,
          order,
          type,
          videos,
          images,
          workId,
          photoId
        } = this.slideFields;

        const formData = new FormData();
        formData.append("id", id);
        formData.append("type", type);
        formData.append("title", title);
        formData.append("order", order);
        if (workId) {
          formData.append("workId", workId);
        }
        if (photoId) {
          formData.append("photoId", photoId);
        }

        const image = images?.[0];
        if (isImage) {
          if (image?.src?.includes("blob")) {
            formData.append("photos[]", image.file);
          }
        } else {
          formData.append("videos", JSON.stringify(videos));
        }

        this.isLoading = true;
        SlidesRepository.update(formData)
          .then(() => {
            this.reset();
            this.setServerStatusInUI(true);
          })
          .catch(e => {
            // eslint-disable-next-line no-console
            console.error(e);
            this.setServerStatusInUI(false, e?.response?.data?.message);
          })
          .finally(() => {
            this.isLoading = false;
            this.clientErrors = [];
          });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("AddSlide ERROR", err);
      }
    },
    getName(file) {
      return `${file.src}`.split("/").pop();
    }
  },
  mounted() {
    if (this.isEdit) {
      this.setDataForEdit();
    }
    this.setOrder();
  }
};
</script>
