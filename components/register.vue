<script setup lang="ts">
import AppFooter from "./app-footer.vue";

useHead({ title: "Ghostwriter - Please sign in" });

const { openInPopup } = useUserSession();
</script>

<template>
  <UContainer
    class="flex flex-col items-center gap-4 justify-center w-full p-16"
  >
    <UCard class="max-w-sm grid gap-6 justify-center items-center">
      <div class="flex flex-col gap-10 items-center justify-center">
        <div class="flex gap-2 items-center">
          <div class="font-bold text-xl tracking-tight font-fira-code">
            Ghostwriter
          </div>
          <NuxtImg src="/ghostwriter-logo.png" class="size-9" />
        </div>
        <div class="grid gap-2">
          <div class="text-center text-2xl font-bold">
            Sign in to your account.
          </div>
          <div class="text-center">
            Connect with Strava to automatically add personalized titles and
            descriptions to your activities.
          </div>
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
        <div class="text-sm text-gray-500">
          By signing in, you agree to our
          <NuxtLink
            href="https://www.ghostwriter.rocks/privacy"
            class="text-primary-500"
            >Privacy Policy</NuxtLink
          >.
        </div>
      </div>
    </UCard>
  </UContainer>
  <AppFooter />
</template>
