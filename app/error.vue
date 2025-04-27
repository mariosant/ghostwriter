<script setup lang="ts">
const error = useError();
</script>

<template>
  <UApp>
    <UContainer class="max-w-lg p-8 md:p-16">
      <UCard>
        <div class="grid gap-4">
          <div class="text-center font-bold text-4xl md:text-6xl">
            {{ error?.statusCode }}
          </div>
          <NuxtImg
            class="rounded"
            src="https://plus.unsplash.com/premium_photo-1738036169480-086c0030803c?q=80&w=512&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />

          <div class="text-center text-lg">
            Uh oh... Something went super wrong.
          </div>

          <div
            class="text-center font-mono p-4 bg-neutral-100 text-sm dark:bg-neutral-800 max-h-32 overflow-y-auto wrap-normal relative"
          >
            {{ error?.message }}
          </div>
        </div>

        <template #footer>
          <div class="w-full flex justify-center">
            <UButton
              label="Navigate back home"
              to="/"
              icon="heroicons:arrow-left"
            />
          </div>
        </template>
      </UCard>
    </UContainer>

    <AppFooter />
  </UApp>
</template>
