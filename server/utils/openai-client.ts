import { tryit } from "radash";

export const useOpenAI = () => {
  const config = useRuntimeConfig();

  const client = $fetch.create({
    baseURL: "https://api.openai.com/v1",
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    method: "post",
  });

  return tryit(client);
};
