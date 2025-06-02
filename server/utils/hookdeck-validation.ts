import type { H3Event } from "h3";
import { isEmpty } from "radash";

export const validateHookdeck = async (event: H3Event) => {
  const hookdeckKeyHeader = getHeader(event, "X-Hookdeck-Key");
  const config = useRuntimeConfig();

  if (isEmpty(hookdeckKeyHeader)) {
    throw createError({
      status: 401,
    });
  }

  if (hookdeckKeyHeader !== config.hookdeckKey) {
    throw createError({
      status: 401,
    });
  }
};
