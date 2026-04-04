import { z } from "zod";
const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email address");
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long");
export const loginFormSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});
export const registerFormSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: emailSchema,
    password: passwordSchema
});
export const forgotPasswordFormSchema = z.object({
    email: emailSchema
});
export const resetPasswordFormSchema = z.object({
    token: z.string().trim().min(1, "Reset token is required"),
    newPassword: passwordSchema
});
export const taskFormSchema = z.object({
    title: z.string().trim().min(1, "Task title is required"),
    description: z.string().trim().max(500, "Description must be 500 characters or less"),
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["todo", "in_progress", "done"]).optional()
});
export const noteFormSchema = z.object({
    title: z.string().trim().min(1, "Note title is required"),
    content: z.string().trim().max(5000, "Content must be 5000 characters or less"),
    visibility: z.enum(["private", "org", "public"])
});
export const inviteMemberFormSchema = z.object({
    email: emailSchema,
    role: z.enum(["admin", "member", "viewer"])
});
export const createOrganizationFormSchema = z.object({
    name: z.string().trim().min(2, "Workspace name must be at least 2 characters"),
    slug: z
        .string()
        .trim()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
});
