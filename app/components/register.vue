<script setup lang="ts">
import AppFooter from "./app-footer.vue";

const { openInPopup } = useUserSession();
</script>

<template>
  <UContainer class="flex justify-center w-full p-16">
    <UCard class="w-md">
      <div class="flex flex-col gap-4 items-center justify-center text-center">
        <UIcon name="heroicons:user" class="size-16" />
        <div class="font-bold text-xl">Joyful</div>
        <div>
          Welcome to Joyful. Use the button below to sign in with your Strava
          account.
        </div>
        <div>
          <div
            aria-role="button"
            @click="openInPopup('/auth/strava')"
            class="cursor-pointer"
          >
            <NuxtImg src="/images/connect-with-strava.svg" />
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
  <AppFooter />
</template>
