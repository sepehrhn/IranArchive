declare const $fetch: typeof import('ofetch').$fetch;

declare namespace NodeJS {
  interface Process {
    dev?: boolean;
  }
}
