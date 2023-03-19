import { z } from "zod";

export const arraySchema = z.array(z.unknown());

export const jobSchema = z.object({
  url: z.string().url(),
  method: z
    .enum(["GET", "PUT", "POST", "PATCH", "DELETE", "HEAD"])
    .default("GET"),
  headers: z.record(z.unknown()).optional(),
  body: z.any().optional(),
});

export const jobSchemaArray = z.array(jobSchema);
