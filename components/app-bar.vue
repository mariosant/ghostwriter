<script setup lang="ts">
const { user, clear } = useUserSession();
</script>

<template>
  <div class="w-full h-16 border-b-4 border-b-orange-500 flex">
    <UContainer class="max-w-2xl flex justify-between items-center">
      <div class="flex gap-2 items-center">
        <div class="font-bold text-xl tracking-tight font-fira-code">
          Ghostwriter
        </div>
        <NuxtImg src="/ghostwriter-logo.png" class="size-9" />
      </div>
      <UDropdownMenu :items="[{ label: 'Log out', onSelect: () => clear() }]">
        <UAvatar
          :src="user!.avatar"
          class="border border-gray-200 cursor-pointer"
        />
      </UDropdownMenu>
    </UContainer>
  </div>
</template>
