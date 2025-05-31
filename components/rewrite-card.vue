<script setup lang="ts">
import { trackEvent } from "@aptabase/web";
import type { FormSubmitEvent } from "@nuxt/ui";

const { user } = useUserSession();
const toast = useToast();

const form = useTemplateRef("form");
const submitting = ref(false);

const formData = {
  activityUrl: "",
};

const validate = ({
  activityUrl,
}: Partial<{
  activityUrl: string;
}>) => {
  if (
    [
      "https://strava.com/activities/",
      "https://www.strava.com/activities/",
    ].some((u) => activityUrl!.includes(u))
  ) {
    return [];
  }

  return [
    {
      name: "activityUrl",
      message: "Please write a legit Strava activity URL.",
    },
  ];
};

const submit = async (event: FormSubmitEvent<typeof formData>) => {
  trackEvent("rewrite_activity", {
    activityUrl: event.data.activityUrl,
  });

  await $fetch("/api/rewrite", {
    method: "POST",
    query: {
      activity: event.data.activityUrl,
    },
  })
    .then(() =>
      toast.add({
        title: "Success",
        description: "Activity has been rewritten.",
        color: "success",
      }),
    )
    .catch(() =>
      toast.add({
        title: "Error",
        description: "Something wrong has happened. Maybe try again later.",
        color: "error",
      }),
    )
    .finally(() => {
      formData.activityUrl = "";
    });
};
</script>

<template>
  <UForm
    ref="form"
    @submit="submit"
    :validate="validate"
    :state="formData"
    class="flex flex-col gap-8"
  >
    <template v-slot:default="errors">
      <UContainer class="max-w-2xl py-8 flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <div class="font-bold text-lg">🔄 Re-write activity</div>
        </div>
        <UCard>
          <div class="grid gap-4">
            <CardField vertical>
              <template #title> Activity URL </template>
              <template #description>
                Paste your Strava activity URL to rewrite it.
              </template>
              <template #value>
                <div class="grid gap-2">
                  <UInput
                    :disabled="submitting"
                    v-model="formData.activityUrl"
                    class="w-full"
                    placeholder="https://www.strava.com/activities/12345678901"
                  />
                  <div class="text-error-500 text-sm">
                    {{ errors?.errors[0]?.message }}
                  </div>
                </div>
              </template>
            </CardField>
          </div>

          <template #footer>
            <UButton
              :disabled="!user.premium"
              loading-auto
              label="Rewrite"
              color="neutral"
              variant="soft"
              @click="form!.submit()"
            />
          </template>
        </UCard>
      </UContainer>
    </template>
  </UForm>
</template>
