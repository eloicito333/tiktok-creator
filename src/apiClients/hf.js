import { hfCustomApi } from '#src/lib/hfCustomApi.js';

export const hf = new hfCustomApi.HfInference(process.env.HF_API_KEY);