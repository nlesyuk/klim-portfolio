<template>
  <section class="dashboard-photos">
    <button
      type="button"
      @click="isShowAddPhoto = !isShowAddPhoto"
      class="dashboard__btn"
    >
      Add photo
    </button>
    <PhotoAdd
      v-if="isShowAddPhoto"
      :isEdit="isEdit"
      :photoCollection="photoCollection"
    ></PhotoAdd>

    <button type="button" @click="refresh" class="dashboard__btn">
      Refresh photos
    </button>

    <label v-if="$options.isPhotographerMode" class="dashboard__checkbox">
      <input type="checkbox" v-model="personal" />
      Personal({{ personal ? "on" : "off" }})
    </label>

    <div class="dashboard-photos__container" v-if="!isPhotosEmpty">
      <PhotoPreview
        v-for="(item, idx) in photos"
        :key="idx"
        :collection="item"
        :collectionType="idx % 2 ? 'left' : 'right'"
      >
        <ul class="dashboard__list" v-if="isManage">
          <li>
            <button
              type="button"
              class="dashboard__btn-inline"
              title="order"
              disabled
            >
              {{ item.order }}
            </button>
          </li>
          <li>
            <button
              type="button"
              class="dashboard__btn-inline"
              @click.prevent="remove(item.id)"
            >
              Remove
            </button>
          </li>
          <li>
            <button
              type="button"
              class="dashboard__btn-inline"
              @click.prevent="edit(item.id)"
            >
              Edit
            </button>
          </li>
          <li>
            <button
              type="button"
              class="dashboard__btn-inline"
              title="id"
              disabled
            >
              id:{{ item.id }}
            </button>
          </li>

          <li>
            <span
              class="dashboard__badge badge-blue"
              v-for="(category, index) in item.category"
              :key="index"
            >
              {{ category }}
            </span>
          </li>
          <li class="dashboard__badge badge-green color-black">
            {{ getCategories(item.categories) }}
          </li>
        </ul>
      </PhotoPreview>
    </div>
    <div v-else-if="isPhotosEmpty" class="grid-empty">
      Don't have any items yet
    </div>
    <Spiner v-else />
  </section>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
import PhotoPreview from "@/components/PhotoPreview";
import PhotoAdd from "./PhotoAdd";
const PhotosRepository = RepositoryFactory.get("photos");
import { isCinematographerMode, isPhotographerMode } from "@/helper/constants";

export default {
  isPhotographerMode,
  components: {
    PhotoAdd,
    PhotoPreview
  },
  data() {
    return {
      isEdit: false,
      isManage: true,
      isShowAddPhoto: false,
      photoCollection: null,
      personal: false
    };
  },
  computed: {
    ...mapState({
      allPhotos: state => state.photos.photos
    }),
    ...mapGetters(["photosPersonal"]),
    // use getters instead of
    photographerPhotos() {
      if (this.personal) {
        return this.allPhotos?.filter(v => v?.categories.includes("personal"));
      }
      return this.allPhotos;
    },
    cinematographerPhotos() {
      const photos = this.allPhotos;
      if (!photos) {
        return false;
      }

      const sortedPhotos = this.$route.path.includes("commerce")
        ? photos.filter(v => v.categories.includes("commerce"))
        : photos;

      // return res.length ? res : this.allPhotos;
      return sortedPhotos.sort((a, b) => b.order - a.order); // new add to the begin
      // return sortedPhotos.sort((a, b) => a.order - b.order); // new add to the end
    },
    //
    photos() {
      return isCinematographerMode
        ? this.cinematographerPhotos
        : this.photographerPhotos;
    },
    isPhotosEmpty() {
      return !this.photos?.length;
    }
  },
  methods: {
    ...mapActions(["getPhotos"]),
    remove(id) {
      PhotosRepository.delete(id);
    },
    refresh() {
      this.getPhotos();
    },
    getCategories(arr) {
      if (Array.isArray(arr)) {
        return arr.join(", ");
      }
      return arr;
    },
    // edit
    edit(id) {
      this.isEdit = true;
      const item = this.allPhotos.filter(v => v.id === id);
      this.photoCollection = item?.length ? item[0] : null;
      this.isShowAddPhoto = true;
    }
  },
  created() {
    if (!this.allPhotos) {
      this.getPhotos();
    }
  }
};
</script>

<style></style>
