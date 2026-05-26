export default defineAppConfig({
  ui: {
    colors: {
      primary: "slate",
    },
    card: {
      slots: {
        body: "bg-slate-100 dark:bg-slate-900",
      },
      variants: {
        variant: {
          outline: {
            root: "bg-default ring ring-slate-300 dark:ring-slate-800 divide-y divide-slate-300 dark:divide-slate-800",
          },
        },
      },
    },
  },
});
