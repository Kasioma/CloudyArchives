import { z } from "zod";

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
