<script setup lang="ts">
const { user, clear } = useUserSession();
</script>

<template>
  <div class="w-full h-16 border-b-4 border-b-orange-500 flex">
    <UContainer class="max-w-2xl flex justify-between items-center">
      <div class="flex gap-3 items-center">
        <NuxtImg src="/strivify.png" width="36" height="36" />
        <div class="font-bold text-xl tracking-tight">Strivify</div>
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
