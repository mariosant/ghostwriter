<script setup lang="ts">
interface Props {
  vertical?: boolean;
}
const props = defineProps<Props>();
</script>

<template>
  <div
    v-if="props.vertical"
    class="flex justify-between items-start gap-2 flex-col"
  >
    <div>
      <div class="font-semibold"><slot name="title" /></div>
      <div class="text-slate-600 text-sm hidden md:block">
        <slot name="description" />
      </div>
    </div>
    <div class="text-nowrap w-full">
      <slot name="value" />
    </div>
  </div>

  <div v-else class="flex justify-between items-center gap-4">
    <div>
      <div class="font-semibold"><slot name="title" /></div>
      <div class="text-slate-600 text-sm hidden md:block">
        <slot name="description" />
      </div>
    </div>
    <div class="text-nowrap flex items-end">
      <slot name="value" />
    </div>
  </div>
</template>
