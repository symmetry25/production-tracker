export type RouteParams<T extends Record<string, string>> = {
  params: Promise<T>;
};

export async function getRouteParams<T extends Record<string, string>>(ctx: RouteParams<T>) {
  return ctx.params;
}
