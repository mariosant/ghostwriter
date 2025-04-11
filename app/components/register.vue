<script setup lang="ts">
import AppFooter from "./app-footer.vue";

useHead({ title: "Strivify - Please sign in" });

const { openInPopup } = useUserSession();
</script>

<template>
  <UContainer
    class="flex flex-col items-center gap-4 justify-center w-full p-16"
  >
    <NuxtImg src="/strivify.png" width="64" height="64" />
    <UCard class="max-w-sm">
      <div class="flex flex-col gap-4 items-center justify-center text-center">
        <UIcon name="heroicons:user" class="size-16" />
        <div>
          Welcome to Strivify. Use the button below to sign in with your Strava
          account.
        </div>
        <div
          aria-role="button"
          @click="openInPopup('/auth/strava')"
          class="cursor-pointer"
        >
          <NuxtImg src="/images/connect-with-strava.svg" />
        </div>
      </div>
    </UCard>
  </UContainer>
  <AppFooter />
</template>
