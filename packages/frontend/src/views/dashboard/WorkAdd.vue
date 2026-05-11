<template>
  <section class="dashboard-works-add">
    <form
      class="dashboard__form dashboard__form--preview"
      @submit.prevent="submit"
    >
      <div class="dashboard__side">
        <p class="dashboard__text">
          * для корректного відображення всі фото мають бути одного розміру
        </p>

        <label
          :class="[
            'dashboard__label',
            { 'dashboard__label-error': $v.title.$dirty && $v.title.$error }
          ]"
        >
          <span>Title</span>
          <input type="text" v-model="title" />
          <strong
            class="dashboard__label-error-info"
            v-if="$v.title.$dirty && $v.title.$error"
          >
            Min length is {{ $v.title.$params.minLength.min }}
          </strong>
        </label>

        <!-- order -->
        <label class="dashboard__label">
          <span>Order</span>
          <select v-model="order">
            <option disabled selected value="null">
              Please choose order
            </option>
            <option
              v-for="(work, index) of worksLength"
              :key="index"
              :value="index"
            >
              {{ index }}
            </option>
          </select>
        </label>

        <label
          :class="[
            'dashboard__label',
            {
              'dashboard__label-error': $v.videoId.$dirty && $v.videoId.$error
            }
          ]"
        >
          <span>Vimeo id</span>
          <input type="text" v-model="videoId" />
          <strong
            class="dashboard__label-error-info"
            v-if="$v.videoId.$dirty && $v.videoId.$error"
          >
            Must be min Length
            {{ $v.videoId.$params.minLength.min }}
            and max length
            {{ $v.videoId.$params.maxLength.max }}
          </strong>
        </label>

        <label class="dashboard__label">
          <span>Description under title</span>
          <VueEditor
            class="vue2editor"
            v-model="description"
            placeholder="description"
          ></VueEditor>
        </label>

        <label class="dashboard__label">
          <span>Credits</span>
          <VueEditor
            class="vue2editor"
            v-model="credits"
            placeholder="credits"
          ></VueEditor>
        </label>

        <!-- upload work -->
        <div class="dashboard__label">
          <span>Upload photos</span>
          <input type="file" multiple @change="getFiles" ref="files" />
        </div>

        <!-- TODO: shift loyout while editing a work -->
        <div class="dashboard__label">
          <!-- files: edit -->
          <ul class="dashboard__list-imgs" v-if="isEdit">
            <li v-for="(file, idx) in selectedImages" :key="idx">
              <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
              <button type="button" @click="deleteExistingImage(file.id)">
                delete
              </button>
              <span>{{ getName(file) }}</span>
              <img :src="file.src" alt="edit" />

              <label class="dashboard__label">
                <span>Please select order of photos if need</span>
                <select v-model="file.order">
                  <option disabled selected value="null">
                    Please choose order
                  </option>
                  <option
                    v-for="(img, index) of wholeWorkOrders"
                    :key="index"
                    :value="index"
                  >
                    {{ index }}
                  </option>
                </select>
              </label>

              <label class="dashboard__label">
                <input type="checkbox" v-model="file.isPreview" :value="true" />
                <span class="inline">Is preview photo?</span>
              </label>

              <label class="dashboard__label mb0">
                <input
                  type="radio"
                  :name="`edit-format${idx}`"
                  value="vertical"
                  v-model="file.format"
                />
                <span class="inline">vertical</span>
              </label>
              <label class="dashboard__label">
                <input
                  type="radio"
                  :name="`edit-format${idx}`"
                  value="horizontal"
                  v-model="file.format"
                />
                <span class="inline">horizontal</span>
              </label>
            </li>
          </ul>

          <!-- files: add -->
          <ul class="dashboard__list-imgs" v-else>
            <!-- items -->
            <li v-for="(file, idx) in selectedImages" :key="idx">
              <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
              <button type="button" @click="removeSelectedImage(file.src)">
                remove
              </button>
              <p
                :class="[
                  'dashboard__size',
                  {
                    oversize:
                      file.file.size / 1024 >= $options.allowedImageSizeInKb
                  }
                ]"
              >
                {{ getSize(file.file.size) }}
              </p>

              <p class="dashboard__img-name">{{ file.file.name }}</p>
              <!-- img preview -->
              <img :src="file.src" alt="image preview" />

              <!-- order -->
              <label class="dashboard__label">
                <span>Please select order of photos if need</span>
                <select v-model="file.order">
                  <option disabled selected value="null">
                    Please choose order
                  </option>

                  <template v-if="isEdit">
                    <option
                      v-for="(img, index) of [
                        ...selectedImages,
                        ...work.photos
                      ]"
                      :key="index"
                      :value="index"
                    >
                      {{ [...selectedImages, ...work.photos].length - index }}
                    </option>
                  </template>
                  <template v-else>
                    <option
                      v-for="(img, index) of selectedImages"
                      :key="index"
                      :value="index"
                    >
                      {{ index }}
                    </option>
                  </template>
                </select>
              </label>

              <!-- preview -->
              <label class="dashboard__label">
                <input type="checkbox" v-model="file.isPreview" :value="true" />
                <span class="inline">Is preview photo?</span>
              </label>

              <!-- radio -->
              <label
                v-for="format in photoFormat"
                class="dashboard__label mb0"
                :key="format"
              >
                <input
                  type="radio"
                  :name="`photo_format-${idx}`"
                  :value="format"
                  v-model="file.format"
                />
                <span class="inline">{{ format }}</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- work order -->
        <label class="dashboard__label">
          <ul v-if="clientErrors.length" class="dashboard__error-list">
            <li v-for="error in clientErrors" :key="error">
              <span>{{ error }}</span>
            </li>
          </ul>
          <select v-model="order" v-if="worksLength.length">
            <option disabled selected value="null">
              Please choose order
            </option>
            <option
              v-for="(work, index) in worksLength"
              :key="index"
              :value="index"
            >
              {{ index }}
              <template v-if="index + 1 === worksLength">
                (automate setted position)
              </template>
            </option>
          </select>
        </label>

        <div class="dashboard__btns-container">
          <button
            type="submit"
            class="dashboard__submit"
            v-if="isEdit"
            :disabled="isLoading"
          >
            Update work
          </button>
          <button
            type="submit"
            class="dashboard__submit"
            v-else
            :disabled="isLoading"
          >
            Add work
          </button>
          <button
            type="reset"
            class="dashboard__submit"
            @click="reset"
            :disabled="isLoading"
          >
            Reset
          </button>
          <Spiner v-if="isLoading" :isCenter="false" />

          <div class="dashboard__status">
            <div class="dashboard__status--success" v-if="isSuccess">
              Work was added
            </div>
            <div class="dashboard__status--fail" v-if="serverError">
              Server error: {{ serverError }}
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard__side dashboard__area-preview">
        <div
          class="dashboard-works-add__preview-cont"
          v-if="previewWork && previewWork.photos.length"
        >
          <Work :isPreview="true" :previewWork="previewWork" />
        </div>
      </div>
    </form>
  </section>
</template>

<script>
import Work from "../Work";
import { VueEditor } from "vue2-editor";
import { required, minLength, maxLength } from "vuelidate/lib/validators";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
const VideosRepository = RepositoryFactory.get("videos");
import { getHeightAndWidthFromDataUrl, getName } from "../../helper/index";
import { allowedImageSizeInKb } from "../../helper";

export default {
  allowedImageSizeInKb,
  props: {
    work: {
      type: Object
    },
    works: {
      type: Array
    },
    isEdit: {
      type: Boolean
    }
  },
  components: {
    Work,
    VueEditor
  },
  watch: {
    work() {
      this.setDataForEdit();
    }
  },
  data() {
    return {
      title: "",
      credits: "",
      videoId: "",
      description: "",
      order: null,
      selectedImages: [],
      // general:
      isLoading: false,
      isSuccess: false,
      clientErrors: [],
      serverError: null,
      photoFormat: ["vertical", "horizontal"]
    };
  },
  computed: {
    previewWork() {
      if (this.isEdit) {
        return {
          title: this.title,
          photos: [...this.selectedImages],
          credits: this.credits,
          description: this.description,
          videos: {
            vimeoId: this.videoId
          }
        };
      } else {
        const workPhotos = this.work?.photos ? this.work.photos : [];

        return {
          title: this.title,
          photos: [...this.selectedImages, ...workPhotos],
          credits: this.credits,
          description: this.description,
          videos: {
            vimeoId: this.videoId
          }
        };
      }
    },
    // base
    worksLength() {
      if (!this.works) {
        return [];
      }
      const arr = Array.from(this.works).map(v => v.order);
      return arr?.length
        ? Math.max(...arr) + 2 // 2 bacause we start counting from 0 and need +1 and then +1 again
        : 1;
    },
    getMaxOrderNumber() {
      const arrOrders = this.selectedImages?.map(v => +v.order);
      return Math.max(...arrOrders);
    },
    wholeWorkOrders() {
      const arr = ([].length = this.getMaxOrderNumber + 1 || 1);
      return arr;
    }
  },
  validations: {
    title: {
      required,
      minLength: minLength(2)
    },
    // description: {
    //   minLength: minLength(2)
    // },
    // credits: {
    //   required,
    //   minLength: minLength(2)
    // },
    videoId: {
      required,
      minLength: minLength(9),
      maxLength: maxLength(20)
    }
  },
  methods: {
    reset() {
      this.title = "";
      this.description = "";
      this.credits = "";
      this.videoId = "";
      this.order = null;
      this.selectedImages = [];
      this.$emit("resetForm");
    },
    async getFiles() {
      const files = this.$refs.files.files;

      let idx = this.selectedImages?.length ?? 0;
      for (const file of files) {
        const resolution = await getHeightAndWidthFromDataUrl(file);
        const format =
          resolution.height > resolution.width ? "vertical" : "horizontal";

        this.selectedImages.push({
          file,
          order: idx,
          isPreview: false,
          format,
          src: URL.createObjectURL(file)
        });

        idx++;
      }
    },
    removeSelectedImage(src) {
      this.selectedImages = this.selectedImages.filter(v => v.src != src);
    },
    setOrder() {
      if (this.isEdit) {
        this.order = this.work.order;
      } else if (this.works) {
        this.order = this.works.length;
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
    getName: getName,
    getSize(sizeInByte) {
      let name = "Kb";
      let size = Math.floor(sizeInByte / 1024); // get Kb
      if (size >= 1024) {
        name = "Mb";
        size = size / 1024; // get Mb
        size = size.toFixed(2);
      }

      return `${size} ${name}`;
    },

    // send work to a server:
    async submit() {
      this.clientErrors = [];
      if (this.$v.$invalid) {
        this.$v.$touch();
        return;
      }

      const images = Array.from(this.selectedImages);
      if (images.length) {
        const isHasPreview = images.some(v => v.isPreview);
        if (!isHasPreview) {
          this.clientErrors.push("Please choose preview image for the work");
          return;
        }
      } else {
        this.clientErrors.push("Please select at least one image");
        return;
      }

      if (this.isEdit) {
        this.update();
      } else {
        this.create();
      }
    },

    // create
    create() {
      try {
        const formData = new FormData();
        formData.append("title", this.title);
        formData.append("credits", this.credits);
        formData.append("order", this.order);
        formData.append("description", this.description);
        formData.append("videos", JSON.stringify({ vimeoId: this.videoId }));

        for (const photo of this.selectedImages) {
          formData.append("photos[]", photo.file);
        }
        const photoInfo = JSON.stringify(
          this.selectedImages.map(v => ({
            isPreview: v.isPreview,
            fileName: v.file.name,
            format: v.format,
            order: v.order
          }))
        );
        formData.append("photosInfo", photoInfo);
        this.isLoading = true;
        VideosRepository.create(formData)
          .then(() => {
            this.reset();
            this.setServerStatusInUI(true);
          })
          .catch(e => {
            // eslint-disable-next-line no-console
            console.error("AddWork server ERROR", e);
            this.setServerStatusInUI(false, e.response?.data?.message);
          })
          .finally(() => {
            this.isLoading = false;
            this.clientErrors = [];
          });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("AddWork ERROR", err);
      }
    },

    // edit
    setDataForEdit() {
      this.title = this.work.title;
      this.credits = this.work.credits;
      this.description = this.work.description;
      this.videoId = this.work.videos.vimeoId;
      this.selectedImages = JSON.parse(JSON.stringify(this.work.photos));
    },
    update() {
      const WORK = this.work;
      const formData = new FormData();
      const videos = JSON.stringify({ vimeoId: this.videoId });

      // photos:
      // new
      const newPhotoInfo = this.selectedImages
        .filter(v => {
          if (v.file) {
            formData.append("photos[]", v.file);
            return true;
          }
          return false;
        })
        .map(v => ({
          order: v.order,
          format: v.format,
          fileName: v.file.name,
          isPreview: v.isPreview
        }));
      // deleted
      const deletedPhotoIds =
        WORK.deletedPhotoIds?.map(id => id || id === 0) || [];
      // updated
      const updatePhotoInfo =
        this.selectedImages?.filter((v, idx) => {
          const isNew = v.file; // means new photo
          const current = JSON.stringify(v);
          const existing = JSON.stringify(WORK.photos[idx]);
          const isUpdated = current != existing;
          return isUpdated && !isNew;
        }) || [];
      // existing
      const existingPhotoInfo = WORK.photos.filter(exphoto => {
        const isUpdated = Array.from(updatePhotoInfo).some(
          upphoto => upphoto.id === exphoto.id
        );
        return !isUpdated;
      });
      // payload
      const photosInfo = {
        new: newPhotoInfo,
        existing: existingPhotoInfo,
        deleted: deletedPhotoIds,
        updated: updatePhotoInfo
      };

      // formData:
      formData.append("id", WORK.id);
      formData.append("title", this.title);
      formData.append("videos", videos);
      formData.append("credits", this.credits);
      formData.append("order", this.order);
      formData.append("description", this.description);
      formData.append("photosInfo", JSON.stringify(photosInfo));

      this.isLoading = true;
      VideosRepository.update(formData)
        .then(() => {
          this.reset();
          this.setServerStatusInUI(true);
        })
        .catch(e => {
          // eslint-disable-next-line no-console
          console.info("Update work ERROR", e);
          this.setServerStatusInUI(false, e.response.statusText);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    deleteExistingImage(id) {
      // this.work.photos = this.work.photos.filter(v => v.id != id);
      this.selectedImages = this.selectedImages.filter(v => v.id != id);
      if (!id) {
        return;
      }
      if (this.work.deletedPhotoIds) {
        this.work.deletedPhotoIds.push(id);
      } else {
        this.work.deletedPhotoIds = [];
        this.work.deletedPhotoIds.push(id);
      }
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
