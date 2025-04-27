<template>
  <UApp>
    <AuthState v-slot="{ loggedIn }">
      <Register v-if="!loggedIn" />
      <template v-if="loggedIn">
        <AppBar />
        <slot />
        <AppFooter />
      </template>
    </AuthState>
  </UApp>
</template>
