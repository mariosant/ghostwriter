<script setup lang="ts">
import AppFooter from "./app-footer.vue";

useHead({ title: "Ghostwriter - Please sign in" });

const { openInPopup } = useUserSession();
</script>

<template>
  <UContainer
    class="flex flex-col items-center gap-4 justify-center w-full p-16"
  >
    <div class="flex gap-3 items-center">
      <NuxtImg src="/ghostwriter-logo.png" class="size-9" />
      <div class="font-bold text-xl tracking-tight font-fira-code">
        Ghostwriter
      </div>
    </div>
    <UCard class="max-w-sm">
      <div class="flex flex-col gap-4 items-center justify-center">
        <UIcon name="heroicons:user" class="size-12" />
        <div class="text-center">
          Welcome to Ghostwriter. Use the button below to sign in with your
          Strava account.
        </div>
        <div
          aria-role="button"
          @click="openInPopup('/auth/strava')"
          class="cursor-pointer w-full max-w-[200px]"
        >
          <NuxtImg
            src="/images/connect-with-strava.svg"
            class="w-full max-w-[200px]"
          />
        </div>
      </div>
    </UCard>
  </UContainer>
  <AppFooter />
</template>
