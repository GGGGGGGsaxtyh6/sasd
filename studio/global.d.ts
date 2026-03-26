// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare type RouteContext<Path extends string = string> = {
  params: Promise<Record<string, string>>;
};
