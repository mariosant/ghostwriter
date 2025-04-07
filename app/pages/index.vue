<script setup lang="ts">
const { user } = useUserSession();

const stravaLink = computed(() => {
  return `https://www.strava.com/athletes/${toValue(user).id}`;
});

interface FormData {
  enabled: boolean;
  language: string;
}

const preferences = useState<FormData>("preferences", () => ({
  enabled: false,
  language: "English",
}));

const { status } = useLazyFetch("/api/preferences", {
  onResponse({ error, response }) {
    if (error) {
      return;
    }

    preferences.value = response._data;
  },
});

watchEffect(async () => {
  await $fetch("/api/preferences", {
    method: "PUT",
    body: toValue(preferences),
  });
});
</script>

<template>
  <UContainer class="max-w-2xl py-8 flex flex-col gap-4">
    <div class="font-bold text-lg">Welcome to Joyful!</div>

    <div>
      Joyful automatically generates fun and engaging titles and descriptions
      for your Strava activities, right when they are created. Customize your
      preferences below.
    </div>

    <div>
      Add a touch of creativity to your Strava workouts. Simply enable it and
      choose your language, and we'll do the rest!
    </div>
  </UContainer>
  <UContainer
    class="max-w-2xl py-8 flex flex-col gap-4"
    v-if="status === 'success'"
  >
    <div class="font-bold text-lg">🛠️ Preferences</div>
    <UCard class="">
      <div class="flex flex-col gap-8">
        <CardField>
          <template #title> Enabled </template>
          <template #description>
            Enable/disable automatic generation.
          </template>
          <template #value>
            <USwitch size="lg" v-model="preferences.enabled" />
          </template>
        </CardField>

        <CardField>
          <template #title> Model language </template>
          <template #description>
            Language for generated titles and descriptions.
          </template>
          <template #value>
            <USelect
              class="min-w-28"
              :items="languages"
              v-model="preferences.language"
            />
          </template>
        </CardField>
      </div>
    </UCard>
  </UContainer>

  <UContainer class="max-w-2xl py-8 flex flex-col gap-4">
    <div class="font-bold text-lg">🪪 Your connected Strava account</div>
    <UCard class="bg-neutral-50">
      <div class="flex flex-col gap-8">
        <CardField>
          <template #title> Full name </template>
          <template #description>
            Full name from your linked Strava account.
          </template>
          <template #value>
            {{ user.name }}
          </template>
        </CardField>

        <CardField>
          <template #title> Country </template>
          <template #description>
            Country associated with your Strava account.
          </template>
          <template #value> {{ user.country }} </template>
        </CardField>

        <CardField>
          <template #title> Athlete ID </template>
          <template #description>
            Your Athlete ID. Click it to view your profile on Strava.</template
          >

          <template #value>
            <ULink :href="stravaLink" class="underline flex items-center gap-2">
              {{ user.id }}
              <UIcon
                name="heroicons:arrow-top-right-on-square"
                class="size-4"
              />
            </ULink>
          </template>
        </CardField>
      </div>
    </UCard>
  </UContainer>
</template>
