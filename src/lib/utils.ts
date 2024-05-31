import { z } from "zod";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const userRoles = Object.freeze({
  user: "user",
  moderator: "moderator",
} as const);

export type UserRole = (typeof userRoles)[keyof typeof userRoles];

const userRoleSchema = z.union([
  z.literal(userRoles.user),
  z.literal(userRoles.moderator),
]);

export const visibilityEnum = Object.freeze({
  private: "private",
  public: "public",
} as const);

export type VisibilityEnum =
  (typeof visibilityEnum)[keyof typeof visibilityEnum];

export const providerEnum = Object.freeze({
  github: "github",
  discord: "discord",
} as const);

export type ProviderEnum = (typeof providerEnum)[keyof typeof providerEnum];

// const passwordSchema = z
//   .string()
//   .min(10)
//   .refine(
//     (str) => /[A-Z]/.test(str) || /[a-z]/.test(str) || /[0-9]/.test(str),
//     {
//       message:
//         "Password must include: at least one uppercase, lowercase and digit",
//     },
//   );

const passwordSchema = z.string();

export const userLoginSchema = z.object({
  username: z
    .string()
    .max(20)
    .refine((str) => !/^[0-9_-]+$/.test(str)),
  password: passwordSchema,
});

export type UserLoginSchema = z.infer<typeof userLoginSchema>;

export const userRegisterSchema = userLoginSchema
  .extend({
    confirmPassword: passwordSchema,
    //todo mail stuff
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirm"],
  });

export type UserRegisterSchema = z.infer<typeof userRegisterSchema>;

export type NullablePartial<T> = { [K in keyof T]: T[K] | null | undefined };

export const changeCredentials = z.object({
  username: z.string().max(20),
  role: userRoleSchema,
});

export type ChangeCredentials = z.infer<typeof changeCredentials>;
