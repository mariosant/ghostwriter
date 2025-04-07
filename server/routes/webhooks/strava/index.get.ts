export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return { "hub.challenge": query["hub.challenge"] };
});
