import OpenAI from "openai";

export const useOpenAI = () => {
  const config = useRuntimeConfig();

  const client = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  return client;
};
