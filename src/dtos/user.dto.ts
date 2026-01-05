import z from "zod";
import { UserSchema } from "../types/user.type";

// --------------------
// Register User DTO
// --------------------
export const CreateUserDTO = UserSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  password: true,
  role: true, // optional, default is 'user'
})
  .extend({
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// --------------------
// Login User DTO
// --------------------
export const LoginUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
