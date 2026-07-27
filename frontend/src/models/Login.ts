import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const SignupRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  photo: z.string(),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  zone: z.string().min(1, "Zone is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Role is required"),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const UserProfileSchema = z.object({
  name: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  age: z.string(),
  gender: z.string(),
  zone: z.string(),
  role: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;