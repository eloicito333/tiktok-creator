import { z } from "zod"
import { availableAgents } from "../agentsInfo.js";

const languageSchema = z.enum(["ca", "en", "es"]);
const imageSourceSchema = z.enum(["web", "ai"]);

const speechSchema = z.object({
    type: z.literal("speech"),
    agent: z.string().refine(agent => availableAgents.includes(agent), {
        message: `Invalid agent.\nAvailable agents:\n${availableAgents.map(agent => `  - ${agent}`).join("\n")}`,
    }),
    text: z.string().min(1, "text field cannot be empty"),
    lang: languageSchema
});

const imageSchema = z.object({
    type: z.literal("image"),
    source: imageSourceSchema,
    prompt: z.string().min(1, "prompt field cannot be empty"),
    duration: z.union([
      z.number().min(1, "Duration must be positive and in milliseconds"),
      z.null()
    ]),
    when: {
      after_spoken_word: z.number()
    },
});

const pauseSchema = z.object({
  type: z.literal("pause"),
  duration: z.number().min(1, "Duration must be positive and in milliseconds")
});

export const scriptSchema = z.array(z.union([speechSchema, imageSchema, pauseSchema]));