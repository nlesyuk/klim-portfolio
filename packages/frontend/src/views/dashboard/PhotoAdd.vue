<template>
  <section class="dashboard-photos-add">
    <form
      class="dashboard__form dashboard__form--preview"
      @submit.prevent="submit"
    >
      <div class="dashboard__side">
        <!-- id -->
        <label v-if="id" class="dashboard__label">
          <span>id: {{ id }}</span>
        </label>

        <!-- title -->
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

        <!-- video -->
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

        <!-- Credits -->
        <label class="dashboard__label">
          <span>Credits</span>
          <VueEditor
            class="vue2editor"
            v-model="credits"
            placeholder="credits"
          ></VueEditor>
        </label>

        <!-- Description -->
        <label class="dashboard__label">
          <span>Description</span>
          <VueEditor
            class="vue2editor"
            v-model="description"
            placeholder="description"
          ></VueEditor>
        </label>

        <!-- Categories -->
        <label class="dashboard__label" v-if="categories">
          <span>Categories</span>

          <label
            class="dashboard__checkbox"
            v-for="cat in categories"
            :key="cat"
          >
            <input type="checkbox" :value="cat" v-model="choosedCategories" />
            {{ cat }}
          </label>
          <!-- <a
            :href="`//${hostName}/photo/commerce`"
            class="dashboard__link"
            target="_blank"
          >
            Link to the <b>commerce</b> category
          </a> -->
        </label>

        <!-- files -->
        <div class="dashboard__label">
          <!-- upload -->
          <span>Pleae upload photos</span>
          <input type="file" multiple @change="getFiles" ref="files" />
          <!-- add/edit -->
          <ul class="dashboard__list-imgs">
            <li v-for="(file, idx) in selectedImages" :key="idx">
              <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
              <button type="button" @click="removeSelectedImage(file)">
                delete
              </button>
              <img :src="file.src" alt="preview" />

              <label class="dashboard__label">
                <span>Please select order of photos if need</span>
                <select v-model="file.order">
                  <option disabled selected value="null">
                    Please choose order
                  </option>
                  <option
                    v-for="(img, index) of images"
                    :key="index"
                    :value="index"
                  >
                    {{ index }}
                  </option>
                </select>
              </label>
              <!-- preview -->
              <label class="dashboard__label">
                <input type="checkbox" v-model="file.isPreview" :value="true" />
                <span class="inline">Is preview photo?</span>
              </label>
              <!-- aspect retio -->
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

        <!-- work order -->
        <label class="dashboard__label">
          <span>Order</span>
          <select v-model="order">
            <option disabled selected value="null">
              Please choose order
            </option>
            <option
              v-for="(item, index) in allPhotoCollections"
              :key="index"
              :value="index"
            >
              {{ index }}
              <template v-if="index + 1 === allPhotoCollections && !isEdit">
                (the position was set automatically)
              </template>
            </option>
          </select>
        </label>

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

      <!-- PREVIEW -->
      <div class="dashboard__side dashboard__area-preview">
        <div class="photos" v-if="selectedImages.length">
          <PhotosGrid :images="selectedImages" />
        </div>
      </div>
    </form>
  </section>
</template>

<script>
import PhotosGrid from "../../components/PhotosGrid";
import { VueEditor } from "vue2-editor";
import { mapState } from "vuex";
import { required, minLength, maxLength } from "vuelidate/lib/validators";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
const PhotosRepository = RepositoryFactory.get("photos");

export default {
  props: {
    photoCollection: {
      type: Object
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  components: {
    PhotosGrid,
    VueEditor
  },
  data() {
    return {
      id: null,
      title: "",
      videoId: "",
      order: null,
      credits: "",
      choosedCategories: [],
      description: "",
      selectedImages: [],
      removedImages: [],
      // general:
      isLoading: false,
      isSuccess: false,
      clientErrors: [],
      serverError: null
    };
  },
  validations: {
    title: {
      required,
      minLength: minLength(2)
    },
    videoId: {
      minLength: minLength(9),
      maxLength: maxLength(20)
    }
  },
  watch: {
    allPhotoCollections: {
      handler(v) {
        if (!this.isEdit) {
          // v is length but order could be length - 1 because it is index
          this.order = v - 1;
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapState({
      categories: state => state.photos.categories.filter(v => v !== "all"),
      allPhotos: state => state.photos.photos
    }),
    allPhotoCollections() {
      const count = Array.from(this.allPhotos)?.length;
      if (this.isEdit) {
        return this.order > count ? this.order + 1 : count;
      }
      return count ? count + 1 : 1;
    },
    hostName() {
      return window.location.host;
    },
    images() {
      return this.selectedImages?.length ?? 1;
      return this.isEdit
        ? [...this.selectedImages, ...this.photoCollection.photos]
        : this.selectedImages;
    },
    isAllowCreate() {
      return (
        this.images.length &&
        !this.$v.$invalid &&
        this.images?.filter(v => v.isPreview).length === 3
      );
    },
    isSelectedPreview() {
      return (
        this.selectedImages.length &&
        this.selectedImages?.filter(v => v.isPreview).length !== 3
      );
    }
  },
  methods: {
    reset() {
      this.id = null;
      this.title = "";
      this.credits = "";
      this.choosedCategories = [];
      this.selectedImages = [];
    },
    getFiles() {
      const files = this.$refs.files.files;

      function getHeightAndWidthFromDataUrl(dataURL) {
        // dataURL must be created by URL.createObjectURL(file)
        return new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            resolve({
              height: img.height,
              width: img.width
            });
          };
          img.src = dataURL;
        });
      }

      Array.from(files).forEach(file => {
        const src = URL.createObjectURL(file);
        getHeightAndWidthFromDataUrl(src).then(resol => {
          const format = resol.height > resol.width ? "vertical" : "horizontal";
          const index = this.selectedImages.length ?? 1;
          this.selectedImages.push({
            src,
            file,
            order: index,
            format,
            isPreview: false
          });
        });
      });
    },
    removeSelectedImage(image) {
      if (this.isEdit) {
        this.removedImages.push(image.id);
      }
      this.selectedImages = this.selectedImages.filter(v => v.src != image.src);
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
    submit() {
      // validation
      this.clientErrors = [];
      if (this.$v.$invalid) {
        this.$v.$touch();
        return;
      }

      const images = Array.from(this.selectedImages);
      if (images.length) {
        const isHasPreview = images.filter(v => v.isPreview);
        if (isHasPreview.length != 3) {
          this.clientErrors.push("Please choose 3 preview images");
          return;
        }
      } else {
        this.clientErrors.push("Please select at least one image");
        return;
      }
      if (!this.order && this.order !== 0) {
        this.clientErrors.push("Please select order");
        return;
      }
      if (!this.title) {
        this.clientErrors.push("Please fill title");
        return;
      }

      // server
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
        formData.append("order", this.order);
        formData.append("credits", this.credits);
        formData.append("description", this.description);

        if (this.choosedCategories) {
          formData.append("categories", JSON.stringify(this.choosedCategories));
        }
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
        PhotosRepository.create(formData)
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
      } catch (e) {
        this.serverError = e.message;
        // eslint-disable-next-line no-console
        console.error("PhotosAdd server ERROR", e);
      }
    },

    // edit
    setDataForEdit() {
      const {
        id,
        title,
        order,
        photos,
        credits,
        categories,
        description
      } = this.photoCollection;

      this.id = id;
      this.title = title;
      this.order = order;
      this.credits = credits;
      this.choosedCategories = categories ? [...categories] : [];
      this.description = description;
      this.selectedImages = JSON.parse(JSON.stringify(photos));
    },
    update() {
      try {
        const formData = new FormData();

        // photos:
        const oldPhotos = Array.from(this.photoCollection.photos);
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
        const deletedPhotoIds = oldPhotos
          .filter(v => {
            const isExist = this.selectedImages.some(
              item => item?.id === v?.id
            );
            return !isExist;
          })
          .map(v => v?.id);
        // updated
        const updatePhotoInfo =
          this.selectedImages?.filter((v, idx) => {
            const isNew = v.file; // means new photo
            const current = JSON.stringify(v);
            const existing = JSON.stringify(oldPhotos[idx]);
            const isUpdated = current != existing;
            return isUpdated && !isNew;
          }) || [];
        // existing
        const existingPhotoInfo = oldPhotos.filter(exphoto => {
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

        formData.append("id", this.id);
        formData.append("title", this.title);
        formData.append("order", this.order);
        formData.append("credits", this.credits);
        formData.append("description", this.description);
        formData.append("photosInfo", JSON.stringify(photosInfo));
        if (this.choosedCategories) {
          formData.append("categories", JSON.stringify(this.choosedCategories));
        }

        // return;
        this.isLoading = true;
        PhotosRepository.update(formData)
          .then(() => {
            // this.reset();
            this.setServerStatusInUI(true);
          })
          .catch(e => {
            // eslint-disable-next-line no-console
            console.error(e);
            this.setServerStatusInUI(false, e.response.statusText);
          })
          .finally(() => {
            this.isLoading = false;
          });
      } catch (e) {
        this.serverError = e.message;
      }
    }
  },
  mounted() {
    if (this.isEdit) {
      this.setDataForEdit();
    }
  }
};
</script>
<style lang="scss">
.vue2editor .ql-editor {
  min-height: 50px;
}
</style>
