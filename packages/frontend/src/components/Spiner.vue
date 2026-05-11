<template>
  <div :class="['sp', 'sp-sphere', { center: isCenter }]"></div>
</template>

<script>
export default {
  props: {
    isCenter: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss" scoped>
$spCol: #000;
.sp {
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  &.sp-sphere {
    border-radius: 50%;
    border-left: 0px $spCol solid;
    border-right: 0px $spCol solid;
    animation: spSphere 1s infinite linear;
  }
  &.center {
    margin: 20px auto;
  }
}
@keyframes spSphere {
  0% {
    border-left: 0px $spCol solid;
    border-right: 0px $spCol solid;
  }
  33% {
    border-left: 32px $spCol solid;
    border-right: 0px $spCol solid;
  }
  34% {
    border-left: 0px $spCol solid;
    border-right: 32px $spCol solid;
  }
  66% {
    border-left: 0px $spCol solid;
    border-right: 0px $spCol solid;
  }
}
</style>
