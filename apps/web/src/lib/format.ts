export const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
