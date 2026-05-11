<template>
  <nav class="header__nav-submenu">
    <ul>
      <li>
        <router-link
          exact
          exact-active-class="active"
          :to="{ path: '/photo/commerce' }"
          class="header__nav-submenu-item"
        >
          Commerce
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {};
</script>
