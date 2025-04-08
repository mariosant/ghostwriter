<template>
  <div class="flex justify-between items-center gap-4">
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
