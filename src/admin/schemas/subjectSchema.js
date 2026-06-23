import { z } from "zod";

export const subjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên môn học là bắt buộc")
    .max(100, "Tên môn học không được vượt quá 100 ký tự"),
  isActive: z.enum(["true", "false"]).default("true"),
});
