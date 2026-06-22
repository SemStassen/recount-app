export const regex = {
  email: /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/iu,
  hexColor: /^#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?(?:[0-9A-Fa-f]{2})?$/u,
} as const;
