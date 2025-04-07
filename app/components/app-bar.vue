<script setup lang="ts">
const { user, clear } = useUserSession();
</script>

<template>
  <div class="w-full h-16 bg-black text-white flex">
    <UContainer class="max-w-2xl flex justify-between items-center">
      <div class="font-bold text-xl">Joyful</div>
      <UDropdownMenu :items="[{ label: 'Log out', onSelect: () => clear() }]">
        <UAvatar :src="user!.avatar" />
      </UDropdownMenu>
    </UContainer>
  </div>
</template>
