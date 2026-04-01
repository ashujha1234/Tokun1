// // // // // // // // // export type LLMProvider = 'openai' | 'perplexity' | 'anthropic' | 'google' | 'other';

// // // // // // // // // export interface LLMConfig {
// // // // // // // // //   provider: LLMProvider;
// // // // // // // // //   apiKey: string;
// // // // // // // // //   model?: string;
// // // // // // // // //   maxTokens?: number;
// // // // // // // // // }
// // // // // // // // // export interface OptimizeUsage {
// // // // // // // // //   prompt: number;       // data.usage.prompt_tokens
// // // // // // // // //   completion: number;   // data.usage.completion_tokens
// // // // // // // // //   total: number;        // data.usage.total_tokens
// // // // // // // // // }
// // // // // // // // // export interface TokenizerResponse {
// // // // // // // // //   tokens: number;
// // // // // // // // //   words: number;
// // // // // // // // // }

// // // // // // // // // export interface OptimizeResponse {
// // // // // // // // //   optimizedText: string;
// // // // // // // // //   tokens: number;
// // // // // // // // //   words: number;
// // // // // // // // //   suggestions: string[];
// // // // // // // // // }



// // // // // // // // // export interface OptimizeResponse {
// // // // // // // // //   optimizedText: string;
// // // // // // // // //   tokens: number;
// // // // // // // // //   words: number;
// // // // // // // // //   suggestions: string[];
// // // // // // // // //   usage?: OptimizeUsage;   // <- NEW
// // // // // // // // // }

// // // // // // // // // /** ===== NEW: per-user usage types ===== */
// // // // // // // // // export interface UserTokenUsage {
// // // // // // // // //   totalTokensUsed: number;
// // // // // // // // //   tokenLimit: number;
// // // // // // // // // }

// // // // // // // // // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// // // // // // // // //   openai: 'gpt-4o-mini',
// // // // // // // // //   perplexity: 'llama-3.1-sonar-small-128k-online',
// // // // // // // // //   anthropic: 'claude-instant',
// // // // // // // // //   google: 'gemini-pro',
// // // // // // // // //   other: 'generic',
// // // // // // // // // };

// // // // // // // // // /** ===== Helpers for fallback storage (namespaced by user) ===== */
// // // // // // // // // const usageKey = (userId: string) => `usage_total_tokens:${userId}`;
// // // // // // // // // const limitKey = (userId: string) => `usage_token_limit:${userId}`;
// // // // // // // // // const DEFAULT_LIMIT = 100_000;

// // // // // // // // // class LLMService {
// // // // // // // // //   private config: LLMConfig = {
// // // // // // // // //     provider: 'openai',
// // // // // // // // //     apiKey: '',
// // // // // // // // //     model: 'gpt-4o-mini',
// // // // // // // // //   };

// // // // // // // // //   constructor() {
// // // // // // // // //     this.loadConfig();
// // // // // // // // //   }

// // // // // // // // //   private loadConfig() {
// // // // // // // // //     const savedProvider = localStorage.getItem('llm_provider') || 'openai';
// // // // // // // // //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// // // // // // // // //     const savedModel =
// // // // // // // // //       localStorage.getItem(`${savedProvider}_model`) ||
// // // // // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // // // // //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || '';
// // // // // // // // //     const defaultModelFromEnv =
// // // // // // // // //       import.meta.env.VITE_DEFAULT_MODEL ||
// // // // // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // // // // //     this.config = {
// // // // // // // // //       provider: savedProvider as LLMProvider,
// // // // // // // // //       apiKey: savedApiKey || (savedProvider === 'openai' ? defaultKeyFromEnv : ''),
// // // // // // // // //       model: savedModel || (savedProvider === 'openai' ? defaultModelFromEnv : ''),
// // // // // // // // //     };
// // // // // // // // //   }

// // // // // // // // //   private parseJsonObject(content: string): any {
// // // // // // // // //   const trimmed = content?.trim?.() || "";
// // // // // // // // //   // 1) ```json ... ``` fences
// // // // // // // // //   const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // // // // // // // //   const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// // // // // // // // //   // 2) Direct parse
// // // // // // // // //   try { return JSON.parse(candidate); } catch {}

// // // // // // // // //   // 3) Fallback: extract first {...} block
// // // // // // // // //   const first = candidate.indexOf("{");
// // // // // // // // //   const last = candidate.lastIndexOf("}");
// // // // // // // // //   if (first !== -1 && last !== -1 && last > first) {
// // // // // // // // //     try { return JSON.parse(candidate.slice(first, last + 1)); } catch {}
// // // // // // // // //   }
// // // // // // // // //   throw new Error("Invalid JSON received from model");
// // // // // // // // // }


// // // // // // // // //   setConfig(config: Partial<LLMConfig>) {
// // // // // // // // //     this.config = { ...this.config, ...config };
// // // // // // // // //     localStorage.setItem('llm_provider', this.config.provider);
// // // // // // // // //     if (this.config.apiKey) {
// // // // // // // // //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// // // // // // // // //     }
// // // // // // // // //     if (this.config.model) {
// // // // // // // // //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// // // // // // // // //     }
// // // // // // // // //   }

// // // // // // // // //   getConfig(): LLMConfig {
// // // // // // // // //     return { ...this.config };
// // // // // // // // //   }

// // // // // // // // //   async countTokens(text: string): Promise<TokenizerResponse> {
// // // // // // // // //     const words = text.split(/\s+/).filter(Boolean).length;
// // // // // // // // //     let tokenMultiplier = 1.3;

// // // // // // // // //     switch (this.config.provider) {
// // // // // // // // //       case 'openai':
// // // // // // // // //         tokenMultiplier = 1.3;
// // // // // // // // //         break;
// // // // // // // // //       case 'perplexity':
// // // // // // // // //         tokenMultiplier = 1.35;
// // // // // // // // //         break;
// // // // // // // // //       case 'anthropic':
// // // // // // // // //         tokenMultiplier = 1.25;
// // // // // // // // //         break;
// // // // // // // // //       case 'google':
// // // // // // // // //         tokenMultiplier = 1.2;
// // // // // // // // //         break;
// // // // // // // // //       default:
// // // // // // // // //         tokenMultiplier = 1.3;
// // // // // // // // //     }

// // // // // // // // //     const tokens = Math.round(words * tokenMultiplier);
// // // // // // // // //     return { tokens, words };
// // // // // // // // //   }

// // // // // // // // //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// // // // // // // // //     if (!this.config.apiKey) {
// // // // // // // // //       throw new Error('API key not set');
// // // // // // // // //     }

// // // // // // // // //     try {
// // // // // // // // //       const originalCount = await this.countTokens(text);
// // // // // // // // //       const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// // // // // // // // //       switch (this.config.provider) {
// // // // // // // // //         case 'openai':
// // // // // // // // //           return this.optimizeWithOpenAI(text, target);
// // // // // // // // //         case 'perplexity':
// // // // // // // // //           return this.optimizeWithPerplexity(text, target);
// // // // // // // // //         case 'anthropic':
// // // // // // // // //           return this.optimizeWithAnthropic(text, target);
// // // // // // // // //         case 'google':
// // // // // // // // //           return this.optimizeWithGoogle(text, target);
// // // // // // // // //         default:
// // // // // // // // //           return this.optimizeWithOpenAI(text, target);
// // // // // // // // //       }
// // // // // // // // //     } catch (error) {
// // // // // // // // //       console.error('Error optimizing prompt:', error);
// // // // // // // // //       throw error;
// // // // // // // // //     }
// // // // // // // // //   }

// // // // // // // // //   // OpenAI
// // // // // // // // // private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // // //   const apiKey = (this.config.apiKey || "").trim();
// // // // // // // // //   const model = (this.config.model || "gpt-4o-mini").trim();
// // // // // // // // //   if (!apiKey) throw new Error("OpenAI API key not set");

// // // // // // // // //   const body = {
// // // // // // // // //     model,
// // // // // // // // //     temperature: 0.2,
// // // // // // // // //     max_tokens: 1024,
// // // // // // // // //     messages: [
// // // // // // // // //       {
// // // // // // // // //         role: "system",
// // // // // // // // //         content: `You are an expert at optimizing text to use fewer tokens while preserving meaning.
// // // // // // // // // Return ONLY a strict JSON object with this shape:
// // // // // // // // // {
// // // // // // // // //   "optimizedText": "string",
// // // // // // // // //   "suggestions": ["string", "string", "string"]
// // // // // // // // // }
// // // // // // // // // Make the optimizedText roughly ${targetTokens} tokens long (concise but faithful).`,
// // // // // // // // //       },
// // // // // // // // //       { role: "user", content: text },
// // // // // // // // //     ],
// // // // // // // // //     response_format: { type: "json_object" },
// // // // // // // // //   };

// // // // // // // // //   const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // // // //     method: "POST",
// // // // // // // // //     headers: {
// // // // // // // // //       "Content-Type": "application/json",
// // // // // // // // //       Authorization: `Bearer ${apiKey}`,
// // // // // // // // //     },
// // // // // // // // //     body: JSON.stringify(body),
// // // // // // // // //   });

// // // // // // // // //   const data = await res.json();
// // // // // // // // //   if (!res.ok) {
// // // // // // // // //     const message = data?.error?.message || `OpenAI error (${res.status})`;
// // // // // // // // //     throw new Error(message);
// // // // // // // // //   }

// // // // // // // // //   // Parse the model's JSON
// // // // // // // // //   const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // // // // //   const parsed = this.parseJsonObject(raw);

// // // // // // // // //   const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // // // // //   const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // // // // //   if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // // // // //   // Words + heuristic tokens for the optimized text (for fallback & word count)
// // // // // // // // //   const optimizedCount = await this.countTokens(optimizedText);

// // // // // // // // //   // Read OpenAI usage
// // // // // // // // //   const usageRaw = (data?.usage ?? {}) as {
// // // // // // // // //     prompt_tokens?: number;
// // // // // // // // //     completion_tokens?: number;
// // // // // // // // //     total_tokens?: number;
// // // // // // // // //   };

// // // // // // // // //   // Prefer completion_tokens for display; fallback to heuristic
// // // // // // // // //   const displayTokens =
// // // // // // // // //     typeof usageRaw.completion_tokens === "number"
// // // // // // // // //       ? usageRaw.completion_tokens
// // // // // // // // //       : optimizedCount.tokens;

// // // // // // // // //   // Build usage object for consumers (PromptOptimization page)
// // // // // // // // //   const usageObj = {
// // // // // // // // //     prompt: Number(usageRaw.prompt_tokens ?? 0),
// // // // // // // // //     completion: Number(usageRaw.completion_tokens ?? 0),
// // // // // // // // //     total: Number(usageRaw.total_tokens ?? 0),
// // // // // // // // //   };

// // // // // // // // //   // Increment your per-user usage meter with *real* total tokens (best-effort)
// // // // // // // // //   if (usageObj.total > 0) {
// // // // // // // // //     this.incrementUserTokens(usageObj.total).catch(() => {});
// // // // // // // // //   }

// // // // // // // // //   return {
// // // // // // // // //     optimizedText,
// // // // // // // // //     tokens: displayTokens,        // for display
// // // // // // // // //     words: optimizedCount.words,  // for display
// // // // // // // // //     suggestions,
// // // // // // // // //     usage: usageObj,              // <- NEW: pass real usage up
// // // // // // // // //   };
// // // // // // // // // }



// // // // // // // // //   // Perplexity
// // // // // // // // //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // // //     const response = await fetch('https://api.perplexity.ai/chat/completions', {
// // // // // // // // //       method: 'POST',
// // // // // // // // //       headers: {
// // // // // // // // //         'Content-Type': 'application/json',
// // // // // // // // //         Authorization: `Bearer ${this.config.apiKey}`,
// // // // // // // // //       },
// // // // // // // // //       body: JSON.stringify({
// // // // // // // // //         model: this.config.model || 'llama-3.1-sonar-small-128k-online',
// // // // // // // // //         messages: [
// // // // // // // // //           {
// // // // // // // // //             role: 'system',
// // // // // // // // //             content: `You are an expert at optimizing text to use fewer tokens while preserving the original meaning. 
// // // // // // // // //             Your task is to optimize the input text to be more concise, using fewer tokens, but preserving the core meaning.
// // // // // // // // //             Return a JSON object with the following structure:
// // // // // // // // //             {
// // // // // // // // //               "optimizedText": "the optimized version of the input text",
// // // // // // // // //               "suggestions": ["suggestion 1 for further optimization", "suggestion 2", "suggestion 3"]
// // // // // // // // //             }
// // // // // // // // //             Make the optimized text around ${targetTokens} tokens long.`,
// // // // // // // // //           },
// // // // // // // // //           { role: 'user', content: text },
// // // // // // // // //         ],
// // // // // // // // //         temperature: 0.2,
// // // // // // // // //         max_tokens: 1000,
// // // // // // // // //         response_format: { type: 'json_object' },
// // // // // // // // //       }),
// // // // // // // // //     });

// // // // // // // // //     const data = await response.json();
// // // // // // // // //     if (data.error) throw new Error(data.error.message || 'Error optimizing prompt');

// // // // // // // // //     let result;
// // // // // // // // //     try {
// // // // // // // // //       result = JSON.parse(data.choices[0].message.content);
// // // // // // // // //     } catch {
// // // // // // // // //       throw new Error('Invalid response format from Perplexity');
// // // // // // // // //     }

// // // // // // // // //     const optimizedCount = await this.countTokens(result.optimizedText);
// // // // // // // // //     return {
// // // // // // // // //       optimizedText: result.optimizedText,
// // // // // // // // //       tokens: optimizedCount.tokens,
// // // // // // // // //       words: optimizedCount.words,
// // // // // // // // //       suggestions: result.suggestions || [],
// // // // // // // // //     };
// // // // // // // // //   }

// // // // // // // // //   // Anthropic (placeholder)
// // // // // // // // //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // // // //     return {
// // // // // // // // //       optimizedText: text,
// // // // // // // // //       tokens: originalCount.tokens,
// // // // // // // // //       words: originalCount.words,
// // // // // // // // //       suggestions: ['Anthropic integration pending'],
// // // // // // // // //     };
// // // // // // // // //   }

// // // // // // // // //   // Google (placeholder)
// // // // // // // // //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // // // //     return {
// // // // // // // // //       optimizedText: text,
// // // // // // // // //       tokens: originalCount.tokens,
// // // // // // // // //       words: originalCount.words,
// // // // // // // // //       suggestions: ['Google AI integration pending'],
// // // // // // // // //     };
// // // // // // // // //   }

// // // // // // // // //   /* ------------------------------------------------------------------
// // // // // // // // //    *                NEW: Per-user TOKEN USAGE API
// // // // // // // // //    *  - Tries backend first (credentials: 'include')
// // // // // // // // //    *  - Falls back to per-user localStorage namespace
// // // // // // // // //    * ------------------------------------------------------------------ */

// // // // // // // // //   /** Get usage for current user (or provided userId) */
// // // // // // // // //   async getUserTokenUsage(userId: string = 'default-user'): Promise<UserTokenUsage> {
// // // // // // // // //     try {
// // // // // // // // //       const res = await fetch('/api/user-token-usage', { credentials: 'include' });
// // // // // // // // //       if (res.ok) return (await res.json()) as UserTokenUsage;
// // // // // // // // //       // If backend returns 404 or non-ok, fall through to local fallback
// // // // // // // // //     } catch {
// // // // // // // // //       // network/backend not available -> fallback
// // // // // // // // //     }

// // // // // // // // //     // Fallback: namespaced local storage
// // // // // // // // //     const total = Number(localStorage.getItem(usageKey(userId)) || '0');
// // // // // // // // //     const limit = Number(localStorage.getItem(limitKey(userId)) || DEFAULT_LIMIT);
// // // // // // // // //     return { totalTokensUsed: total, tokenLimit: limit };
// // // // // // // // //   }

// // // // // // // // //   /** Increase usage by amount for current user (or provided userId) */
// // // // // // // // //   async incrementUserTokens(amount: number, userId: string = 'default-user'): Promise<void> {
// // // // // // // // //     try {
// // // // // // // // //       const res = await fetch('/api/user-token-usage/increment', {
// // // // // // // // //         method: 'POST',
// // // // // // // // //         credentials: 'include',
// // // // // // // // //         headers: { 'Content-Type': 'application/json' },
// // // // // // // // //         body: JSON.stringify({ amount }),
// // // // // // // // //       });
// // // // // // // // //       if (res.ok) return;
// // // // // // // // //       // Fall through if backend not ok
// // // // // // // // //     } catch {
// // // // // // // // //       // network/backend not available -> fallback
// // // // // // // // //     }

// // // // // // // // //     // Fallback: local, per-user
// // // // // // // // //     const current = Number(localStorage.getItem(usageKey(userId)) || '0');
// // // // // // // // //     localStorage.setItem(usageKey(userId), String(current + Math.max(0, amount)));
// // // // // // // // //   }

// // // // // // // // //   /** Set per-user token limit (admin/user setting) */
// // // // // // // // //   async setUserTokenLimit(limit: number, userId: string = 'default-user'): Promise<void> {
// // // // // // // // //     try {
// // // // // // // // //       const res = await fetch('/api/user-token-usage/limit', {
// // // // // // // // //         method: 'POST',
// // // // // // // // //         credentials: 'include',
// // // // // // // // //         headers: { 'Content-Type': 'application/json' },
// // // // // // // // //         body: JSON.stringify({ limit }),
// // // // // // // // //       });
// // // // // // // // //       if (res.ok) return;
// // // // // // // // //     } catch {
// // // // // // // // //       // fallback
// // // // // // // // //     }
// // // // // // // // //     localStorage.setItem(limitKey(userId), String(limit));
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // export const llmService = new LLMService();




// // // // // // // // //new code
// // // // // // // // // export type LLMProvider = 'openai' | 'perplexity' | 'anthropic' | 'google' | 'other'; 
// // // // // // // // export type LLMProvider = string;
// // // // // // // // export interface LLMConfig {
// // // // // // // //   provider: LLMProvider;
// // // // // // // //   apiKey: string;
// // // // // // // //   model?: string;
// // // // // // // //   maxTokens?: number;
// // // // // // // // }

// // // // // // // // export interface OptimizeUsage {
// // // // // // // //   prompt: number;       // data.usage.prompt_tokens
// // // // // // // //   completion: number;   // data.usage.completion_tokens
// // // // // // // //   total: number;        // data.usage.total_tokens
// // // // // // // // }

// // // // // // // // export interface TokenizerResponse {
// // // // // // // //   tokens: number;
// // // // // // // //   words: number;
// // // // // // // // }

// // // // // // // // export interface OptimizeResponse {
// // // // // // // //   optimizedText: string;
// // // // // // // //   tokens: number;
// // // // // // // //   words: number;
// // // // // // // //   suggestions: string[];
// // // // // // // // }

// // // // // // // // export interface OptimizeResponse {
// // // // // // // //   optimizedText: string;
// // // // // // // //   tokens: number;
// // // // // // // //   words: number;
// // // // // // // //   suggestions: string[];
// // // // // // // //   usage?: OptimizeUsage;   // <- NEW
// // // // // // // // }

// // // // // // // // /** ===== NEW: per-user usage types ===== */
// // // // // // // // export interface UserTokenUsage {
// // // // // // // //   totalTokensUsed: number;
// // // // // // // //   tokenLimit: number;
// // // // // // // // }

// // // // // // // // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// // // // // // // //   openai: 'gpt-4o-mini',
// // // // // // // //   perplexity: 'llama-3.1-sonar-small-128k-online',
// // // // // // // //   anthropic: 'claude-instant',
// // // // // // // //   google: 'gemini-pro',
// // // // // // // //   other: 'generic',
// // // // // // // // };

// // // // // // // // /** ===== Helpers for fallback storage (namespaced by user) ===== */
// // // // // // // // const usageKey = (userId: string) => `usage_total_tokens:${userId}`;
// // // // // // // // const limitKey = (userId: string) => `usage_token_limit:${userId}`;
// // // // // // // // const DEFAULT_LIMIT = 100_000;

// // // // // // // // class LLMService {
// // // // // // // //   private config: LLMConfig = {
// // // // // // // //     provider: 'openai',
// // // // // // // //     apiKey: '',
// // // // // // // //     model: 'gpt-4o-mini',
// // // // // // // //   };

// // // // // // // //   constructor() {
// // // // // // // //     this.loadConfig();
// // // // // // // //   }

// // // // // // // //   private loadConfig() {
// // // // // // // //     const savedProvider = localStorage.getItem('llm_provider') || 'openai';
// // // // // // // //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// // // // // // // //     const savedModel =
// // // // // // // //       localStorage.getItem(`${savedProvider}_model`) ||
// // // // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // // // //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || '';
// // // // // // // //     const defaultModelFromEnv =
// // // // // // // //       import.meta.env.VITE_DEFAULT_MODEL ||
// // // // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // // // //     this.config = {
// // // // // // // //       provider: savedProvider as LLMProvider,
// // // // // // // //       apiKey: savedApiKey || (savedProvider === 'openai' ? defaultKeyFromEnv : ''),
// // // // // // // //       model: savedModel || (savedProvider === 'openai' ? defaultModelFromEnv : ''),
// // // // // // // //     };
// // // // // // // //   }

// // // // // // // //   private parseJsonObject(content: string): any {
// // // // // // // //     const trimmed = content?.trim?.() || "";
// // // // // // // //     // 1) ```json ... ``` fences
// // // // // // // //     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // // // // // // //     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// // // // // // // //     // 2) Direct parse
// // // // // // // //     try { return JSON.parse(candidate); } catch {}

// // // // // // // //     // 3) Fallback: extract first {...} block
// // // // // // // //     const first = candidate.indexOf("{");
// // // // // // // //     const last = candidate.lastIndexOf("}");
// // // // // // // //     if (first !== -1 && last !== -1 && last > first) {
// // // // // // // //       try { return JSON.parse(candidate.slice(first, last + 1)); } catch {}
// // // // // // // //     }
// // // // // // // //     throw new Error("Invalid JSON received from model");
// // // // // // // //   }

// // // // // // // //   setConfig(config: Partial<LLMConfig>) {
// // // // // // // //     this.config = { ...this.config, ...config };
// // // // // // // //     localStorage.setItem('llm_provider', this.config.provider);
// // // // // // // //     if (this.config.apiKey) {
// // // // // // // //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// // // // // // // //     }
// // // // // // // //     if (this.config.model) {
// // // // // // // //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// // // // // // // //     }
// // // // // // // //   }

// // // // // // // //   getConfig(): LLMConfig {
// // // // // // // //     return { ...this.config };
// // // // // // // //   }

// // // // // // // //   async countTokens(text: string): Promise<TokenizerResponse> {
// // // // // // // //     const words = text.split(/\s+/).filter(Boolean).length;
// // // // // // // //     let tokenMultiplier = 1.3;

// // // // // // // //     switch (this.config.provider) {
// // // // // // // //       case 'openai':
// // // // // // // //         tokenMultiplier = 1.3;
// // // // // // // //         break;
// // // // // // // //       case 'perplexity':
// // // // // // // //         tokenMultiplier = 1.35;
// // // // // // // //         break;
// // // // // // // //       case 'anthropic':
// // // // // // // //         tokenMultiplier = 1.25;
// // // // // // // //         break;
// // // // // // // //       case 'google':
// // // // // // // //         tokenMultiplier = 1.2;
// // // // // // // //         break;
// // // // // // // //       default:
// // // // // // // //         tokenMultiplier = 1.3;
// // // // // // // //     }

// // // // // // // //     const tokens = Math.round(words * tokenMultiplier);
// // // // // // // //     return { tokens, words };
// // // // // // // //   }

// // // // // // // //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// // // // // // // //     if (!this.config.apiKey) {
// // // // // // // //       throw new Error('API key not set');
// // // // // // // //     }

// // // // // // // //     try {
// // // // // // // //       const originalCount = await this.countTokens(text);
// // // // // // // //       const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// // // // // // // //       switch (this.config.provider) {
// // // // // // // //         case 'openai':
// // // // // // // //           return this.optimizeWithOpenAI(text, target);
// // // // // // // //         case 'perplexity':
// // // // // // // //           return this.optimizeWithPerplexity(text, target);
// // // // // // // //         case 'anthropic':
// // // // // // // //           return this.optimizeWithAnthropic(text, target);
// // // // // // // //         case 'google':
// // // // // // // //           return this.optimizeWithGoogle(text, target);
// // // // // // // //         default:
// // // // // // // //           return this.optimizeWithOpenAI(text, target);
// // // // // // // //       }
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error('Error optimizing prompt:', error);
// // // // // // // //       throw error;
// // // // // // // //     }
// // // // // // // //   }

// // // // // // // //   // OpenAI Optimizer
// // // // // // // //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();
// // // // // // // //     if (!apiKey) throw new Error("OpenAI API key not set");

// // // // // // // //     const body = {
// // // // // // // //       model,
// // // // // // // //       temperature: 0.2,
// // // // // // // //       max_tokens: 1024,
// // // // // // // //       messages: [
// // // // // // // //         {
// // // // // // // //           role: "system",
// // // // // // // //           content: `You are an expert at optimizing text to use fewer tokens while preserving meaning.
// // // // // // // // Return ONLY a strict JSON object with this shape:
// // // // // // // // {
// // // // // // // //   "optimizedText": "string",
// // // // // // // //   "suggestions": ["string", "string", "string"]
// // // // // // // // }
// // // // // // // // Make the optimizedText roughly ${targetTokens} tokens long (concise but faithful).`,
// // // // // // // //         },
// // // // // // // //         { role: "user", content: text },
// // // // // // // //       ],
// // // // // // // //       response_format: { type: "json_object" },
// // // // // // // //     };

// // // // // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // // //       method: "POST",
// // // // // // // //       headers: {
// // // // // // // //         "Content-Type": "application/json",
// // // // // // // //         Authorization: `Bearer ${apiKey}`,
// // // // // // // //       },
// // // // // // // //       body: JSON.stringify(body),
// // // // // // // //     });

// // // // // // // //     const data = await res.json();
// // // // // // // //     if (!res.ok) {
// // // // // // // //       const message = data?.error?.message || `OpenAI error (${res.status})`;
// // // // // // // //       throw new Error(message);
// // // // // // // //     }

// // // // // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // // // //     const parsed = this.parseJsonObject(raw);

// // // // // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // // // // //     const usageRaw = (data?.usage ?? {}) as {
// // // // // // // //       prompt_tokens?: number;
// // // // // // // //       completion_tokens?: number;
// // // // // // // //       total_tokens?: number;
// // // // // // // //     };

// // // // // // // //     const displayTokens =
// // // // // // // //       typeof usageRaw.completion_tokens === "number"
// // // // // // // //         ? usageRaw.completion_tokens
// // // // // // // //         : optimizedCount.tokens;

// // // // // // // //     const usageObj = {
// // // // // // // //       prompt: Number(usageRaw.prompt_tokens ?? 0),
// // // // // // // //       completion: Number(usageRaw.completion_tokens ?? 0),
// // // // // // // //       total: Number(usageRaw.total_tokens ?? 0),
// // // // // // // //     };

// // // // // // // //     if (usageObj.total > 0) {
// // // // // // // //       this.incrementUserTokens(usageObj.total).catch(() => {});
// // // // // // // //     }

// // // // // // // //     return {
// // // // // // // //       optimizedText,
// // // // // // // //       tokens: displayTokens,
// // // // // // // //       words: optimizedCount.words,
// // // // // // // //       suggestions,
// // // // // // // //       usage: usageObj,
// // // // // // // //     };
// // // // // // // //   }

// // // // // // // //   // ========= NEW SMARTGEN METHOD =========
// // // // // // // //   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// // // // // // // //     if (!this.config.apiKey) {
// // // // // // // //       throw new Error("API key not set");
// // // // // // // //     }

// // // // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();

// // // // // // // //     const body = {
// // // // // // // //       model,
// // // // // // // //       temperature: 0.3,
// // // // // // // //       max_tokens: 1500,
// // // // // // // //       messages: [
// // // // // // // //         {
// // // // // // // //           role: "system",
// // // // // // // //           content: `Act as a highly skilled domain expert, professional writer, and educator. 
// // // // // // // // I will give you a topic, and you will generate a detailed, structured, and engaging response.

// // // // // // // // Rules you must follow:
// // // // // // // // 1. Understand the Audience.
// // // // // // // // 2. Clear Structure: Title, Introduction, Prerequisites, Steps, Examples, Summary, Next Steps.
// // // // // // // // 3. Depth & Clarity: explain why, not just what.
// // // // // // // // 4. Tone: professional yet friendly.
// // // // // // // // 5. Formatting: headings, subheadings, bullet points.
// // // // // // // // 6. Adaptability: code snippets, business frameworks, motivational tips depending on topic.
// // // // // // // // 7. Output Length: full, standalone resource.
// // // // // // // // 8. Quick Summary: 5 bullet points at end.

// // // // // // // // Return ONLY JSON in this shape:
// // // // // // // // {
// // // // // // // //   "optimizedText": "Expanded, detailed response here",
// // // // // // // //   "suggestions": ["Alternative way 1", "Alternative way 2", "Alternative way 3"]
// // // // // // // // }`,
// // // // // // // //         },
// // // // // // // //         { role: "user", content: text },
// // // // // // // //       ],
// // // // // // // //       response_format: { type: "json_object" },
// // // // // // // //     };

// // // // // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // // //       method: "POST",
// // // // // // // //       headers: {
// // // // // // // //         "Content-Type": "application/json",
// // // // // // // //         Authorization: `Bearer ${apiKey}`,
// // // // // // // //       },
// // // // // // // //       body: JSON.stringify(body),
// // // // // // // //     });

// // // // // // // //     const data = await res.json();
// // // // // // // //     if (!res.ok) {
// // // // // // // //       const message = data?.error?.message || `OpenAI error (${res.status})`;
// // // // // // // //       throw new Error(message);
// // // // // // // //     }

// // // // // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // // // //     const parsed = this.parseJsonObject(raw);

// // // // // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // // // // //     return {
// // // // // // // //       optimizedText,
// // // // // // // //       tokens: optimizedCount.tokens,
// // // // // // // //       words: optimizedCount.words,
// // // // // // // //       suggestions,
// // // // // // // //     };
// // // // // // // //   }

// // // // // // // //   // Perplexity (Optimizer)
// // // // // // // //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // //     const response = await fetch('https://api.perplexity.ai/chat/completions', {
// // // // // // // //       method: 'POST',
// // // // // // // //       headers: {
// // // // // // // //         'Content-Type': 'application/json',
// // // // // // // //         Authorization: `Bearer ${this.config.apiKey}`,
// // // // // // // //       },
// // // // // // // //       body: JSON.stringify({
// // // // // // // //         model: this.config.model || 'llama-3.1-sonar-small-128k-online',
// // // // // // // //         messages: [
// // // // // // // //           {
// // // // // // // //             role: 'system',
// // // // // // // //             content: `You are an advanced Prompt Engineer. 
// // // // // // // // Return JSON with optimizedText and suggestions.`,
// // // // // // // //           },
// // // // // // // //           { role: 'user', content: text },
// // // // // // // //         ],
// // // // // // // //         temperature: 0.2,
// // // // // // // //         max_tokens: 1000,
// // // // // // // //         response_format: { type: 'json_object' },
// // // // // // // //       }),
// // // // // // // //     });

// // // // // // // //     const data = await response.json();
// // // // // // // //     if (data.error) throw new Error(data.error.message || 'Error optimizing prompt');

// // // // // // // //     let result;
// // // // // // // //     try {
// // // // // // // //       result = JSON.parse(data.choices[0].message.content);
// // // // // // // //     } catch {
// // // // // // // //       throw new Error('Invalid response format from Perplexity');
// // // // // // // //     }

// // // // // // // //     const optimizedCount = await this.countTokens(result.optimizedText);
// // // // // // // //     return {
// // // // // // // //       optimizedText: result.optimizedText,
// // // // // // // //       tokens: optimizedCount.tokens,
// // // // // // // //       words: optimizedCount.words,
// // // // // // // //       suggestions: result.suggestions || [],
// // // // // // // //     };
// // // // // // // //   }

// // // // // // // //   // Anthropic (placeholder)
// // // // // // // //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // // //     return {
// // // // // // // //       optimizedText: text,
// // // // // // // //       tokens: originalCount.tokens,
// // // // // // // //       words: originalCount.words,
// // // // // // // //       suggestions: ['Anthropic integration pending'],
// // // // // // // //     };
// // // // // // // //   }

// // // // // // // //   // Google (placeholder)
// // // // // // // //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // // //     return {
// // // // // // // //       optimizedText: text,
// // // // // // // //       tokens: originalCount.tokens,
// // // // // // // //       words: originalCount.words,
// // // // // // // //       suggestions: ['Google AI integration pending'],
// // // // // // // //     };
// // // // // // // //   }

// // // // // // // //   /* ------------------------------------------------------------------
// // // // // // // //    *                NEW: Per-user TOKEN USAGE API
// // // // // // // //    * ------------------------------------------------------------------ */
// // // // // // // //   async getUserTokenUsage(userId: string = 'default-user'): Promise<UserTokenUsage> {
// // // // // // // //     try {
// // // // // // // //       const res = await fetch('/api/user-token-usage', { credentials: 'include' });
// // // // // // // //       if (res.ok) return (await res.json()) as UserTokenUsage;
// // // // // // // //     } catch {}
// // // // // // // //     const total = Number(localStorage.getItem(usageKey(userId)) || '0');
// // // // // // // //     const limit = Number(localStorage.getItem(limitKey(userId)) || DEFAULT_LIMIT);
// // // // // // // //     return { totalTokensUsed: total, tokenLimit: limit };
// // // // // // // //   }

// // // // // // // //   async incrementUserTokens(amount: number, userId: string = 'default-user'): Promise<void> {
// // // // // // // //     try {
// // // // // // // //       const res = await fetch('/api/user-token-usage/increment', {
// // // // // // // //         method: 'POST',
// // // // // // // //         credentials: 'include',
// // // // // // // //         headers: { 'Content-Type': 'application/json' },
// // // // // // // //         body: JSON.stringify({ amount }),
// // // // // // // //       });
// // // // // // // //       if (res.ok) return;
// // // // // // // //     } catch {}
// // // // // // // //     const current = Number(localStorage.getItem(usageKey(userId)) || '0');
// // // // // // // //     localStorage.setItem(usageKey(userId), String(current + Math.max(0, amount)));
// // // // // // // //   }

// // // // // // // //   async setUserTokenLimit(limit: number, userId: string = 'default-user'): Promise<void> {
// // // // // // // //     try {
// // // // // // // //       const res = await fetch('/api/user-token-usage/limit', {
// // // // // // // //         method: 'POST',
// // // // // // // //         credentials: 'include',
// // // // // // // //         headers: { 'Content-Type': 'application/json' },
// // // // // // // //         body: JSON.stringify({ limit }),
// // // // // // // //       });
// // // // // // // //       if (res.ok) return;
// // // // // // // //     } catch {}
// // // // // // // //     localStorage.setItem(limitKey(userId), String(limit));
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // export const llmService = new LLMService();








// // // // // // // export type LLMProvider = string;

// // // // // // // export interface LLMConfig {
// // // // // // //   provider: LLMProvider;
// // // // // // //   apiKey: string;
// // // // // // //   model?: string;
// // // // // // //   maxTokens?: number;
// // // // // // // }

// // // // // // // export interface OptimizeUsage {
// // // // // // //   prompt: number;
// // // // // // //   completion: number;
// // // // // // //   total: number;
// // // // // // // }

// // // // // // // export interface TokenizerResponse {
// // // // // // //   tokens: number;
// // // // // // //   words: number;
// // // // // // // }

// // // // // // // export interface OptimizeResponse {
// // // // // // //   optimizedText: string;
// // // // // // //   tokens: number;
// // // // // // //   words: number;
// // // // // // //   suggestions: string[];
// // // // // // //   usage?: OptimizeUsage;
// // // // // // // }

// // // // // // // export interface UserTokenUsage {
// // // // // // //   totalTokensUsed: number;
// // // // // // //   tokenLimit: number;
// // // // // // // }

// // // // // // // // If you don't need usage endpoints, you don't need API_BASE here either.
// // // // // // // // Keeping in case you re-enable later.
// // // // // // // // const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
// // // // // // // // const apiUrl = (p: string) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;

// // // // // // // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// // // // // // //   openai: "gpt-4o-mini",
// // // // // // //   perplexity: "llama-3.1-sonar-small-128k-online",
// // // // // // //   anthropic: "claude-instant",
// // // // // // //   google: "gemini-pro",
// // // // // // //   other: "generic",
// // // // // // // };

// // // // // // // class LLMService {
// // // // // // //   private config: LLMConfig = {
// // // // // // //     provider: "openai",
// // // // // // //     apiKey: "",
// // // // // // //     model: "gpt-4o-mini",
// // // // // // //   };

// // // // // // //   constructor() {
// // // // // // //     this.loadConfig();
// // // // // // //   }

// // // // // // //   private loadConfig() {
// // // // // // //     const savedProvider = localStorage.getItem("llm_provider") || "openai";
// // // // // // //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// // // // // // //     const savedModel =
// // // // // // //       localStorage.getItem(`${savedProvider}_model`) ||
// // // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // // //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
// // // // // // //     const defaultModelFromEnv =
// // // // // // //       import.meta.env.VITE_DEFAULT_MODEL ||
// // // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // // //     this.config = {
// // // // // // //       provider: savedProvider as LLMProvider,
// // // // // // //       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
// // // // // // //       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
// // // // // // //     };
// // // // // // //   }

// // // // // // //   private parseJsonObject(content: string): any {
// // // // // // //     const trimmed = content?.trim?.() || "";
// // // // // // //     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // // // // // //     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// // // // // // //     try { return JSON.parse(candidate); } catch {}

// // // // // // //     const first = candidate.indexOf("{");
// // // // // // //     const last = candidate.lastIndexOf("}");
// // // // // // //     if (first !== -1 && last !== -1 && last > first) {
// // // // // // //       try { return JSON.parse(candidate.slice(first, last + 1)); } catch {}
// // // // // // //     }
// // // // // // //     throw new Error("Invalid JSON received from model");
// // // // // // //   }

// // // // // // //   setConfig(config: Partial<LLMConfig>) {
// // // // // // //     this.config = { ...this.config, ...config };
// // // // // // //     localStorage.setItem("llm_provider", this.config.provider);
// // // // // // //     if (this.config.apiKey) {
// // // // // // //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// // // // // // //     }
// // // // // // //     if (this.config.model) {
// // // // // // //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// // // // // // //     }
// // // // // // //   }

// // // // // // //   getConfig(): LLMConfig {
// // // // // // //     return { ...this.config };
// // // // // // //   }

// // // // // // //   async countTokens(text: string): Promise<TokenizerResponse> {
// // // // // // //     const words = text.split(/\s+/).filter(Boolean).length;
// // // // // // //     let tokenMultiplier = 1.3;

// // // // // // //     switch (this.config.provider) {
// // // // // // //       case "openai": tokenMultiplier = 1.3; break;
// // // // // // //       case "perplexity": tokenMultiplier = 1.35; break;
// // // // // // //       case "anthropic": tokenMultiplier = 1.25; break;
// // // // // // //       case "google": tokenMultiplier = 1.2; break;
// // // // // // //       default: tokenMultiplier = 1.3;
// // // // // // //     }

// // // // // // //     const tokens = Math.round(words * tokenMultiplier);
// // // // // // //     return { tokens, words };
// // // // // // //   }

// // // // // // //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// // // // // // //     if (!this.config.apiKey) throw new Error("API key not set");

// // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // //     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// // // // // // //     switch (this.config.provider) {
// // // // // // //       case "openai":
// // // // // // //         return this.optimizeWithOpenAI(text, target);
// // // // // // //       case "perplexity":
// // // // // // //         return this.optimizeWithPerplexity(text, target);
// // // // // // //       case "anthropic":
// // // // // // //         return this.optimizeWithAnthropic(text, target);
// // // // // // //       case "google":
// // // // // // //         return this.optimizeWithGoogle(text, target);
// // // // // // //       default:
// // // // // // //         return this.optimizeWithOpenAI(text, target);
// // // // // // //     }
// // // // // // //   }

// // // // // // //   // OpenAI Optimizer
// // // // // // //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();
// // // // // // //     if (!apiKey) throw new Error("OpenAI API key not set");

// // // // // // //     const body = {
// // // // // // //       model,
// // // // // // //       temperature: 0.2,
// // // // // // //       max_tokens: 1024,
// // // // // // //       messages: [
// // // // // // //         {
// // // // // // //           role: "system",
// // // // // // //           content: `You are an expert at optimizing text to use fewer tokens while preserving meaning.
// // // // // // // Return ONLY a strict JSON object with this shape:
// // // // // // // {
// // // // // // //   "optimizedText": "string",
// // // // // // //   "suggestions": ["string", "string", "string"]
// // // // // // // }
// // // // // // // Make the optimizedText roughly ${targetTokens} tokens long (concise but faithful).`,
// // // // // // //         },
// // // // // // //         { role: "user", content: text },
// // // // // // //       ],
// // // // // // //       response_format: { type: "json_object" },
// // // // // // //     };

// // // // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // //       method: "POST",
// // // // // // //       headers: {
// // // // // // //         "Content-Type": "application/json",
// // // // // // //         Authorization: `Bearer ${apiKey}`,
// // // // // // //       },
// // // // // // //       body: JSON.stringify(body),
// // // // // // //     });

// // // // // // //     const data = await res.json();
// // // // // // //     if (!res.ok) {
// // // // // // //       const message = data?.error?.message || `OpenAI error (${res.status})`;
// // // // // // //       throw new Error(message);
// // // // // // //     }

// // // // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // // //     const parsed = this.parseJsonObject(raw);

// // // // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // // // //     const usageRaw = (data?.usage ?? {}) as {
// // // // // // //       prompt_tokens?: number;
// // // // // // //       completion_tokens?: number;
// // // // // // //       total_tokens?: number;
// // // // // // //     };

// // // // // // //     const displayTokens =
// // // // // // //       typeof usageRaw.completion_tokens === "number"
// // // // // // //         ? usageRaw.completion_tokens
// // // // // // //         : optimizedCount.tokens;

// // // // // // //     const usageObj: OptimizeUsage = {
// // // // // // //       prompt: Number(usageRaw.prompt_tokens ?? 0),
// // // // // // //       completion: Number(usageRaw.completion_tokens ?? 0),
// // // // // // //       total: Number(usageRaw.total_tokens ?? 0),
// // // // // // //     };

// // // // // // //     // ⛔ No server token-usage tracking here (you handle tokens in your backend on /api/promptoptimizer)

// // // // // // //     return {
// // // // // // //       optimizedText,
// // // // // // //       tokens: displayTokens,
// // // // // // //       words: optimizedCount.words,
// // // // // // //       suggestions,
// // // // // // //       usage: usageObj,
// // // // // // //     };
// // // // // // //   }

// // // // // // //   // Perplexity (Optimizer)
// // // // // // //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // //     const response = await fetch("https://api.perplexity.ai/chat/completions", {
// // // // // // //       method: "POST",
// // // // // // //       headers: {
// // // // // // //         "Content-Type": "application/json",
// // // // // // //         Authorization: `Bearer ${this.config.apiKey}`,
// // // // // // //       },
// // // // // // //       body: JSON.stringify({
// // // // // // //         model: this.config.model || "llama-3.1-sonar-small-128k-online",
// // // // // // //         messages: [
// // // // // // //           {
// // // // // // //             role: "system",
// // // // // // //             content: `You are an advanced Prompt Engineer. 
// // // // // // // Return JSON with optimizedText and suggestions.`,
// // // // // // //           },
// // // // // // //           { role: "user", content: text },
// // // // // // //         ],
// // // // // // //         temperature: 0.2,
// // // // // // //         max_tokens: 1000,
// // // // // // //         response_format: { type: "json_object" },
// // // // // // //       }),
// // // // // // //     });

// // // // // // //     const data = await response.json();
// // // // // // //     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

// // // // // // //     let result;
// // // // // // //     try {
// // // // // // //       result = JSON.parse(data.choices[0].message.content);
// // // // // // //     } catch {
// // // // // // //       throw new Error("Invalid response format from Perplexity");
// // // // // // //     }

// // // // // // //     const optimizedCount = await this.countTokens(result.optimizedText);
// // // // // // //     return {
// // // // // // //       optimizedText: result.optimizedText,
// // // // // // //       tokens: optimizedCount.tokens,
// // // // // // //       words: optimizedCount.words,
// // // // // // //       suggestions: result.suggestions || [],
// // // // // // //     };
// // // // // // //   }

// // // // // // //   // Anthropic (placeholder)
// // // // // // //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // //     return {
// // // // // // //       optimizedText: text,
// // // // // // //       tokens: originalCount.tokens,
// // // // // // //       words: originalCount.words,
// // // // // // //       suggestions: ["Anthropic integration pending"],
// // // // // // //     };
// // // // // // //   }

// // // // // // //   // Google (placeholder)
// // // // // // //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // //     return {
// // // // // // //       optimizedText: text,
// // // // // // //       tokens: originalCount.tokens,
// // // // // // //       words: originalCount.words,
// // // // // // //       suggestions: ["Google AI integration pending"],
// // // // // // //     };
// // // // // // //   }

// // // // // // //   /* ------------------------------------------------------------------
// // // // // // //    * No-op usage helpers (so your UI code doesn’t break)
// // // // // // //    * ------------------------------------------------------------------ */
// // // // // // //   async getUserTokenUsage(): Promise<UserTokenUsage> {
// // // // // // //     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
// // // // // // //   }
// // // // // // //   async incrementUserTokens(): Promise<void> {
// // // // // // //     /* no-op */
// // // // // // //   }
// // // // // // //   async setUserTokenLimit(): Promise<void> {
// // // // // // //     /* no-op */
// // // // // // //   }
// // // // // // // }
// // // // // // // export const llmService = new LLMService();



// // // // // // //after correcting 

// // // // // // // src/services/llmService.ts

// // // // // // // export type LLMProvider = string;

// // // // // // // export interface LLMConfig {
// // // // // // //   provider: LLMProvider;
// // // // // // //   apiKey: string;
// // // // // // //   model?: string;
// // // // // // //   maxTokens?: number;
// // // // // // // }


// // // // // // // export interface GenerateDetailedOptions {
// // // // // // //   maxWords?: number; // hard cap for optimizedText word count
// // // // // // // }

// // // // // // // export interface OptimizeUsage {
// // // // // // //   prompt: number;
// // // // // // //   completion: number;
// // // // // // //   total: number;
// // // // // // // }

// // // // // // // export interface TokenizerResponse {
// // // // // // //   tokens: number;
// // // // // // //   words: number;
// // // // // // // }

// // // // // // // export interface OptimizeResponse {
// // // // // // //   optimizedText: string;
// // // // // // //   tokens: number;
// // // // // // //   words: number;
// // // // // // //   suggestions: string[];
// // // // // // //   usage?: OptimizeUsage;
// // // // // // // }

// // // // // // // export interface UserTokenUsage {
// // // // // // //   totalTokensUsed: number;
// // // // // // //   tokenLimit: number;
// // // // // // // }

// // // // // // // // If you don't need usage endpoints, you don't need API_BASE here either.
// // // // // // // // Keeping in case you re-enable later.
// // // // // // // // const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
// // // // // // // // const apiUrl = (p: string) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;

// // // // // // // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// // // // // // //   openai: "gpt-4o-mini",
// // // // // // //   perplexity: "llama-3.1-sonar-small-128k-online",
// // // // // // //   anthropic: "claude-instant",
// // // // // // //   google: "gemini-pro",
// // // // // // //   other: "generic",
// // // // // // // };

// // // // // // // class LLMService {
// // // // // // //   private config: LLMConfig = {
// // // // // // //     provider: "openai",
// // // // // // //     apiKey: "",
// // // // // // //     model: "gpt-4o-mini",
// // // // // // //   };

// // // // // // //   constructor() {
// // // // // // //     this.loadConfig();
// // // // // // //   }

// // // // // // //   private loadConfig() {
// // // // // // //     const savedProvider = localStorage.getItem("llm_provider") || "openai";
// // // // // // //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// // // // // // //     const savedModel =
// // // // // // //       localStorage.getItem(`${savedProvider}_model`) ||
// // // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // // //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
// // // // // // //     const defaultModelFromEnv =
// // // // // // //       import.meta.env.VITE_DEFAULT_MODEL ||
// // // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // // //     this.config = {
// // // // // // //       provider: savedProvider as LLMProvider,
// // // // // // //       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
// // // // // // //       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
// // // // // // //     };
// // // // // // //   }

// // // // // // //   private parseJsonObject(content: string): any {
// // // // // // //     const trimmed = content?.trim?.() || "";
// // // // // // //     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // // // // // //     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// // // // // // //     try { return JSON.parse(candidate); } catch {}

// // // // // // //     const first = candidate.indexOf("{");
// // // // // // //     const last = candidate.lastIndexOf("}");
// // // // // // //     if (first !== -1 && last !== -1 && last > first) {
// // // // // // //       try { return JSON.parse(candidate.slice(first, last + 1)); } catch {}
// // // // // // //     }
// // // // // // //     throw new Error("Invalid JSON received from model");
// // // // // // //   }

// // // // // // //   setConfig(config: Partial<LLMConfig>) {
// // // // // // //     this.config = { ...this.config, ...config };
// // // // // // //     localStorage.setItem("llm_provider", this.config.provider);
// // // // // // //     if (this.config.apiKey) {
// // // // // // //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// // // // // // //     }
// // // // // // //     if (this.config.model) {
// // // // // // //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// // // // // // //     }
// // // // // // //   }

// // // // // // //   getConfig(): LLMConfig {
// // // // // // //     return { ...this.config };
// // // // // // //   }

// // // // // // //   async countTokens(text: string): Promise<TokenizerResponse> {
// // // // // // //     const words = text.split(/\s+/).filter(Boolean).length;
// // // // // // //     let tokenMultiplier = 1.3;

// // // // // // //     switch (this.config.provider) {
// // // // // // //       case "openai": tokenMultiplier = 1.3; break;
// // // // // // //       case "perplexity": tokenMultiplier = 1.35; break;
// // // // // // //       case "anthropic": tokenMultiplier = 1.25; break;
// // // // // // //       case "google": tokenMultiplier = 1.2; break;
// // // // // // //       default: tokenMultiplier = 1.3;
// // // // // // //     }

// // // // // // //     const tokens = Math.round(words * tokenMultiplier);
// // // // // // //     return { tokens, words };
// // // // // // //   }

// // // // // // //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// // // // // // //     if (!this.config.apiKey) throw new Error("API key not set");

// // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // //     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// // // // // // //     switch (this.config.provider) {
// // // // // // //       case "openai":
// // // // // // //         return this.optimizeWithOpenAI(text, target);
// // // // // // //       case "perplexity":
// // // // // // //         return this.optimizeWithPerplexity(text, target);
// // // // // // //       case "anthropic":
// // // // // // //         return this.optimizeWithAnthropic(text, target);
// // // // // // //       case "google":
// // // // // // //         return this.optimizeWithGoogle(text, target);
// // // // // // //       default:
// // // // // // //         return this.optimizeWithOpenAI(text, target);
// // // // // // //     }
// // // // // // //   }

// // // // // // //   // OpenAI Optimizer
// // // // // // // //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();
// // // // // // // //     if (!apiKey) throw new Error("OpenAI API key not set");

// // // // // // // //     const body = {
// // // // // // // //       model,
// // // // // // // //       temperature: 0.2,
// // // // // // // //       max_tokens: 1024,
// // // // // // // //       messages: [
// // // // // // // //         {
// // // // // // // //           role: "system",
// // // // // // // //           content: `You are an expert at optimizing text to use fewer tokens while preserving meaning.
// // // // // // // // Return ONLY a strict JSON object with this shape:
// // // // // // // // {
// // // // // // // //   "optimizedText": "string",
// // // // // // // //   "suggestions": ["string", "string", "string"]
// // // // // // // // }
// // // // // // // // Make the optimizedText roughly ${targetTokens} tokens long (concise but faithful).`,
// // // // // // // //         },
// // // // // // // //         { role: "user", content: text },
// // // // // // // //       ],
// // // // // // // //       response_format: { type: "json_object" },
// // // // // // // //     };

// // // // // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // // //       method: "POST",
// // // // // // // //       headers: {
// // // // // // // //         "Content-Type": "application/json",
// // // // // // // //         Authorization: `Bearer ${apiKey}`,
// // // // // // // //       },
// // // // // // // //       body: JSON.stringify(body),
// // // // // // // //     });

// // // // // // // //     const data = await res.json();
// // // // // // // //     if (!res.ok) {
// // // // // // // //       const message = data?.error?.message || `OpenAI error (${res.status})`;
// // // // // // // //       throw new Error(message);
// // // // // // // //     }

// // // // // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // // // //     const parsed = this.parseJsonObject(raw);

// // // // // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // // // // //     const usageRaw = (data?.usage ?? {}) as {
// // // // // // // //       prompt_tokens?: number;
// // // // // // // //       completion_tokens?: number;
// // // // // // // //       total_tokens?: number;
// // // // // // // //     };

// // // // // // // //     const displayTokens =
// // // // // // // //       typeof usageRaw.completion_tokens === "number"
// // // // // // // //         ? usageRaw.completion_tokens
// // // // // // // //         : optimizedCount.tokens;

// // // // // // // //     const usageObj: OptimizeUsage = {
// // // // // // // //       prompt: Number(usageRaw.prompt_tokens ?? 0),
// // // // // // // //       completion: Number(usageRaw.completion_tokens ?? 0),
// // // // // // // //       total: Number(usageRaw.total_tokens ?? 0),
// // // // // // // //     };

// // // // // // // //     // ⛔ No server token-usage tracking here (you handle tokens in your backend on /api/promptoptimizer)

// // // // // // // //     return {
// // // // // // // //       optimizedText,
// // // // // // // //       tokens: displayTokens,
// // // // // // // //       words: optimizedCount.words,
// // // // // // // //       suggestions,
// // // // // // // //       usage: usageObj,
// // // // // // // //     };
// // // // // // // //   }


















// // // // // // // // ... keep the rest of the file as-is above ...

// // // // // // //   // OpenAI Optimizer
// // // // // // //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();
// // // // // // //     if (!apiKey) throw new Error("OpenAI API key not set");

// // // // // // //     const body = {
// // // // // // //       model,
// // // // // // //       temperature: 0.3,
// // // // // // //       max_tokens: 1024,
// // // // // // //       messages: [
// // // // // // //         {
// // // // // // //           role: "system",
// // // // // // //           content: `You are an expert prompt optimizer. 
// // // // // // // You must return STRICT JSON with this exact shape:
// // // // // // // {
// // // // // // //   "optimizedText": "string",
// // // // // // //   "suggestions": ["string", "string", "string"]
// // // // // // // }

// // // // // // // Rules for all strings:
// // // // // // // - No meta phrases (e.g., "Here is", "Try", "Alternative", "Version", "Suggestion").
// // // // // // // - No weak verbs like "refine", "rewrite", "improve", "optimize", "streamline", "enhance".
// // // // // // // - Write as a single, direct, imperative prompt (one sentence where possible).
// // // // // // // - No instructional boilerplate like "keep it under 120 words", "constraints", "output".
// // // // // // // - Preserve the original intent and required details.
// // // // // // // - Be concise and token-efficient (aim ≈ ${targetTokens} tokens for optimizedText).
// // // // // // // - Ensure "suggestions" contains exactly 3 DISTINCT optimized alternatives of the prompt (not tips).`,
// // // // // // //         },
// // // // // // //         { role: "user", content: text },
// // // // // // //       ],
// // // // // // //       response_format: { type: "json_object" },
// // // // // // //     };

// // // // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // //       method: "POST",
// // // // // // //       headers: {
// // // // // // //         "Content-Type": "application/json",
// // // // // // //         Authorization: `Bearer ${apiKey}`,
// // // // // // //       },
// // // // // // //       body: JSON.stringify(body),
// // // // // // //     });

// // // // // // //     const data = await res.json();
// // // // // // //     if (!res.ok) {
// // // // // // //       const message = data?.error?.message || `OpenAI error (${res.status})`;
// // // // // // //       throw new Error(message);
// // // // // // //     }

// // // // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // // //     const parsed = this.parseJsonObject(raw);

// // // // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // // // //     const usageRaw = (data?.usage ?? {}) as {
// // // // // // //       prompt_tokens?: number;
// // // // // // //       completion_tokens?: number;
// // // // // // //       total_tokens?: number;
// // // // // // //     };

// // // // // // //     const usageObj: OptimizeUsage = {
// // // // // // //       prompt: Number(usageRaw.prompt_tokens ?? 0),
// // // // // // //       completion: Number(usageRaw.completion_tokens ?? 0),
// // // // // // //       total: Number(usageRaw.total_tokens ?? 0),
// // // // // // //     };

// // // // // // //     // Return OpenAI's three optimized alternatives in suggestions
// // // // // // //     return {
// // // // // // //       optimizedText,
// // // // // // //       tokens: optimizedCount.tokens,
// // // // // // //       words: optimizedCount.words,
// // // // // // //       suggestions,
// // // // // // //       usage: usageObj,
// // // // // // //     };
// // // // // // //   }

// // // // // // // // ... keep the rest of the file as-is below ...

// // // // // // //   // ========= SMARTGEN (Detailed Prompt) — ADDED BACK =========
// // // // // // // //   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// // // // // // // //     if (!this.config.apiKey) {
// // // // // // // //       throw new Error("API key not set");
// // // // // // // //     }

// // // // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();

// // // // // // // //     const body = {
// // // // // // // //       model,
// // // // // // // //       temperature: 0.3,
// // // // // // // //       max_tokens: 1500,
// // // // // // // //       messages: [
// // // // // // // //         {
// // // // // // // //           role: "system",
// // // // // // // //           content: `Act as a highly skilled domain expert, professional writer, and educator. 
// // // // // // // // I will give you a topic, and you will generate a detailed, structured, and engaging response.

// // // // // // // // Rules you must follow:
// // // // // // // // 1. Understand the Audience.
// // // // // // // // 2. Clear Structure: Title, Introduction, Prerequisites, Steps, Examples, Summary, Next Steps.
// // // // // // // // 3. Depth & Clarity: explain why, not just what.
// // // // // // // // 4. Tone: professional yet friendly.
// // // // // // // // 5. Formatting: headings, subheadings, bullet points.
// // // // // // // // 6. Adaptability: code snippets, business frameworks, motivational tips depending on topic.
// // // // // // // // 7. Output Length: full, standalone resource.
// // // // // // // // 8. Quick Summary: 5 bullet points at end.

// // // // // // // // Return ONLY JSON in this shape:
// // // // // // // // {
// // // // // // // //   "optimizedText": "Expanded, detailed response here",
// // // // // // // //   "suggestions": ["Alternative way 1", "Alternative way 2", "Alternative way 3"]
// // // // // // // // }`,
// // // // // // // //         },
// // // // // // // //         { role: "user", content: text },
// // // // // // // //       ],
// // // // // // // //       response_format: { type: "json_object" },
// // // // // // // //     };

// // // // // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // // //       method: "POST",
// // // // // // // //       headers: {
// // // // // // // //         "Content-Type": "application/json",
// // // // // // // //         Authorization: `Bearer ${apiKey}`,
// // // // // // // //       },
// // // // // // // //       body: JSON.stringify(body),
// // // // // // // //     });

// // // // // // // //     const data = await res.json();
// // // // // // // //     if (!res.ok) {
// // // // // // // //       const message = data?.error?.message || `OpenAI error (${res.status})`;
// // // // // // // //       throw new Error(message);
// // // // // // // //     }

// // // // // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // // // //     const parsed = this.parseJsonObject(raw);

// // // // // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // // // // //     return {
// // // // // // // //       optimizedText,
// // // // // // // //       tokens: optimizedCount.tokens,
// // // // // // // //       words: optimizedCount.words,
// // // // // // // //       suggestions,
// // // // // // // //     };
// // // // // // // //   }






// // // // // // // // --- add this type near other exported types ---


// // // // // // // // ... keep everything else as-is above ...

// // // // // // // // ========= SMARTGEN (Detailed Prompt) — UPDATED =========
// // // // // // // async generateDetailedPrompt(
// // // // // // //   text: string,
// // // // // // //   opts?: GenerateDetailedOptions
// // // // // // // ): Promise<OptimizeResponse> {
// // // // // // //   if (!this.config.apiKey) {
// // // // // // //     throw new Error("API key not set");
// // // // // // //   }

// // // // // // //   const apiKey = (this.config.apiKey || "").trim();
// // // // // // //   const model = (this.config.model || "gpt-4o-mini").trim();

// // // // // // //   // default to concise 120 words unless caller requests otherwise
// // // // // // //   const maxWords = Math.max(20, Math.min(400, Number(opts?.maxWords ?? 120)));

// // // // // // //   // fast: keep tokens low; ~1.6x words is a safe ceiling
// // // // // // //   const max_tokens = Math.min(700, Math.ceil(maxWords * 1.6));

// // // // // // //   const body = {
// // // // // // //     model,
// // // // // // //     temperature: 0.2,              // lower for speed + determinism
// // // // // // //     max_tokens,                     // tight cap for speed
// // // // // // //     // you can also add: "seed": 7 to stabilize outputs
// // // // // // //     messages: [
// // // // // // //       {
// // // // // // //         role: "system",
// // // // // // //         content: `You generate a detailed but concise prompt.

// // // // // // // Return STRICT JSON only:
// // // // // // // {
// // // // // // //   "optimizedText": "string",
// // // // // // //   "suggestions": ["string","string","string"]
// // // // // // // }

// // // // // // // HARD RULES:
// // // // // // // - "optimizedText" MUST be <= ${maxWords} words (hard cap). Stop early rather than exceed.
// // // // // // // - No meta text, no preface, no disclaimers.
// // // // // // // - Be specific and actionable; keep formatting light (short bullets ok).
// // // // // // // - No boilerplate like "tone," "constraints," or "output format" unless explicitly asked.
// // // // // // // - Keep it swift and compact.`,
// // // // // // //       },
// // // // // // //       { role: "user", content: text },
// // // // // // //     ],
// // // // // // //     response_format: { type: "json_object" },
// // // // // // //   };

// // // // // // //   const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // //     method: "POST",
// // // // // // //     headers: {
// // // // // // //       "Content-Type": "application/json",
// // // // // // //       Authorization: `Bearer ${apiKey}`,
// // // // // // //     },
// // // // // // //     body: JSON.stringify(body),
// // // // // // //   });

// // // // // // //   const data = await res.json();
// // // // // // //   if (!res.ok) {
// // // // // // //     const message = data?.error?.message || `OpenAI error (${res.status})`;
// // // // // // //     throw new Error(message);
// // // // // // //   }

// // // // // // //   const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // // //   const parsed = this.parseJsonObject(raw);

// // // // // // //   const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // // //   const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // // //   if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // // //   // (Optional) hard-trim just in case the model went 1–2 words over:
// // // // // // //   const wordFix = optimizedText.split(/\s+/);
// // // // // // //   const withinCap = wordFix.slice(0, maxWords).join(" ");
// // // // // // //   const finalText = wordFix.length > maxWords ? withinCap : optimizedText;

// // // // // // //   const optimizedCount = await this.countTokens(finalText);

// // // // // // //   return {
// // // // // // //     optimizedText: finalText,
// // // // // // //     tokens: optimizedCount.tokens,
// // // // // // //     words: optimizedCount.words,
// // // // // // //     suggestions,
// // // // // // //   };
// // // // // // // }



















// // // // // // //   // Perplexity (Optimizer)
// // // // // // //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // //     const response = await fetch("https://api.perplexity.ai/chat/completions", {
// // // // // // //       method: "POST",
// // // // // // //       headers: {
// // // // // // //         "Content-Type": "application/json",
// // // // // // //         Authorization: `Bearer ${this.config.apiKey}`,
// // // // // // //       },
// // // // // // //       body: JSON.stringify({
// // // // // // //         model: this.config.model || "llama-3.1-sonar-small-128k-online",
// // // // // // //         messages: [
// // // // // // //           {
// // // // // // //             role: "system",
// // // // // // //             content: `You are an advanced Prompt Engineer. 
// // // // // // // Return JSON with optimizedText and suggestions.`,
// // // // // // //           },
// // // // // // //           { role: "user", content: text },
// // // // // // //         ],
// // // // // // //         temperature: 0.2,
// // // // // // //         max_tokens: 1000,
// // // // // // //         response_format: { type: "json_object" },
// // // // // // //       }),
// // // // // // //     });

// // // // // // //     const data = await response.json();
// // // // // // //     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

// // // // // // //     let result;
// // // // // // //     try {
// // // // // // //       result = JSON.parse(data.choices[0].message.content);
// // // // // // //     } catch {
// // // // // // //       throw new Error("Invalid response format from Perplexity");
// // // // // // //     }

// // // // // // //     const optimizedCount = await this.countTokens(result.optimizedText);
// // // // // // //     return {
// // // // // // //       optimizedText: result.optimizedText,
// // // // // // //       tokens: optimizedCount.tokens,
// // // // // // //       words: optimizedCount.words,
// // // // // // //       suggestions: result.suggestions || [],
// // // // // // //     };
// // // // // // //   }

// // // // // // //   // Anthropic (placeholder)
// // // // // // //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // //     return {
// // // // // // //       optimizedText: text,
// // // // // // //       tokens: originalCount.tokens,
// // // // // // //       words: originalCount.words,
// // // // // // //       suggestions: ["Anthropic integration pending"],
// // // // // // //     };
// // // // // // //   }

// // // // // // //   // Google (placeholder)
// // // // // // //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // // //     const originalCount = await this.countTokens(text);
// // // // // // //     return {
// // // // // // //       optimizedText: text,
// // // // // // //       tokens: originalCount.tokens,
// // // // // // //       words: originalCount.words,
// // // // // // //       suggestions: ["Google AI integration pending"],
// // // // // // //     };
// // // // // // //   }

// // // // // // //   /* ------------------------------------------------------------------
// // // // // // //    * No-op usage helpers (so your UI code doesn’t break)
// // // // // // //    * ------------------------------------------------------------------ */
// // // // // // //   async getUserTokenUsage(): Promise<UserTokenUsage> {
// // // // // // //     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
// // // // // // //   }
// // // // // // //   async incrementUserTokens(): Promise<void> {
// // // // // // //     /* no-op */
// // // // // // //   }
// // // // // // //   async setUserTokenLimit(): Promise<void> {
// // // // // // //     /* no-op */
// // // // // // //   }
// // // // // // // }

// // // // // // // export const llmService = new LLMService();



// // // // // // // src/services/llmService.ts
// // // // // // export type LLMProvider = string;

// // // // // // export interface LLMConfig {
// // // // // //   provider: LLMProvider;
// // // // // //   apiKey: string;
// // // // // //   model?: string;
// // // // // //   maxTokens?: number;
// // // // // // }

// // // // // // export interface OptimizeUsage {
// // // // // //   prompt: number;
// // // // // //   completion: number;
// // // // // //   total: number;
// // // // // // }

// // // // // // export interface TokenizerResponse {
// // // // // //   tokens: number;
// // // // // //   words: number;
// // // // // // }

// // // // // // export interface OptimizeResponse {
// // // // // //   optimizedText: string;
// // // // // //   tokens: number;
// // // // // //   words: number;
// // // // // //   suggestions: string[];
// // // // // //   usage?: OptimizeUsage;
// // // // // // }

// // // // // // export interface UserTokenUsage {
// // // // // //   totalTokensUsed: number;
// // // // // //   tokenLimit: number;
// // // // // // }

// // // // // // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// // // // // //   openai: "gpt-4o-mini",
// // // // // //   perplexity: "llama-3.1-sonar-small-128k-online",
// // // // // //   anthropic: "claude-instant",
// // // // // //   google: "gemini-pro",
// // // // // //   other: "generic",
// // // // // // };

// // // // // // class LLMService {
// // // // // //   private config: LLMConfig = {
// // // // // //     provider: "openai",
// // // // // //     apiKey: "",
// // // // // //     model: "gpt-4o-mini",
// // // // // //   };

// // // // // //   constructor() {
// // // // // //     this.loadConfig();
// // // // // //   }

// // // // // //   private loadConfig() {
// // // // // //     const savedProvider = localStorage.getItem("llm_provider") || "openai";
// // // // // //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// // // // // //     const savedModel =
// // // // // //       localStorage.getItem(`${savedProvider}_model`) ||
// // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
// // // // // //     const defaultModelFromEnv =
// // // // // //       import.meta.env.VITE_DEFAULT_MODEL ||
// // // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // // //     this.config = {
// // // // // //       provider: savedProvider as LLMProvider,
// // // // // //       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
// // // // // //       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
// // // // // //     };
// // // // // //   }

// // // // // //   private parseJsonObject(content: string): any {
// // // // // //     const trimmed = content?.trim?.() || "";
// // // // // //     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // // // // //     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// // // // // //     try { return JSON.parse(candidate); } catch {}

// // // // // //     const first = candidate.indexOf("{");
// // // // // //     const last = candidate.lastIndexOf("}");
// // // // // //     if (first !== -1 && last !== -1 && last > first) {
// // // // // //       try { return JSON.parse(candidate.slice(first, last + 1)); } catch {}
// // // // // //     }
// // // // // //     throw new Error("Invalid JSON received from model");
// // // // // //   }

// // // // // //   setConfig(config: Partial<LLMConfig>) {
// // // // // //     this.config = { ...this.config, ...config };
// // // // // //     localStorage.setItem("llm_provider", this.config.provider);
// // // // // //     if (this.config.apiKey) {
// // // // // //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// // // // // //     }
// // // // // //     if (this.config.model) {
// // // // // //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// // // // // //     }
// // // // // //   }

// // // // // //   getConfig(): LLMConfig {
// // // // // //     return { ...this.config };
// // // // // //   }

// // // // // //   async countTokens(text: string): Promise<TokenizerResponse> {
// // // // // //     const words = text.split(/\s+/).filter(Boolean).length;
// // // // // //     let tokenMultiplier = 1.3;

// // // // // //     switch (this.config.provider) {
// // // // // //       case "openai": tokenMultiplier = 1.3; break;
// // // // // //       case "perplexity": tokenMultiplier = 1.35; break;
// // // // // //       case "anthropic": tokenMultiplier = 1.25; break;
// // // // // //       case "google": tokenMultiplier = 1.2; break;
// // // // // //       default: tokenMultiplier = 1.3;
// // // // // //     }

// // // // // //     const tokens = Math.round(words * tokenMultiplier);
// // // // // //     return { tokens, words };
// // // // // //   }

// // // // // //   /** Extract explicit word limit if user wrote “in 100 words”, “limit 200 words”, etc. */
// // // // // //   private extractWordLimit(raw: string): number | null {
// // // // // //     const text = (raw || "").toLowerCase();

// // // // // //     // patterns like: "in 100 words", "within 150 words", "limit 200 words", "about 300 words"
// // // // // //     const pat1 = /\b(?:in|within|limit|about|around|approximately|~|approx)\s+(\d{1,4})\s+words?\b/;
// // // // // //     const m1 = text.match(pat1);
// // // // // //     if (m1 && m1[1]) return Math.max(50, Math.min(1200, Number(m1[1])));

// // // // // //     // bare “[number] words” without a leading verb
// // // // // //     const pat2 = /\b(\d{1,4})\s+words?\b/;
// // // // // //     const m2 = text.match(pat2);
// // // // // //     if (m2 && m2[1]) return Math.max(50, Math.min(1200, Number(m2[1])));

// // // // // //     return null;
// // // // // //   }

// // // // // //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// // // // // //     if (!this.config.apiKey) throw new Error("API key not set");

// // // // // //     const originalCount = await this.countTokens(text);
// // // // // //     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// // // // // //     switch (this.config.provider) {
// // // // // //       case "openai":
// // // // // //         return this.optimizeWithOpenAI(text, target);
// // // // // //       case "perplexity":
// // // // // //         return this.optimizeWithPerplexity(text, target);
// // // // // //       case "anthropic":
// // // // // //         return this.optimizeWithAnthropic(text, target);
// // // // // //       case "google":
// // // // // //         return this.optimizeWithGoogle(text, target);
// // // // // //       default:
// // // // // //         return this.optimizeWithOpenAI(text, target);
// // // // // //     }
// // // // // //   }

// // // // // //   /** OPENAI — token optimizer (unchanged logic) */
// // // // // //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();
// // // // // //     if (!apiKey) throw new Error("OpenAI API key not set");

// // // // // //     const body = {
// // // // // //       model,
// // // // // //       temperature: 0.3,
// // // // // //       max_tokens: 800,
// // // // // //       messages: [
// // // // // //         {
// // // // // //           role: "system",
// // // // // //           content: `You are an expert prompt optimizer. 
// // // // // // Return STRICT JSON:
// // // // // // {"optimizedText": "string","suggestions": ["string","string","string"]}

// // // // // // Rules:
// // // // // // - Short, imperative, preserve meaning.
// // // // // // - Concise (aim ≈ ${targetTokens} tokens).
// // // // // // - No tips; "suggestions" must be 3 distinct optimized alternatives.`,
// // // // // //         },
// // // // // //         { role: "user", content: text },
// // // // // //       ],
// // // // // //       response_format: { type: "json_object" },
// // // // // //     };

// // // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // //       method: "POST",
// // // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
// // // // // //       body: JSON.stringify(body),
// // // // // //     });

// // // // // //     const data = await res.json();
// // // // // //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// // // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // //     const parsed = this.parseJsonObject(raw);

// // // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // // //     const usageRaw = (data?.usage ?? {}) as {
// // // // // //       prompt_tokens?: number;
// // // // // //       completion_tokens?: number;
// // // // // //       total_tokens?: number;
// // // // // //     };

// // // // // //     const usageObj: OptimizeUsage = {
// // // // // //       prompt: Number(usageRaw.prompt_tokens ?? 0),
// // // // // //       completion: Number(usageRaw.completion_tokens ?? 0),
// // // // // //       total: Number(usageRaw.total_tokens ?? 0),
// // // // // //     };

// // // // // //     return {
// // // // // //       optimizedText,
// // // // // //       tokens: optimizedCount.tokens,
// // // // // //       words: optimizedCount.words,
// // // // // //       suggestions,
// // // // // //       usage: usageObj,
// // // // // //     };
// // // // // //   }

// // // // // //   /** SMARTGEN — Detailed prompt generator WITH meta+preface+disclaimers and word control (OpenAI) */
// // // // // //   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// // // // // //     if (!this.config.apiKey) throw new Error("API key not set");

// // // // // //     // 1) word control
// // // // // //     const explicitLimit = this.extractWordLimit(text);
// // // // // //     const defaultWords = 425; // ~400–450
// // // // // //     const targetWords = explicitLimit ?? defaultWords;

// // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();

// // // // // //     // 2) compact + fast system prompt (allows meta, preface, disclaimers)
// // // // // //     const system = `You write a detailed prompt/guide.
// // // // // // Return STRICT JSON:
// // // // // // {"optimizedText":"string","suggestions":["string","string","string"]}

// // // // // // Style rules:
// // // // // // - Start with a one-line meta/preface (e.g., "Here is your detailed prompt:").
// // // // // // - You MAY include disclaimers if relevant (e.g., "As an AI model...").
// // // // // // - Be specific and actionable; bullets are allowed.
// // // // // // - Keep generic boilerplate minimal unless requested.
// // // // // // - Audience-aware, clear sections, concise sentences.

// // // // // // Length:
// // // // // // - If user specifies a word limit, keep VERY close to it (±5%).
// // // // // // - Otherwise write about ${defaultWords} words (~400–450).`;

// // // // // //     // 3) request
// // // // // //     const body = {
// // // // // //       model,
// // // // // //       temperature: 0.25,
// // // // // //       max_tokens: Math.min(1200, Math.ceil(targetWords * 3)), // tighter upper bound => faster
// // // // // //       messages: [
// // // // // //         { role: "system", content: system },
// // // // // //         {
// // // // // //           role: "user",
// // // // // //           content:
// // // // // //             `User topic/request:\n${text}\n\n` +
// // // // // //             `Target length: ${targetWords} words. Respect explicit word limits if present.`,
// // // // // //         },
// // // // // //       ],
// // // // // //       response_format: { type: "json_object" },
// // // // // //     };

// // // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // //       method: "POST",
// // // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
// // // // // //       body: JSON.stringify(body),
// // // // // //     });

// // // // // //     const data = await res.json();
// // // // // //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// // // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // //     const parsed = this.parseJsonObject(raw);

// // // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // // //     return {
// // // // // //       optimizedText,
// // // // // //       tokens: optimizedCount.tokens,
// // // // // //       words: optimizedCount.words,
// // // // // //       suggestions,
// // // // // //     };
// // // // // //   }

// // // // // //   // Perplexity (kept)
// // // // // //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // //     const response = await fetch("https://api.perplexity.ai/chat/completions", {
// // // // // //       method: "POST",
// // // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
// // // // // //       body: JSON.stringify({
// // // // // //         model: this.config.model || "llama-3.1-sonar-small-128k-online",
// // // // // //         messages: [
// // // // // //           { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
// // // // // //           { role: "user", content: text },
// // // // // //         ],
// // // // // //         temperature: 0.2,
// // // // // //         max_tokens: 800,
// // // // // //         response_format: { type: "json_object" },
// // // // // //       }),
// // // // // //     });

// // // // // //     const data = await response.json();
// // // // // //     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

// // // // // //     let result;
// // // // // //     try {
// // // // // //       result = JSON.parse(data.choices[0].message.content);
// // // // // //     } catch {
// // // // // //       throw new Error("Invalid response format from Perplexity");
// // // // // //     }

// // // // // //     const optimizedCount = await this.countTokens(result.optimizedText);
// // // // // //     return {
// // // // // //       optimizedText: result.optimizedText,
// // // // // //       tokens: optimizedCount.tokens,
// // // // // //       words: optimizedCount.words,
// // // // // //       suggestions: result.suggestions || [],
// // // // // //     };
// // // // // //   }

// // // // // //   // Anthropic (placeholder)
// // // // // //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // //     const originalCount = await this.countTokens(text);
// // // // // //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Anthropic integration pending"] };
// // // // // //   }

// // // // // //   // Google (placeholder)
// // // // // //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // // //     const originalCount = await this.countTokens(text);
// // // // // //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Google AI integration pending"] };
// // // // // //   }

// // // // // //   async getUserTokenUsage(): Promise<UserTokenUsage> {
// // // // // //     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
// // // // // //   }
// // // // // //   async incrementUserTokens(): Promise<void> {}
// // // // // //   async setUserTokenLimit(): Promise<void> {}
// // // // // // }

// // // // // // export const llmService = new LLMService();



// // // // // // src/services/llmService.ts
// // // // // export type LLMProvider = string;

// // // // // export interface LLMConfig {
// // // // //   provider: LLMProvider;
// // // // //   apiKey: string;
// // // // //   model?: string;
// // // // //   maxTokens?: number;
// // // // // }

// // // // // export interface OptimizeUsage {
// // // // //   prompt: number;
// // // // //   completion: number;
// // // // //   total: number;
// // // // // }

// // // // // export interface TokenizerResponse {
// // // // //   tokens: number;
// // // // //   words: number;
// // // // // }

// // // // // export interface OptimizeResponse {
// // // // //   optimizedText: string;
// // // // //   tokens: number;
// // // // //   words: number;
// // // // //   suggestions: string[];
// // // // //   usage?: OptimizeUsage;
// // // // // }

// // // // // export interface UserTokenUsage {
// // // // //   totalTokensUsed: number;
// // // // //   tokenLimit: number;
// // // // // }

// // // // // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// // // // //   openai: "gpt-4o-mini",
// // // // //   perplexity: "llama-3.1-sonar-small-128k-online",
// // // // //   anthropic: "claude-instant",
// // // // //   google: "gemini-pro",
// // // // //   other: "generic",
// // // // // };

// // // // // class LLMService {
// // // // //   private config: LLMConfig = {
// // // // //     provider: "openai",
// // // // //     apiKey: "",
// // // // //     model: "gpt-4o-mini",
// // // // //   };

// // // // //   constructor() {
// // // // //     this.loadConfig();
// // // // //   }

// // // // //   private loadConfig() {
// // // // //     const savedProvider = localStorage.getItem("llm_provider") || "openai";
// // // // //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// // // // //     const savedModel =
// // // // //       localStorage.getItem(`${savedProvider}_model`) ||
// // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
// // // // //     const defaultModelFromEnv =
// // // // //       import.meta.env.VITE_DEFAULT_MODEL ||
// // // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // // //     this.config = {
// // // // //       provider: savedProvider as LLMProvider,
// // // // //       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
// // // // //       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
// // // // //     };
// // // // //   }

// // // // //      private parseJsonObject(content: string): any {
// // // // //   if (!content) throw new Error("Empty content from model");

// // // // //   const trimmed = content.trim();

// // // // //   // 1. Try direct JSON parse first
// // // // //   try {
// // // // //     return JSON.parse(trimmed);
// // // // //   } catch {}

// // // // //   // 2. Extract JSON inside ```json ... ```
// // // // //   const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // // // //   if (fenceMatch) {
// // // // //     try {
// // // // //       return JSON.parse(fenceMatch[1].trim());
// // // // //     } catch {}
// // // // //   }

// // // // //   // 3. Extract between first { and last }
// // // // //   const first = trimmed.indexOf("{");
// // // // //   const last = trimmed.lastIndexOf("}");
// // // // //   if (first !== -1 && last !== -1 && last > first) {
// // // // //     const candidate = trimmed.slice(first, last + 1);
// // // // //     try {
// // // // //       return JSON.parse(candidate);
// // // // //     } catch {}
// // // // //   }

// // // // //   // 4. Attempt to sanitize common junk like "Here is your detailed prompt:"
// // // // //   const sanitized = trimmed
// // // // //     .replace(/^[^{]*{/, "{")   // cut everything before first {
// // // // //     .replace(/}[^}]*$/, "}");  // cut everything after last }
// // // // //   try {
// // // // //     return JSON.parse(sanitized);
// // // // //   } catch {}

// // // // //   // 5. Debug log and throw
// // // // //   console.error("[LLMService] Failed to parse JSON. Raw output:", content);
// // // // //   throw new Error("Invalid JSON received from model");
// // // // // }

// // // // //   setConfig(config: Partial<LLMConfig>) {
// // // // //     this.config = { ...this.config, ...config };
// // // // //     localStorage.setItem("llm_provider", this.config.provider);
// // // // //     if (this.config.apiKey) {
// // // // //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// // // // //     }
// // // // //     if (this.config.model) {
// // // // //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// // // // //     }
// // // // //   }

// // // // //   getConfig(): LLMConfig {
// // // // //     return { ...this.config };
// // // // //   }

// // // // //   async countTokens(text: string): Promise<TokenizerResponse> {
// // // // //     const words = text.split(/\s+/).filter(Boolean).length;
// // // // //     let tokenMultiplier = 1.3;

// // // // //     switch (this.config.provider) {
// // // // //       case "openai": tokenMultiplier = 1.3; break;
// // // // //       case "perplexity": tokenMultiplier = 1.35; break;
// // // // //       case "anthropic": tokenMultiplier = 1.25; break;
// // // // //       case "google": tokenMultiplier = 1.2; break;
// // // // //       default: tokenMultiplier = 1.3;
// // // // //     }

// // // // //     const tokens = Math.round(words * tokenMultiplier);
// // // // //     return { tokens, words };
// // // // //   }

// // // // //   /** Extract explicit word limit if user wrote “in 100 words”, “limit 200 words”, etc. */
// // // // //   private extractWordLimit(raw: string): number | null {
// // // // //     const text = (raw || "").toLowerCase();

// // // // //     // “in 100 words”, “within 150 words”, “limit 200 words”, “about 300 words”
// // // // //     const pat1 = /\b(?:in|within|limit|about|around|approximately|~|approx)\s+(\d{1,4})\s+words?\b/;
// // // // //     const m1 = text.match(pat1);
// // // // //     if (m1 && m1[1]) return Math.max(50, Math.min(1200, Number(m1[1])));

// // // // //     // bare “200 words”
// // // // //     const pat2 = /\b(\d{1,4})\s+words?\b/;
// // // // //     const m2 = text.match(pat2);
// // // // //     if (m2 && m2[1]) return Math.max(50, Math.min(1200, Number(m2[1])));

// // // // //     return null;
// // // // //   }

// // // // //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// // // // //     if (!this.config.apiKey) throw new Error("API key not set");

// // // // //     const originalCount = await this.countTokens(text);
// // // // //     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// // // // //     switch (this.config.provider) {
// // // // //       case "openai":
// // // // //         return this.optimizeWithOpenAI(text, target);
// // // // //       case "perplexity":
// // // // //         return this.optimizeWithPerplexity(text, target);
// // // // //       case "anthropic":
// // // // //         return this.optimizeWithAnthropic(text, target);
// // // // //       case "google":
// // // // //         return this.optimizeWithGoogle(text, target);
// // // // //       default:
// // // // //         return this.optimizeWithOpenAI(text, target);
// // // // //     }
// // // // //   }

// // // // //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // //     const model = (this.config.model || "gpt-4o-mini").trim();
// // // // //     if (!apiKey) throw new Error("OpenAI API key not set");

// // // // //     const body = {
// // // // //       model,
// // // // //       temperature: 0.3,
// // // // //       max_tokens: 700,
// // // // //       messages: [
// // // // //         {
// // // // //           role: "system",
// // // // //           content: `You are an expert prompt optimizer. 
// // // // // Return STRICT JSON:
// // // // // {"optimizedText": "string","suggestions": ["string","string","string"]}

// // // // // Rules:
// // // // // - Short, imperative, preserve meaning.
// // // // // - Concise (aim ≈ ${targetTokens} tokens).
// // // // // - No tips; "suggestions" must be 3 distinct optimized alternatives.`,
// // // // //         },
// // // // //         { role: "user", content: text },
// // // // //       ],
// // // // //       response_format: { type: "json_object" },
// // // // //     };

// // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // //       method: "POST",
// // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
// // // // //       body: JSON.stringify(body),
// // // // //     });

// // // // //     const data = await res.json();
// // // // //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // //     const parsed = this.parseJsonObject(raw);

// // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // //     const usageRaw = (data?.usage ?? {}) as {
// // // // //       prompt_tokens?: number;
// // // // //       completion_tokens?: number;
// // // // //       total_tokens?: number;
// // // // //     };

// // // // //     const usageObj: OptimizeUsage = {
// // // // //       prompt: Number(usageRaw.prompt_tokens ?? 0),
// // // // //       completion: Number(usageRaw.completion_tokens ?? 0),
// // // // //       total: Number(usageRaw.total_tokens ?? 0),
// // // // //     };

// // // // //     return {
// // // // //       optimizedText,
// // // // //       tokens: optimizedCount.tokens,
// // // // //       words: optimizedCount.words,
// // // // //       suggestions,
// // // // //       usage: usageObj,
// // // // //     };
// // // // //   }

// // // // // //   /** SMARTGEN — Faster detailed prompt with meta/preface/disclaimers + tight max_tokens + timeout */
// // // // // //   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// // // // // //     if (!this.config.apiKey) throw new Error("API key not set");

// // // // // //     // 1) Word-length control
// // // // // //     const explicitLimit = this.extractWordLimit(text);
// // // // // //     const defaultWords = 425; // ~400–450 by default
// // // // // //     const targetWords = explicitLimit ?? defaultWords;

// // // // // //     // ~ 1 word ≈ 1.3 tokens; add ~15% headroom for structure
// // // // // //     const budgetTokens = Math.min(1000, Math.max(200, Math.round(targetWords * 1.3 * 1.15)));

// // // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // // //     const model = (this.config.model || "gpt-4o-mini").trim();

// // // // // //     const system = `You write a detailed prompt/guide.
// // // // // // Return STRICT JSON:
// // // // // // {"optimizedText":"string","suggestions":["string","string","string"]}

// // // // // // Style:
// // // // // // - Begin with a brief meta/preface (e.g., "Here is your detailed prompt:").
// // // // // // - Disclaimers are allowed if relevant (e.g., "As an AI model...").
// // // // // // - Specific, actionable; bullets allowed; audience-aware; minimal boilerplate unless asked.

// // // // // // Length:
// // // // // // - If user gave a word limit, keep very close (±5%).
// // // // // // - Else ~400–450 words (about ${defaultWords}).`;

// // // // // //     const body = {
// // // // // //       model,
// // // // // //       temperature: 0.2,
// // // // // //       max_tokens: budgetTokens, // tighter cap => faster
// // // // // //       messages: [
// // // // // //         { role: "system", content: system },
// // // // // //         {
// // // // // //           role: "user",
// // // // // //           content:
// // // // // //             `User topic/request:\n${text}\n\n` +
// // // // // //             `Target length: ${targetWords} words. Respect explicit word limits if present.`,
// // // // // //         },
// // // // // //       ],
// // // // // //       response_format: { type: "json_object" },
// // // // // //     };

// // // // // //     // 2) Timeout guard (20s)
// // // // // //     const controller = new AbortController();
// // // // // //     const timeout = setTimeout(() => controller.abort(), 20_000);

// // // // // //     try {
// // // // // //       const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // //         method: "POST",
// // // // // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
// // // // // //         body: JSON.stringify(body),
// // // // // //         signal: controller.signal,
// // // // // //       });

// // // // // //       const data = await res.json().catch(() => ({}));
// // // // // //       if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// // // // // //       const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // // //       const parsed = this.parseJsonObject(raw);

// // // // // //       const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // // //       const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // // //       if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // // //       const optimizedCount = await this.countTokens(optimizedText);

// // // // // //       return {
// // // // // //         optimizedText,
// // // // // //         tokens: optimizedCount.tokens,
// // // // // //         words: optimizedCount.words,
// // // // // //         suggestions,
// // // // // //       };
// // // // // //     } finally {
// // // // // //       clearTimeout(timeout);
// // // // // //     }
// // // // // //   }



// // // // // // in llmService.ts
// // // // // async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// // // // //   if (!this.config.apiKey) throw new Error("API key not set");

// // // // //   const explicitLimit = this.extractWordLimit(text);
// // // // //   const defaultWords = 425;
// // // // //   const targetWords = explicitLimit ?? defaultWords;
// // // // //   const budgetTokens = Math.min(1000, Math.max(200, Math.round(targetWords * 1.3 * 1.15)));

// // // // //   const apiKey = (this.config.apiKey || "").trim();
// // // // //   const model = (this.config.model || "gpt-4o-mini").trim();

// // // // //   const system = `You write a detailed prompt/guide.
// // // // // Return STRICT JSON:
// // // // // {"optimizedText":"string","suggestions":["string","string","string"]}

// // // // // Style:
// // // // // - Begin with a brief meta/preface (e.g., "Here is your detailed prompt:").
// // // // // - Disclaimers allowed if relevant.
// // // // // - Specific, actionable; bullets allowed; minimal boilerplate.

// // // // // Length:
// // // // // - If user gave a word limit, keep very close (±5%).
// // // // // - Else ~400–450 words (~${defaultWords}).`;

// // // // //   const body = {
// // // // //     model,
// // // // //     temperature: 0.2,
// // // // //     max_tokens: budgetTokens,
// // // // //     messages: [
// // // // //       { role: "system", content: system },
// // // // //       { role: "user", content: `User topic/request:\n${text}\n\nTarget length: ${targetWords} words.` },
// // // // //     ],
// // // // //     response_format: { type: "json_object" },
// // // // //   };

// // // // //   // 45s timeout + friendly Abort handling
// // // // //   const controller = new AbortController();
// // // // //   const timeout = setTimeout(() => controller.abort(), 45_000);

// // // // //   try {
// // // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // //       method: "POST",
// // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
// // // // //       body: JSON.stringify(body),
// // // // //       signal: controller.signal,
// // // // //     });

// // // // //     const txt = await res.text();
// // // // //     let data: any = {};
// // // // //     try { data = JSON.parse(txt); } catch {}

// // // // //     if (!res.ok) {
// // // // //       const msg = data?.error?.message || `OpenAI error (${res.status})`;
// // // // //       throw new Error(msg);
// // // // //     }

// // // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // //     const parsed = this.parseJsonObject(raw); // will throw if invalid JSON

// // // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // // //     return {
// // // // //       optimizedText,
// // // // //       tokens: optimizedCount.tokens,
// // // // //       words: optimizedCount.words,
// // // // //       suggestions,
// // // // //     };
// // // // //   } catch (e: any) {
// // // // //     // Normalize AbortError so UI can show “The AI request timed out”
// // // // //     if (e?.name === "AbortError") {
// // // // //       const err = new Error("llm_timeout");
// // // // //       (err as any).code = "llm_timeout";
// // // // //       throw err;
// // // // //     }
// // // // //     throw e;
// // // // //   } finally {
// // // // //     clearTimeout(timeout);
// // // // //   }
// // // // // }

// // // // //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // //     const response = await fetch("https://api.perplexity.ai/chat/completions", {
// // // // //       method: "POST",
// // // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
// // // // //       body: JSON.stringify({
// // // // //         model: this.config.model || "llama-3.1-sonar-small-128k-online",
// // // // //         messages: [
// // // // //           { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
// // // // //           { role: "user", content: text },
// // // // //         ],
// // // // //         temperature: 0.2,
// // // // //         max_tokens: 700,
// // // // //         response_format: { type: "json_object" },
// // // // //       }),
// // // // //     });

// // // // //     const data = await response.json();
// // // // //     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

// // // // //     let result;
// // // // //     try {
// // // // //       result = JSON.parse(data.choices[0].message.content);
// // // // //     } catch {
// // // // //       throw new Error("Invalid response format from Perplexity");
// // // // //     }

// // // // //     const optimizedCount = await this.countTokens(result.optimizedText);
// // // // //     return {
// // // // //       optimizedText: result.optimizedText,
// // // // //       tokens: optimizedCount.tokens,
// // // // //       words: optimizedCount.words,
// // // // //       suggestions: result.suggestions || [],
// // // // //     };
// // // // //   }

// // // // //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // //     const originalCount = await this.countTokens(text);
// // // // //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Anthropic integration pending"] };
// // // // //   }

// // // // //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // // //     const originalCount = await this.countTokens(text);
// // // // //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Google AI integration pending"] };
// // // // //   }

// // // // //   async getUserTokenUsage(): Promise<UserTokenUsage> {
// // // // //     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
// // // // //   }
// // // // //   async incrementUserTokens(): Promise<void> {}
// // // // //   async setUserTokenLimit(): Promise<void> {}
// // // // // }

// // // // // export const llmService = new LLMService();





// // // // // src/services/llmService.ts
// // // // export type LLMProvider = string;

// // // // export interface LLMConfig {
// // // //   provider: LLMProvider;
// // // //   apiKey: string;
// // // //   model?: string;
// // // //   maxTokens?: number;
// // // // }

// // // // export interface OptimizeUsage {
// // // //   prompt: number;
// // // //   completion: number;
// // // //   total: number;
// // // // }

// // // // export interface TokenizerResponse {
// // // //   tokens: number;
// // // //   words: number;
// // // // }

// // // // export interface OptimizeResponse {
// // // //   optimizedText: string;
// // // //   tokens: number;
// // // //   words: number;
// // // //   suggestions: string[];
// // // //   usage?: OptimizeUsage;
// // // // }

// // // // export interface UserTokenUsage {
// // // //   totalTokensUsed: number;
// // // //   tokenLimit: number;
// // // // }

// // // // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// // // //   openai: "gpt-4o-mini",
// // // //   perplexity: "llama-3.1-sonar-small-128k-online",
// // // //   anthropic: "claude-instant",
// // // //   google: "gemini-pro",
// // // //   other: "generic",
// // // // };

// // // // class LLMService {
// // // //   private config: LLMConfig = {
// // // //     provider: "openai",
// // // //     apiKey: "",
// // // //     model: "gpt-4o-mini",
// // // //   };

// // // //   constructor() {
// // // //     this.loadConfig();
// // // //   }

// // // //   private loadConfig() {
// // // //     const savedProvider = localStorage.getItem("llm_provider") || "openai";
// // // //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// // // //     const savedModel =
// // // //       localStorage.getItem(`${savedProvider}_model`) ||
// // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
// // // //     const defaultModelFromEnv =
// // // //       import.meta.env.VITE_DEFAULT_MODEL ||
// // // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // // //     this.config = {
// // // //       provider: savedProvider as LLMProvider,
// // // //       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
// // // //       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
// // // //     };
// // // //   }

// // // //   private parseJsonObject(content: string): any {
// // // //     const trimmed = content?.trim?.() || "";
// // // //     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // // //     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// // // //     try { return JSON.parse(candidate); } catch {}

// // // //     const first = candidate.indexOf("{");
// // // //     const last = candidate.lastIndexOf("}");
// // // //     if (first !== -1 && last !== -1 && last > first) {
// // // //       try { return JSON.parse(candidate.slice(first, last + 1)); } catch {}
// // // //     }
// // // //     throw new Error("Invalid JSON received from model");
// // // //   }

// // // //   setConfig(config: Partial<LLMConfig>) {
// // // //     this.config = { ...this.config, ...config };
// // // //     localStorage.setItem("llm_provider", this.config.provider);
// // // //     if (this.config.apiKey) {
// // // //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// // // //     }
// // // //     if (this.config.model) {
// // // //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// // // //     }
// // // //   }

// // // //   getConfig(): LLMConfig {
// // // //     return { ...this.config };
// // // //   }

// // // //   async countTokens(text: string): Promise<TokenizerResponse> {
// // // //     const words = text.split(/\s+/).filter(Boolean).length;
// // // //     let tokenMultiplier = 1.3;

// // // //     switch (this.config.provider) {
// // // //       case "openai": tokenMultiplier = 1.3; break;
// // // //       case "perplexity": tokenMultiplier = 1.35; break;
// // // //       case "anthropic": tokenMultiplier = 1.25; break;
// // // //       case "google": tokenMultiplier = 1.2; break;
// // // //       default: tokenMultiplier = 1.3;
// // // //     }

// // // //     const tokens = Math.round(words * tokenMultiplier);
// // // //     return { tokens, words };
// // // //   }

// // // //   /** Extract explicit word limit if user wrote “in 100 words”, “limit 200 words”, etc. */
// // // //   private extractWordLimit(raw: string): number | null {
// // // //     const text = (raw || "").toLowerCase();

// // // //     // “in 100 words”, “within 150 words”, “limit 200 words”, “about 300 words”
// // // //     const pat1 = /\b(?:in|within|limit|about|around|approximately|~|approx)\s+(\d{1,4})\s+words?\b/;
// // // //     const m1 = text.match(pat1);
// // // //     if (m1 && m1[1]) return Math.max(50, Math.min(1200, Number(m1[1])));

// // // //     // bare “200 words”
// // // //     const pat2 = /\b(\d{1,4})\s+words?\b/;
// // // //     const m2 = text.match(pat2);
// // // //     if (m2 && m2[1]) return Math.max(50, Math.min(1200, Number(m2[1])));

// // // //     return null;
// // // //   }

// // // //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// // // //     if (!this.config.apiKey) throw new Error("API key not set");

// // // //     const originalCount = await this.countTokens(text);
// // // //     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// // // //     switch (this.config.provider) {
// // // //       case "openai":
// // // //         return this.optimizeWithOpenAI(text, target);
// // // //       case "perplexity":
// // // //         return this.optimizeWithPerplexity(text, target);
// // // //       case "anthropic":
// // // //         return this.optimizeWithAnthropic(text, target);
// // // //       case "google":
// // // //         return this.optimizeWithGoogle(text, target);
// // // //       default:
// // // //         return this.optimizeWithOpenAI(text, target);
// // // //     }
// // // //   }

// // // //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // //     const apiKey = (this.config.apiKey || "").trim();
// // // //     const model = (this.config.model || "gpt-4o-mini").trim();
// // // //     if (!apiKey) throw new Error("OpenAI API key not set");

// // // //     const body = {
// // // //       model,
// // // //       temperature: 0.3,
// // // //       max_tokens: 700,
// // // //       messages: [
// // // //         {
// // // //           role: "system",
// // // //           content: `You are an expert prompt optimizer. 
// // // // Return STRICT JSON:
// // // // {"optimizedText": "string","suggestions": ["string","string","string"]}

// // // // Rules:
// // // // - Short, imperative, preserve meaning.
// // // // - Concise (aim ≈ ${targetTokens} tokens).
// // // // - No tips; "suggestions" must be 3 distinct optimized alternatives.`,
// // // //         },
// // // //         { role: "user", content: text },
// // // //       ],
// // // //       response_format: { type: "json_object" },
// // // //     };

// // // //     // const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // //     //   method: "POST",
// // // //     //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
// // // //     //   body: JSON.stringify(body),
// // // //     // });
// // // //    const res = await fetch("http://localhost:5000/api/optimize", {
// // // //   method: "POST",
// // // //   headers: { "Content-Type": "application/json" },
// // // //   body: JSON.stringify({ text }),
// // // // });

// // // //     const data = await res.json();
// // // //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // //     const parsed = this.parseJsonObject(raw);

// // // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // //     const usageRaw = (data?.usage ?? {}) as {
// // // //       prompt_tokens?: number;
// // // //       completion_tokens?: number;
// // // //       total_tokens?: number;
// // // //     };

// // // //     const usageObj: OptimizeUsage = {
// // // //       prompt: Number(usageRaw.prompt_tokens ?? 0),
// // // //       completion: Number(usageRaw.completion_tokens ?? 0),
// // // //       total: Number(usageRaw.total_tokens ?? 0),
// // // //     };

// // // //     return {
// // // //       optimizedText,
// // // //       tokens: optimizedCount.tokens,
// // // //       words: optimizedCount.words,
// // // //       suggestions,
// // // //       usage: usageObj,
// // // //     };
// // // //   }

// // // // //   /** SMARTGEN — Faster detailed prompt with meta/preface/disclaimers + tight max_tokens + timeout */
// // // // //   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// // // // //     if (!this.config.apiKey) throw new Error("API key not set");

// // // // //     // 1) Word-length control
// // // // //     const explicitLimit = this.extractWordLimit(text);
// // // // //     const defaultWords = 425; // ~400–450 by default
// // // // //     const targetWords = explicitLimit ?? defaultWords;

// // // // //     // ~ 1 word ≈ 1.3 tokens; add ~15% headroom for structure
// // // // //     const budgetTokens = Math.min(1000, Math.max(200, Math.round(targetWords * 1.3 * 1.15)));

// // // // //     const apiKey = (this.config.apiKey || "").trim();
// // // // //     const model = (this.config.model || "gpt-4o-mini").trim();

// // // // //     const system = `You write a detailed prompt/guide.
// // // // // Return STRICT JSON:
// // // // // {"optimizedText":"string","suggestions":["string","string","string"]}

// // // // // Style:
// // // // // - Begin with a brief meta/preface (e.g., "Here is your detailed prompt:").
// // // // // - Disclaimers are allowed if relevant (e.g., "As an AI model...").
// // // // // - Specific, actionable; bullets allowed; audience-aware; minimal boilerplate unless asked.

// // // // // Length:
// // // // // - If user gave a word limit, keep very close (±5%).
// // // // // - Else ~400–450 words (about ${defaultWords}).`;

// // // // //     const body = {
// // // // //       model,
// // // // //       temperature: 0.2,
// // // // //       max_tokens: budgetTokens, // tighter cap => faster
// // // // //       messages: [
// // // // //         { role: "system", content: system },
// // // // //         {
// // // // //           role: "user",
// // // // //           content:
// // // // //             `User topic/request:\n${text}\n\n` +
// // // // //             `Target length: ${targetWords} words. Respect explicit word limits if present.`,
// // // // //         },
// // // // //       ],
// // // // //       response_format: { type: "json_object" },
// // // // //     };

// // // // //     // 2) Timeout guard (20s)
// // // // //     const controller = new AbortController();
// // // // //     const timeout = setTimeout(() => controller.abort(), 20_000);

// // // // //     try {
// // // // //       const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // //         method: "POST",
// // // // //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
// // // // //         body: JSON.stringify(body),
// // // // //         signal: controller.signal,
// // // // //       });

// // // // //       const data = await res.json().catch(() => ({}));
// // // // //       if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// // // // //       const raw = data?.choices?.[0]?.message?.content ?? "";
// // // // //       const parsed = this.parseJsonObject(raw);

// // // // //       const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // // //       const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // // // //       if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // // //       const optimizedCount = await this.countTokens(optimizedText);

// // // // //       return {
// // // // //         optimizedText,
// // // // //         tokens: optimizedCount.tokens,
// // // // //         words: optimizedCount.words,
// // // // //         suggestions,
// // // // //       };
// // // // //     } finally {
// // // // //       clearTimeout(timeout);
// // // // //     }
// // // // //   }



// // // // // in llmService.ts
// // // // async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// // // //   if (!this.config.apiKey) throw new Error("API key not set");

// // // //   const explicitLimit = this.extractWordLimit(text);
// // // //   const defaultWords = explicitLimit ? 425 : 200; // Reduced default to 200 for faster response
// // // //   const targetWords = explicitLimit ?? defaultWords;
// // // //   const budgetTokens = explicitLimit ? Math.min(1000, Math.max(200, Math.round(targetWords * 1.3 * 1.15))) : 400; // Lower cap for default case

// // // //   const apiKey = (this.config.apiKey || "").trim();
// // // //   const model = (this.config.model || "gpt-4o-mini").trim();

// // // //   const system = `You write a detailed prompt/guide.
// // // //   Return STRICT JSON:
// // // //   {"optimizedText":"string","suggestions":["string","string","string"]}

// // // //   Style:
// // // //   - Begin with a brief meta/preface (e.g., "Here is your detailed prompt:").
// // // //   - Disclaimers allowed if relevant.
// // // //   - Specific, actionable; bullets allowed; minimal boilerplate.

// // // //   Length:
// // // //   - If user gave a word limit (e.g., 'in 300 words'), generate content aiming for that exact length (±5%).
// // // //   - If no word limit is specified, aim for ~150–200 words for a concise yet useful prompt.
// // // //   - If unable to meet the target length, pad with neutral filler (e.g., 'Additional details can be expanded here.') instead of abrupt placeholders.`;

// // // //   const body = {
// // // //     model,
// // // //     temperature: 0.2,
// // // //     max_tokens: budgetTokens,
// // // //     messages: [
// // // //       { role: "system", content: system },
// // // //       { role: "user", content: `User topic/request:\n${text}\n\nTarget length: ${targetWords} words.` },
// // // //     ],
// // // //     response_format: { type: "json_object" },
// // // //   };

// // // //   console.time('generatePrompt'); // Start timing the API call
// // // //   const controller = new AbortController();
// // // //   const timeout = setTimeout(() => controller.abort(), 45_000);

// // // //   try {
// // // //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
// // // //       method: "POST",
// // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
// // // //       body: JSON.stringify(body),
// // // //       signal: controller.signal,
// // // //     });

// // // //     const txt = await res.text();
// // // //     let data: any = {};
// // // //     try {
// // // //       data = JSON.parse(txt);
// // // //     } catch (jsonError) {
// // // //       console.warn("Invalid JSON response, attempting to extract:", txt);
// // // //       const jsonMatch = txt.match(/```json\s*([\s\S]*?)\s*```/i);
// // // //       data = jsonMatch && jsonMatch[1] ? JSON.parse(jsonMatch[1]) : { choices: [{ message: { content: txt } }] };
// // // //     }

// // // //     if (!res.ok) {
// // // //       const msg = data?.error?.message || `OpenAI error (${res.status})`;
// // // //       throw new Error(msg);
// // // //     }

// // // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // // //     let parsed: any = {};
// // // //     try {
// // // //       parsed = this.parseJsonObject(raw);
// // // //       if (!parsed.optimizedText || !Array.isArray(parsed.suggestions)) {
// // // //         throw new Error("Invalid parsed structure");
// // // //       }
// // // //     } catch (parseError) {
// // // //       console.warn("Failed to parse raw response, using raw as fallback:", raw);
// // // //       const rawJsonMatch = raw.match(/\{\s*"optimizedText"\s*:\s*"[^"]*"\s*,\s*"suggestions"\s*:\s*\[[^\]]*\]\s*\}/);
// // // //       parsed = rawJsonMatch ? JSON.parse(rawJsonMatch[0]) : { optimizedText: raw.replace(/```json|```/g, "").trim(), suggestions: [] };
// // // //     }

// // // //     let optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // // //     const suggestions: string[] = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

// // // //     // Simplified word count enforcement
// // // //     if (explicitLimit) {
// // // //       const words = optimizedText.split(/\s+/).filter(w => w.length > 0).length;
// // // //       const tolerance = Math.floor(explicitLimit * 0.05);
// // // //       if (words < explicitLimit - tolerance) {
// // // //         optimizedText += " Additional details can be expanded here.";
// // // //       }
// // // //     }

// // // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // // //     const optimizedCount = await this.countTokens(optimizedText);

// // // //     return {
// // // //       optimizedText,
// // // //       tokens: optimizedCount.tokens,
// // // //       words: optimizedCount.words,
// // // //       suggestions,
// // // //     };
// // // //   } catch (e: any) {
// // // //     if (e?.name === "AbortError") {
// // // //       const err = new Error("llm_timeout");
// // // //       (err as any).code = "llm_timeout";
// // // //       throw err;
// // // //     }
// // // //     const fallbackText = `Here is a default detailed prompt: Please provide more details for "${text}". Additional details can be expanded here.`;
// // // //     const fallbackCount = await this.countTokens(fallbackText);
// // // //     return {
// // // //       optimizedText: fallbackText,
// // // //       tokens: fallbackCount.tokens,
// // // //       words: fallbackCount.words,
// // // //       suggestions: ["Provide more context", "Specify details", "Retry with a clear request"],
// // // //     };
// // // //   } finally {
// // // //     console.timeEnd('generatePrompt'); // End timing the API call
// // // //     clearTimeout(timeout);
// // // //   }
// // // // }

// // // //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // //     const response = await fetch("https://api.perplexity.ai/chat/completions", {
// // // //       method: "POST",
// // // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
// // // //       body: JSON.stringify({
// // // //         model: this.config.model || "llama-3.1-sonar-small-128k-online",
// // // //         messages: [
// // // //           { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
// // // //           { role: "user", content: text },
// // // //         ],
// // // //         temperature: 0.2,
// // // //         max_tokens: 700,
// // // //         response_format: { type: "json_object" },
// // // //       }),
// // // //     });

// // // //     const data = await response.json();
// // // //     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

// // // //     let result;
// // // //     try {
// // // //       result = JSON.parse(data.choices[0].message.content);
// // // //     } catch {
// // // //       throw new Error("Invalid response format from Perplexity");
// // // //     }

// // // //     const optimizedCount = await this.countTokens(result.optimizedText);
// // // //     return {
// // // //       optimizedText: result.optimizedText,
// // // //       tokens: optimizedCount.tokens,
// // // //       words: optimizedCount.words,
// // // //       suggestions: result.suggestions || [],
// // // //     };
// // // //   }

// // // //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // //     const originalCount = await this.countTokens(text);
// // // //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Anthropic integration pending"] };
// // // //   }

// // // //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // // //     const originalCount = await this.countTokens(text);
// // // //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Google AI integration pending"] };
// // // //   }

// // // //   async getUserTokenUsage(): Promise<UserTokenUsage> {
// // // //     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
// // // //   }
// // // //   async incrementUserTokens(): Promise<void> {}
// // // //   async setUserTokenLimit(): Promise<void> {}
// // // // }

// // // // export const llmService = new LLMService();


// // // // src/services/llmService.ts
// // // export type LLMProvider = string;

// // // export interface LLMConfig {
// // //   provider: LLMProvider;
// // //   apiKey: string;
// // //   model?: string;
// // //   maxTokens?: number;
// // // }

// // // export interface OptimizeUsage {
// // //   prompt: number;
// // //   completion: number;
// // //   total: number;
// // // }

// // // export interface TokenizerResponse {
// // //   tokens: number;
// // //   words: number;
// // // }

// // // export interface OptimizeResponse {
// // //   optimizedText: string;
// // //   tokens: number;
// // //   words: number;
// // //   suggestions: string[];
// // //   usage?: OptimizeUsage;
// // // }

// // // export interface UserTokenUsage {
// // //   totalTokensUsed: number;
// // //   tokenLimit: number;
// // // }

// // // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// // //   openai: "gpt-4o-mini",
// // //   perplexity: "llama-3.1-sonar-small-128k-online",
// // //   anthropic: "claude-instant",
// // //   google: "gemini-pro",
// // //   other: "generic",
// // // };

// // // class LLMService {
// // //   private config: LLMConfig = {
// // //     provider: "openai",
// // //     apiKey: "",
// // //     model: "gpt-4o-mini",
// // //   };

// // //   constructor() {
// // //     this.loadConfig();
// // //   }

// // //   private loadConfig() {
// // //     const savedProvider = localStorage.getItem("llm_provider") || "openai";
// // //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// // //     const savedModel =
// // //       localStorage.getItem(`${savedProvider}_model`) ||
// // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
// // //     const defaultModelFromEnv =
// // //       import.meta.env.VITE_DEFAULT_MODEL ||
// // //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// // //     this.config = {
// // //       provider: savedProvider as LLMProvider,
// // //       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
// // //       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
// // //     };
// // //   }

// // //   private parseJsonObject(content: string): any {
// // //     const trimmed = content?.trim?.() || "";
// // //     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// // //     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// // //     try {
// // //       return JSON.parse(candidate);
// // //     } catch {}

// // //     const first = candidate.indexOf("{");
// // //     const last = candidate.lastIndexOf("}");
// // //     if (first !== -1 && last !== -1 && last > first) {
// // //       try {
// // //         return JSON.parse(candidate.slice(first, last + 1));
// // //       } catch {}
// // //     }
// // //     throw new Error("Invalid JSON received from model");
// // //   }

// // //   setConfig(config: Partial<LLMConfig>) {
// // //     this.config = { ...this.config, ...config };
// // //     localStorage.setItem("llm_provider", this.config.provider);
// // //     if (this.config.apiKey) {
// // //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// // //     }
// // //     if (this.config.model) {
// // //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// // //     }
// // //   }

// // //   getConfig(): LLMConfig {
// // //     return { ...this.config };
// // //   }

// // //   async countTokens(text: string): Promise<TokenizerResponse> {
// // //     const words = text.split(/\s+/).filter(Boolean).length;
// // //     let tokenMultiplier = 1.3;

// // //     switch (this.config.provider) {
// // //       case "openai":
// // //         tokenMultiplier = 1.3;
// // //         break;
// // //       case "perplexity":
// // //         tokenMultiplier = 1.35;
// // //         break;
// // //       case "anthropic":
// // //         tokenMultiplier = 1.25;
// // //         break;
// // //       case "google":
// // //         tokenMultiplier = 1.2;
// // //         break;
// // //       default:
// // //         tokenMultiplier = 1.3;
// // //     }

// // //     const tokens = Math.round(words * tokenMultiplier);
// // //     return { tokens, words };
// // //   }

// // //   private extractWordLimit(raw: string): number | null {
// // //     const text = (raw || "").toLowerCase();

// // //     const pat1 = /\b(?:in|within|limit|about|around|approximately|~|approx)\s+(\d{1,4})\s+words?\b/;
// // //     const m1 = text.match(pat1);
// // //     if (m1 && m1[1]) return Math.max(50, Math.min(1200, Number(m1[1])));

// // //     const pat2 = /\b(\d{1,4})\s+words?\b/;
// // //     const m2 = text.match(pat2);
// // //     if (m2 && m2[1]) return Math.max(50, Math.min(1200, Number(m2[1])));

// // //     return null;
// // //   }

// // //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// // //     if (!this.config.apiKey) throw new Error("API key not set");

// // //     const originalCount = await this.countTokens(text);
// // //     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// // //     switch (this.config.provider) {
// // //       case "openai":
// // //         return this.optimizeWithOpenAI(text, target);
// // //       case "perplexity":
// // //         return this.optimizeWithPerplexity(text, target);
// // //       case "anthropic":
// // //         return this.optimizeWithAnthropic(text, target);
// // //       case "google":
// // //         return this.optimizeWithGoogle(text, target);
// // //       default:
// // //         return this.optimizeWithOpenAI(text, target);
// // //     }
// // //   }

// // //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // //     const model = (this.config.model || "gpt-4o-mini").trim();

// // //     // ✅ Always go through backend proxy
// // //     const res = await fetch("http://localhost:5000/api/optimize", {
// // //       method: "POST",
// // //       headers: { "Content-Type": "application/json" },
// // //       body: JSON.stringify({ text, model, temperature: 0.3 }),
// // //     });

// // //     const data = await res.json();
// // //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // //     if (!raw || raw.trim() === "") throw new Error("Model returned empty content");

// // //     const parsed = this.parseJsonObject(raw);

// // //     const optimizedText: string = (parsed?.optimizedText ?? "").toString();
// // //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
// // //     if (!optimizedText) throw new Error("Model returned empty optimizedText");

// // //     const optimizedCount = await this.countTokens(optimizedText);

// // //     const usageRaw = (data?.usage ?? {}) as {
// // //       prompt_tokens?: number;
// // //       completion_tokens?: number;
// // //       total_tokens?: number;
// // //     };

// // //     const usageObj: OptimizeUsage = {
// // //       prompt: Number(usageRaw.prompt_tokens ?? 0),
// // //       completion: Number(usageRaw.completion_tokens ?? 0),
// // //       total: Number(usageRaw.total_tokens ?? 0),
// // //     };

// // //     return {
// // //       optimizedText,
// // //       tokens: optimizedCount.tokens,
// // //       words: optimizedCount.words,
// // //       suggestions,
// // //       usage: usageObj,
// // //     };
// // //   }

// // //   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// // //     if (!this.config.apiKey) throw new Error("API key not set");

// // //     const model = (this.config.model || "gpt-4o-mini").trim();
// // //     const explicitLimit = this.extractWordLimit(text);
// // //     const defaultWords = explicitLimit ? 425 : 200;

// // //     // ✅ Use backend proxy instead of direct OpenAI API to avoid CORS
// // //     const res = await fetch("http://localhost:5000/api/optimize", {
// // //       method: "POST",
// // //       headers: { "Content-Type": "application/json" },
// // //       body: JSON.stringify({ text, model, temperature: 0.2 }),
// // //     });

// // //     const data = await res.json();
// // //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// // //     const raw = data?.choices?.[0]?.message?.content ?? "";
// // //     if (!raw || raw.trim() === "") throw new Error("Model returned empty content");

// // //     const parsed = this.parseJsonObject(raw);
// // //     if (!parsed.optimizedText) throw new Error("Model returned empty optimizedText");

// // //     const optimizedCount = await this.countTokens(parsed.optimizedText);
// // //     return {
// // //       optimizedText: parsed.optimizedText,
// // //       tokens: optimizedCount.tokens,
// // //       words: optimizedCount.words,
// // //       suggestions: parsed.suggestions || [],
// // //     };
// // //   }

// // //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // //     const response = await fetch("https://api.perplexity.ai/chat/completions", {
// // //       method: "POST",
// // //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
// // //       body: JSON.stringify({
// // //         model: this.config.model || "llama-3.1-sonar-small-128k-online",
// // //         messages: [
// // //           { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
// // //           { role: "user", content: text },
// // //         ],
// // //         temperature: 0.2,
// // //         max_tokens: 700,
// // //         response_format: { type: "json_object" },
// // //       }),
// // //     });

// // //     const data = await response.json();
// // //     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

// // //     let result;
// // //     try {
// // //       result = JSON.parse(data.choices[0].message.content);
// // //     } catch {
// // //       throw new Error("Invalid response format from Perplexity");
// // //     }

// // //     const optimizedCount = await this.countTokens(result.optimizedText);
// // //     return {
// // //       optimizedText: result.optimizedText,
// // //       tokens: optimizedCount.tokens,
// // //       words: optimizedCount.words,
// // //       suggestions: result.suggestions || [],
// // //     };
// // //   }

// // //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // //     const originalCount = await this.countTokens(text);
// // //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Anthropic integration pending"] };
// // //   }

// // //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// // //     const originalCount = await this.countTokens(text);
// // //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Google AI integration pending"] };
// // //   }

// // //   async getUserTokenUsage(): Promise<UserTokenUsage> {
// // //     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
// // //   }
// // //   async incrementUserTokens(): Promise<void> {}
// // //   async setUserTokenLimit(): Promise<void> {}
// // // }

// // // export const llmService = new LLMService();




// // export type LLMProvider = string;

// // export interface LLMConfig {
// //   provider: LLMProvider;
// //   apiKey: string;
// //   model?: string;
// //   maxTokens?: number;
// // }

// // export interface OptimizeUsage {
// //   prompt: number;
// //   completion: number;
// //   total: number;
// // }

// // export interface TokenizerResponse {
// //   tokens: number;
// //   words: number;
// // }

// // export interface OptimizeResponse {
// //   optimizedText: string;
// //   tokens: number;
// //   words: number;
// //   suggestions: string[];
// //   usage?: OptimizeUsage;
// // }

// // export interface UserTokenUsage {
// //   totalTokensUsed: number;
// //   tokenLimit: number;
// // }

// // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// //   openai: "gpt-4o-mini",
// //   perplexity: "llama-3.1-sonar-small-128k-online",
// //   anthropic: "claude-instant",
// //   google: "gemini-pro",
// //   other: "generic",
// // };

// // class LLMService {
// //   private config: LLMConfig = {
// //     provider: "openai",
// //     apiKey: "",
// //     model: "gpt-4o-mini",
// //   };

// //   constructor() {
// //     this.loadConfig();
// //   }

// //   private loadConfig() {
// //     const savedProvider = localStorage.getItem("llm_provider") || "openai";
// //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// //     const savedModel =
// //       localStorage.getItem(`${savedProvider}_model`) ||
// //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
// //     const defaultModelFromEnv =
// //       import.meta.env.VITE_DEFAULT_MODEL ||
// //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// //     this.config = {
// //       provider: savedProvider as LLMProvider,
// //       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
// //       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
// //     };
// //   }

// //   private parseJsonObject(content: string): any {
// //     const trimmed = content?.trim?.() || "";
// //     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// //     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// //     try {
// //       return JSON.parse(candidate);
// //     } catch {}

// //     const first = candidate.indexOf("{");
// //     const last = candidate.lastIndexOf("}");
// //     if (first !== -1 && last !== -1 && last > first) {
// //       try {
// //         return JSON.parse(candidate.slice(first, last + 1));
// //       } catch {}
// //     }
// //     throw new Error("Invalid JSON received from model");
// //   }

// //   setConfig(config: Partial<LLMConfig>) {
// //     this.config = { ...this.config, ...config };
// //     localStorage.setItem("llm_provider", this.config.provider);
// //     if (this.config.apiKey) {
// //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// //     }
// //     if (this.config.model) {
// //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// //     }
// //   }

// //   getConfig(): LLMConfig {
// //     return { ...this.config };
// //   }

// //   async countTokens(text: string): Promise<TokenizerResponse> {
// //     const words = text.split(/\s+/).filter(Boolean).length;
// //     let tokenMultiplier = 1.3;

// //     switch (this.config.provider) {
// //       case "openai":
// //         tokenMultiplier = 1.3;
// //         break;
// //       case "perplexity":
// //         tokenMultiplier = 1.35;
// //         break;
// //       case "anthropic":
// //         tokenMultiplier = 1.25;
// //         break;
// //       case "google":
// //         tokenMultiplier = 1.2;
// //         break;
// //       default:
// //         tokenMultiplier = 1.3;
// //     }

// //     const tokens = Math.round(words * tokenMultiplier);
// //     return { tokens, words };
// //   }

// //   private extractWordLimit(raw: string): number | null {
// //     const text = (raw || "").toLowerCase();

// //     const pat1 = /\b(?:in|within|limit|about|around|approximately|~|approx)\s+(\d{1,4})\s+words?\b/;
// //     const m1 = text.match(pat1);
// //     if (m1 && m1[1]) return Math.max(50, Math.min(1200, Number(m1[1])));

// //     const pat2 = /\b(\d{1,4})\s+words?\b/;
// //     const m2 = text.match(pat2);
// //     if (m2 && m2[1]) return Math.max(50, Math.min(1200, Number(m2[1])));

// //     return null;
// //   }

// //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// //     if (!this.config.apiKey) throw new Error("API key not set");

// //     const originalCount = await this.countTokens(text);
// //     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// //     switch (this.config.provider) {
// //       case "openai":
// //         return this.optimizeWithOpenAI(text, target);
// //       case "perplexity":
// //         return this.optimizeWithPerplexity(text, target);
// //       case "anthropic":
// //         return this.optimizeWithAnthropic(text, target);
// //       case "google":
// //         return this.optimizeWithGoogle(text, target);
// //       default:
// //         return this.optimizeWithOpenAI(text, target);
// //     }
// //   }

// //   /** ✅ Optimized prompt (short + 4 alternatives) */
// //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// //     const model = (this.config.model || "gpt-4o-mini").trim();

// //     const res = await fetch("http://localhost:5000/api/optimize", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ text, model, temperature: 0.3, mode: "optimize" }),
// //     });

// //     const data = await res.json();
// //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// //     const raw = data?.choices?.[0]?.message?.content ?? "";
// //     if (!raw || raw.trim() === "") throw new Error("Model returned empty content");

// //     const parsed = this.parseJsonObject(raw);
// //     const optimizedText: string = (parsed?.optimizedText ?? "No optimized text generated.").toString();
// //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];

// //     const optimizedCount = await this.countTokens(optimizedText);

// //     return {
// //       optimizedText,
// //       tokens: optimizedCount.tokens,
// //       words: optimizedCount.words,
// //       suggestions,
// //     };
// //   }

// //   /** ✅ Generate detailed prompts (150–300 words + 4 variations) */
// //   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// //     if (!this.config.apiKey) throw new Error("API key not set");

// //     const model = (this.config.model || "gpt-4o-mini").trim();

// //     const res = await fetch("http://localhost:5000/api/optimize", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ text, model, temperature: 0.2, mode: "detailed" }),
// //     });

// //     const data = await res.json();
// //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// //     const raw = data?.choices?.[0]?.message?.content ?? "";
// //     if (!raw || raw.trim() === "") throw new Error("Model returned empty content");

// //     const parsed = this.parseJsonObject(raw);
// //     const optimizedText: string = (parsed?.optimizedText ?? "No detailed prompt generated.").toString();
// //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];

// //     const optimizedCount = await this.countTokens(optimizedText);

// //     return {
// //       optimizedText,
// //       tokens: optimizedCount.tokens,
// //       words: optimizedCount.words,
// //       suggestions,
// //     };
// //   }

// //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// //     const response = await fetch("https://api.perplexity.ai/chat/completions", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
// //       body: JSON.stringify({
// //         model: this.config.model || "llama-3.1-sonar-small-128k-online",
// //         messages: [
// //           { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
// //           { role: "user", content: text },
// //         ],
// //         temperature: 0.2,
// //         max_tokens: 700,
// //         response_format: { type: "json_object" },
// //       }),
// //     });

// //     const data = await response.json();
// //     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

// //     let result;
// //     try {
// //       result = JSON.parse(data.choices[0].message.content);
// //     } catch {
// //       throw new Error("Invalid response format from Perplexity");
// //     }

// //     const optimizedCount = await this.countTokens(result.optimizedText);
// //     return {
// //       optimizedText: result.optimizedText,
// //       tokens: optimizedCount.tokens,
// //       words: optimizedCount.words,
// //       suggestions: result.suggestions || [],
// //     };
// //   }

// //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// //     const originalCount = await this.countTokens(text);
// //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Anthropic integration pending"] };
// //   }

// //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// //     const originalCount = await this.countTokens(text);
// //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Google AI integration pending"] };
// //   }

// //   async getUserTokenUsage(): Promise<UserTokenUsage> {
// //     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
// //   }
// //   async incrementUserTokens(): Promise<void> {}
// //   async setUserTokenLimit(): Promise<void> {}
// // }

// // export const llmService = new LLMService();


// // export type LLMProvider = string;

// // export interface LLMConfig {
// //   provider: LLMProvider;
// //   apiKey: string;
// //   model?: string;
// //   maxTokens?: number;
// // }

// // export interface OptimizeUsage {
// //   prompt: number;
// //   completion: number;
// //   total: number;
// // }

// // export interface TokenizerResponse {
// //   tokens: number;
// //   words: number;
// // }

// // export interface OptimizeResponse {
// //   optimizedText: string;
// //   tokens: number;
// //   words: number;
// //   suggestions: string[];
// //   usage?: OptimizeUsage;
// // }

// // export interface UserTokenUsage {
// //   totalTokensUsed: number;
// //   tokenLimit: number;
// // }

// // const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
// //   openai: "gpt-4o-mini",
// //   perplexity: "llama-3.1-sonar-small-128k-online",
// //   anthropic: "claude-instant",
// //   google: "gemini-pro",
// //   other: "generic",
// // };

// // class LLMService {
// //   private config: LLMConfig = {
// //     provider: "openai",
// //     apiKey: "",
// //     model: "gpt-4o-mini",
// //   };

// //   constructor() {
// //     this.loadConfig();
// //   }

// //   private loadConfig() {
// //     const savedProvider = localStorage.getItem("llm_provider") || "openai";
// //     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
// //     const savedModel =
// //       localStorage.getItem(`${savedProvider}_model`) ||
// //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// //     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
// //     const defaultModelFromEnv =
// //       import.meta.env.VITE_DEFAULT_MODEL ||
// //       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

// //     this.config = {
// //       provider: savedProvider as LLMProvider,
// //       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
// //       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
// //     };
// //   }

// //   private parseJsonObject(content: string): any {
// //     const trimmed = content?.trim?.() || "";
// //     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// //     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

// //     try {
// //       return JSON.parse(candidate);
// //     } catch {}

// //     const first = candidate.indexOf("{");
// //     const last = candidate.lastIndexOf("}");
// //     if (first !== -1 && last !== -1 && last > first) {
// //       try {
// //         return JSON.parse(candidate.slice(first, last + 1));
// //       } catch {}
// //     }
// //     throw new Error("Invalid JSON received from model");
// //   }

// //   setConfig(config: Partial<LLMConfig>) {
// //     this.config = { ...this.config, ...config };
// //     localStorage.setItem("llm_provider", this.config.provider);
// //     if (this.config.apiKey) {
// //       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
// //     }
// //     if (this.config.model) {
// //       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
// //     }
// //   }

// //   getConfig(): LLMConfig {
// //     return { ...this.config };
// //   }

// //   async countTokens(text: string): Promise<TokenizerResponse> {
// //     const words = text.split(/\s+/).filter(Boolean).length;
// //     let tokenMultiplier = 1.3;

// //     switch (this.config.provider) {
// //       case "openai":
// //         tokenMultiplier = 1.3;
// //         break;
// //       case "perplexity":
// //         tokenMultiplier = 1.35;
// //         break;
// //       case "anthropic":
// //         tokenMultiplier = 1.25;
// //         break;
// //       case "google":
// //         tokenMultiplier = 1.2;
// //         break;
// //       default:
// //         tokenMultiplier = 1.3;
// //     }

// //     const tokens = Math.round(words * tokenMultiplier);
// //     return { tokens, words };
// //   }

// //   private extractWordLimit(raw: string): number | null {
// //     const text = (raw || "").toLowerCase();

// //     const pat1 = /\b(?:in|within|limit|about|around|approximately|~|approx)\s+(\d{1,4})\s+words?\b/;
// //     const m1 = text.match(pat1);
// //     if (m1 && m1[1]) return Math.max(50, Math.min(1200, Number(m1[1])));

// //     const pat2 = /\b(\d{1,4})\s+words?\b/;
// //     const m2 = text.match(pat2);
// //     if (m2 && m2[1]) return Math.max(50, Math.min(1200, Number(m2[1])));

// //     return null;
// //   }

// //   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
// //     if (!this.config.apiKey) throw new Error("API key not set");

// //     const originalCount = await this.countTokens(text);
// //     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

// //     switch (this.config.provider) {
// //       case "openai":
// //         return this.optimizeWithOpenAI(text, target);
// //       case "perplexity":
// //         return this.optimizeWithPerplexity(text, target);
// //       case "anthropic":
// //         return this.optimizeWithAnthropic(text, target);
// //       case "google":
// //         return this.optimizeWithGoogle(text, target);
// //       default:
// //         return this.optimizeWithOpenAI(text, target);
// //     }
// //   }

// //   /** ✅ Optimized prompt (short + 4 alternatives) */
// //   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
// //     const model = (this.config.model || "gpt-4o-mini").trim();

// //     const res = await fetch("http://localhost:5000/api/optimize", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ text, model, temperature: 0.3, mode: "optimize" }),
// //     });

// //     const data = await res.json();
// //     if (!res.ok) throw new Error(data?.error?.message || `OpenAI error (${res.status})`);

// //     const raw = data?.choices?.[0]?.message?.content ?? "";
// //     if (!raw || raw.trim() === "") throw new Error("Model returned empty content");

// //     const parsed = this.parseJsonObject(raw);
// //     const optimizedText: string = (parsed?.optimizedText ?? "No optimized text generated.").toString();
// //     const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];

// //     const optimizedCount = await this.countTokens(optimizedText);

// //     return {
// //       optimizedText,
// //       tokens: optimizedCount.tokens,
// //       words: optimizedCount.words,
// //       suggestions,
// //     };
// //   }

// //   /** ✅ Generate detailed prompts (150–300 words + 4 variations) */
// //   /** ✅ Generate detailed prompts (150–300 words + 4 variations) */
// // async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
// //   if (!this.config.apiKey) throw new Error("API key not set");

// //   const model = (this.config.model || "gpt-4o-mini").trim();

// //   const res = await fetch("http://localhost:5000/api/optimize", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({ text, model, temperature: 0.2, mode: "detailed" }),
// //   });

// //   const data = await res.json();

// //   // ✅ Handle any backend-side error
// //   if (!res.ok) {
// //     throw new Error(data?.error || `OpenAI error (${res.status})`);
// //   }

// //   // ✅ Handle backend response shape (new JSON format)
// //   const optimizedText =
// //     data?.optimizedText ||
// //     data?.parsed?.optimizedText ||
// //     data?.fallback?.optimizedText ||
// //     "";

// //   const suggestions =
// //     data?.suggestions ||
// //     data?.parsed?.suggestions ||
// //     data?.fallback?.suggestions ||
// //     [];

// //   // ✅ If even after fallback, still empty
// //   if (!optimizedText || optimizedText.trim() === "") {
// //     console.warn("⚠️ Empty optimizedText from backend:", data);
// //     throw new Error("Model returned empty content");
// //   }

// //   // ✅ Count tokens for display
// //   const optimizedCount = await this.countTokens(optimizedText);

// //   return {
// //     optimizedText,
// //     tokens: optimizedCount.tokens,
// //     words: optimizedCount.words,
// //     suggestions: Array.isArray(suggestions) ? suggestions : [],
// //   };
// // }


// //   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
// //     const response = await fetch("https://api.perplexity.ai/chat/completions", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
// //       body: JSON.stringify({
// //         model: this.config.model || "llama-3.1-sonar-small-128k-online",
// //         messages: [
// //           { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
// //           { role: "user", content: text },
// //         ],
// //         temperature: 0.2,
// //         max_tokens: 700,
// //         response_format: { type: "json_object" },
// //       }),
// //     });

// //     const data = await response.json();
// //     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

// //     let result;
// //     try {
// //       result = JSON.parse(data.choices[0].message.content);
// //     } catch {
// //       throw new Error("Invalid response format from Perplexity");
// //     }

// //     const optimizedCount = await this.countTokens(result.optimizedText);
// //     return {
// //       optimizedText: result.optimizedText,
// //       tokens: optimizedCount.tokens,
// //       words: optimizedCount.words,
// //       suggestions: result.suggestions || [],
// //     };
// //   }

// //   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
// //     const originalCount = await this.countTokens(text);
// //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Anthropic integration pending"] };
// //   }

// //   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
// //     const originalCount = await this.countTokens(text);
// //     return { optimizedText: text, tokens: originalCount.tokens, words: originalCount.words, suggestions: ["Google AI integration pending"] };
// //   }

// //   async getUserTokenUsage(): Promise<UserTokenUsage> {
// //     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
// //   }
// //   async incrementUserTokens(): Promise<void> {}
// //   async setUserTokenLimit(): Promise<void> {}
// // }

// // export const llmService = new LLMService();




// export type LLMProvider = string;

// export interface LLMConfig {
//   provider: LLMProvider;
//   apiKey: string;
//   model?: string;
//   maxTokens?: number;
// }

// export interface OptimizeUsage {
//   prompt: number;
//   completion: number;
//   total: number;
// }

// export interface TokenizerResponse {
//   tokens: number;
//   words: number;
// }

// export interface OptimizeResponse {
//   optimizedText: string;
//   tokens: number;
//   words: number;
//   suggestions: string[];
//   usage?: OptimizeUsage;
// }

// export interface UserTokenUsage {
//   totalTokensUsed: number;
//   tokenLimit: number;
// }

// const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
//   openai: "gpt-4o-mini",
//   perplexity: "llama-3.1-sonar-small-128k-online",
//   anthropic: "claude-instant",
//   google: "gemini-pro",
//   other: "generic",
// };

// class LLMService {
//   private config: LLMConfig = {
//     provider: "openai",
//     apiKey: "",
//     model: "gpt-4o-mini",
//   };

//   constructor() {
//     this.loadConfig();
//   }

//   private loadConfig() {
//     const savedProvider = localStorage.getItem("llm_provider") || "openai";
//     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
//     const savedModel =
//       localStorage.getItem(`${savedProvider}_model`) ||
//       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

//     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
//     const defaultModelFromEnv =
//       import.meta.env.VITE_DEFAULT_MODEL ||
//       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

//     this.config = {
//       provider: savedProvider as LLMProvider,
//       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
//       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
//     };
//   }

//   private parseJsonObject(content: string): any {
//     const trimmed = content?.trim?.() || "";
//     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
//     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

//     try {
//       return JSON.parse(candidate);
//     } catch {}

//     const first = candidate.indexOf("{");
//     const last = candidate.lastIndexOf("}");
//     if (first !== -1 && last !== -1 && last > first) {
//       try {
//         return JSON.parse(candidate.slice(first, last + 1));
//       } catch {}
//     }
//     throw new Error("Invalid JSON received from model");
//   }

//   setConfig(config: Partial<LLMConfig>) {
//     this.config = { ...this.config, ...config };
//     localStorage.setItem("llm_provider", this.config.provider);
//     if (this.config.apiKey) {
//       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
//     }
//     if (this.config.model) {
//       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
//     }
//   }

//   getConfig(): LLMConfig {
//     return { ...this.config };
//   }

//   async countTokens(text: string): Promise<TokenizerResponse> {
//     const words = text.split(/\s+/).filter(Boolean).length;
//     let tokenMultiplier = 1.3;

//     switch (this.config.provider) {
//       case "openai":
//         tokenMultiplier = 1.3;
//         break;
//       case "perplexity":
//         tokenMultiplier = 1.35;
//         break;
//       case "anthropic":
//         tokenMultiplier = 1.25;
//         break;
//       case "google":
//         tokenMultiplier = 1.2;
//         break;
//       default:
//         tokenMultiplier = 1.3;
//     }

//     const tokens = Math.round(words * tokenMultiplier);
//     return { tokens, words };
//   }

//   private extractWordLimit(raw: string): number | null {
//     const text = (raw || "").toLowerCase();

//     const pat1 = /\b(?:in|within|limit|about|around|approximately|~|approx)\s+(\d{1,4})\s+words?\b/;
//     const m1 = text.match(pat1);
//     if (m1 && m1[1]) return Math.max(50, Math.min(1200, Number(m1[1])));

//     const pat2 = /\b(\d{1,4})\s+words?\b/;
//     const m2 = text.match(pat2);
//     if (m2 && m2[1]) return Math.max(50, Math.min(1200, Number(m2[1])));

//     return null;
//   }

//   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
//     if (!this.config.apiKey) throw new Error("API key not set");

//     const originalCount = await this.countTokens(text);
//     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

//     switch (this.config.provider) {
//       case "openai":
//         return this.optimizeWithOpenAI(text, target);
//       case "perplexity":
//         return this.optimizeWithPerplexity(text, target);
//       case "anthropic":
//         return this.optimizeWithAnthropic(text, target);
//       case "google":
//         return this.optimizeWithGoogle(text, target);
//       default:
//         return this.optimizeWithOpenAI(text, target);
//     }
//   }

//   /** ✅ Fixed: Optimized prompt (short + 4 alternatives) */
//   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
//     const model = (this.config.model || "gpt-4o-mini").trim();

//     try {
//       const res = await fetch("http://localhost:5000/api/optimize", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text, model, temperature: 0.3, mode: "optimize" }),
//       });

//       const data = await res.json();
      
//       if (!res.ok) {
//         throw new Error(data?.error || `Backend error (${res.status})`);
//       }

//       // ✅ FIX: Handle backend response format correctly
//       const optimizedText = data?.optimizedText || "";
//       const suggestions = data?.suggestions || [];

//       if (!optimizedText || optimizedText.trim() === "") {
//         throw new Error("Model returned empty content");
//       }

//       const optimizedCount = await this.countTokens(optimizedText);

//       return {
//         optimizedText,
//         tokens: optimizedCount.tokens,
//         words: optimizedCount.words,
//         suggestions,
//       };
//     } catch (error) {
//       console.error("OpenAI optimization error:", error);
//       throw error;
//     }
//   }

//   /** ✅ Fixed: Generate detailed prompts (150–300 words + 4 variations) */
//   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
//     if (!this.config.apiKey) throw new Error("API key not set");

//     const model = (this.config.model || "gpt-4o-mini").trim();

//     try {
//       const res = await fetch("http://localhost:5000/api/optimize", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text, model, temperature: 0.2, mode: "detailed" }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.error || `Backend error (${res.status})`);
//       }

//       // ✅ FIX: Handle backend response format
//       const optimizedText = data?.optimizedText || "";
//       const suggestions = data?.suggestions || [];

//       if (!optimizedText || optimizedText.trim() === "") {
//         console.warn("⚠️ Empty optimizedText from backend:", data);
//         throw new Error("Model returned empty content");
//       }

//       const optimizedCount = await this.countTokens(optimizedText);

//       return {
//         optimizedText,
//         tokens: optimizedCount.tokens,
//         words: optimizedCount.words,
//         suggestions: Array.isArray(suggestions) ? suggestions : [],
//       };
//     } catch (error) {
//       console.error("Detailed prompt generation error:", error);
//       throw error;
//     }
//   }

//   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
//     const response = await fetch("https://api.perplexity.ai/chat/completions", {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
//       body: JSON.stringify({
//         model: this.config.model || "llama-3.1-sonar-small-128k-online",
//         messages: [
//           { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
//           { role: "user", content: text },
//         ],
//         temperature: 0.2,
//         max_tokens: 700,
//         response_format: { type: "json_object" },
//       }),
//     });

//     const data = await response.json();
//     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

//     let result;
//     try {
//       result = JSON.parse(data.choices[0].message.content);
//     } catch {
//       throw new Error("Invalid response format from Perplexity");
//     }

//     const optimizedCount = await this.countTokens(result.optimizedText);
//     return {
//       optimizedText: result.optimizedText,
//       tokens: optimizedCount.tokens,
//       words: optimizedCount.words,
//       suggestions: result.suggestions || [],
//     };
//   }

//   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
//     const originalCount = await this.countTokens(text);
//     return { 
//       optimizedText: text, 
//       tokens: originalCount.tokens, 
//       words: originalCount.words, 
//       suggestions: ["Anthropic integration pending"] 
//     };
//   }

//   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
//     const originalCount = await this.countTokens(text);
//     return { 
//       optimizedText: text, 
//       tokens: originalCount.tokens, 
//       words: originalCount.words, 
//       suggestions: ["Google AI integration pending"] 
//     };
//   }

//   async getUserTokenUsage(): Promise<UserTokenUsage> {
//     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
//   }

//   async incrementUserTokens(): Promise<void> {
//     // Implementation for token tracking
//   }

//   async setUserTokenLimit(): Promise<void> {
//     // Implementation for setting token limits
//   }
// }

// export const llmService = new LLMService();



// export type LLMProvider = string;

// export interface LLMConfig {
//   provider: LLMProvider;
//   apiKey: string;
//   model?: string;
//   maxTokens?: number;
// }

// export interface OptimizeUsage {
//   prompt: number;
//   completion: number;
//   total: number;
// }

// export interface TokenizerResponse {
//   tokens: number;
//   words: number;
// }

// export interface OptimizeResponse {
//   optimizedText: string;
//   tokens: number;
//   words: number;
//   suggestions: string[];
//   usage?: OptimizeUsage;
// }

// export interface UserTokenUsage {
//   totalTokensUsed: number;
//   tokenLimit: number;
// }

// const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
//   openai: "gpt-4o-mini",
//   perplexity: "llama-3.1-sonar-small-128k-online",
//   anthropic: "claude-instant",
//   google: "gemini-pro",
//   other: "generic",
// };

// class LLMService {
//   private config: LLMConfig = {
//     provider: "openai",
//     apiKey: "",
//     model: "gpt-4o-mini",
//   };

//   constructor() {
//     this.loadConfig();
//   }

//   private loadConfig() {
//     const savedProvider = localStorage.getItem("llm_provider") || "openai";
//     const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
//     const savedModel =
//       localStorage.getItem(`${savedProvider}_model`) ||
//       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

//     const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
//     const defaultModelFromEnv =
//       import.meta.env.VITE_DEFAULT_MODEL ||
//       DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

//     this.config = {
//       provider: savedProvider as LLMProvider,
//       apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
//       model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
//     };
//   }

//   private parseJsonObject(content: string): any {
//     const trimmed = content?.trim?.() || "";
//     const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
//     const candidate = fenceMatch ? fenceMatch[1] : trimmed;

//     try {
//       return JSON.parse(candidate);
//     } catch {}

//     const first = candidate.indexOf("{");
//     const last = candidate.lastIndexOf("}");
//     if (first !== -1 && last !== -1 && last > first) {
//       try {
//         return JSON.parse(candidate.slice(first, last + 1));
//       } catch {}
//     }
//     throw new Error("Invalid JSON received from model");
//   }

//   setConfig(config: Partial<LLMConfig>) {
//     this.config = { ...this.config, ...config };
//     localStorage.setItem("llm_provider", this.config.provider);
//     if (this.config.apiKey) {
//       localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
//     }
//     if (this.config.model) {
//       localStorage.setItem(`${this.config.provider}_model`, this.config.model);
//     }
//   }

//   getConfig(): LLMConfig {
//     return { ...this.config };
//   }

//   async countTokens(text: string): Promise<TokenizerResponse> {
//     const words = text.split(/\s+/).filter(Boolean).length;
//     let tokenMultiplier = 1.3;

//     switch (this.config.provider) {
//       case "openai":
//         tokenMultiplier = 1.3;
//         break;
//       case "perplexity":
//         tokenMultiplier = 1.35;
//         break;
//       case "anthropic":
//         tokenMultiplier = 1.25;
//         break;
//       case "google":
//         tokenMultiplier = 1.2;
//         break;
//       default:
//         tokenMultiplier = 1.3;
//     }

//     const tokens = Math.round(words * tokenMultiplier);
//     return { tokens, words };
//   }

//   private extractWordLimit(raw: string): number | null {
//     const text = (raw || "").toLowerCase();

//     const pat1 = /\b(?:in|within|limit|about|around|approximately|~|approx)\s+(\d{1,4})\s+words?\b/;
//     const m1 = text.match(pat1);
//     if (m1 && m1[1]) return Math.max(50, Math.min(1200, Number(m1[1])));

//     const pat2 = /\b(\d{1,4})\s+words?\b/;
//     const m2 = text.match(pat2);
//     if (m2 && m2[1]) return Math.max(50, Math.min(1200, Number(m2[1])));

//     return null;
//   }

//   async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
//     if (!this.config.apiKey) throw new Error("API key not set");

//     const originalCount = await this.countTokens(text);
//     const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

//     switch (this.config.provider) {
//       case "openai":
//         return this.optimizeWithOpenAI(text, target);
//       case "perplexity":
//         return this.optimizeWithPerplexity(text, target);
//       case "anthropic":
//         return this.optimizeWithAnthropic(text, target);
//       case "google":
//         return this.optimizeWithGoogle(text, target);
//       default:
//         return this.optimizeWithOpenAI(text, target);
//     }
//   }

//   /** ✅ Fixed: Optimized prompt (short + 4 alternatives) */
//   private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
//     const model = (this.config.model || "gpt-4o-mini").trim();

//     try {
//       const res = await fetch("https://tokunbackendcode-cjfvg7a6ekhddzcf.eastus-01.azurewebsites.net//api/optimize", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text, model, temperature: 0.3, mode: "optimize" }),
//       });

//       const data = await res.json();
      
//       if (!res.ok) {
//         throw new Error(data?.error || `Backend error (${res.status})`);
//       }

//       // ✅ FIX: Handle backend response format correctly
//       const optimizedText = data?.optimizedText || "";
//       const suggestions = data?.suggestions || [];

//       if (!optimizedText || optimizedText.trim() === "") {
//         throw new Error("Model returned empty content");
//       }

//       const optimizedCount = await this.countTokens(optimizedText);

//       return {
//         optimizedText,
//         tokens: optimizedCount.tokens,
//         words: optimizedCount.words,
//         suggestions,
//       };
//     } catch (error) {
//       console.error("OpenAI optimization error:", error);
//       throw error;
//     }
//   }

//   /** ✅ Fixed: Generate detailed prompts (150–300 words + 4 variations) */
//   async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
//     if (!this.config.apiKey) throw new Error("API key not set");

//     const model = (this.config.model || "gpt-4o-mini").trim();

//     try {
//       const res = await fetch("https://tokunbackendcode-cjfvg7a6ekhddzcf.eastus-01.azurewebsites.net//api/optimize", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text, model, temperature: 0.2, mode: "detailed" }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.error || `Backend error (${res.status})`);
//       }

//       // ✅ FIX: Handle backend response format
//       const optimizedText = data?.optimizedText || "";
//       const suggestions = data?.suggestions || [];

//       if (!optimizedText || optimizedText.trim() === "") {
//         console.warn("⚠️ Empty optimizedText from backend:", data);
//         throw new Error("Model returned empty content");
//       }

//       const optimizedCount = await this.countTokens(optimizedText);

//       return {
//         optimizedText,
//         tokens: optimizedCount.tokens,
//         words: optimizedCount.words,
//         suggestions: Array.isArray(suggestions) ? suggestions : [],
//       };
//     } catch (error) {
//       console.error("Detailed prompt generation error:", error);
//       throw error;
//     }
//   }

//   private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
//     const response = await fetch("https://api.perplexity.ai/chat/completions", {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
//       body: JSON.stringify({
//         model: this.config.model || "llama-3.1-sonar-small-128k-online",
//         messages: [
//           { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
//           { role: "user", content: text },
//         ],
//         temperature: 0.2,
//         max_tokens: 700,
//         response_format: { type: "json_object" },
//       }),
//     });

//     const data = await response.json();
//     if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

//     let result;
//     try {
//       result = JSON.parse(data.choices[0].message.content);
//     } catch {
//       throw new Error("Invalid response format from Perplexity");
//     }

//     const optimizedCount = await this.countTokens(result.optimizedText);
//     return {
//       optimizedText: result.optimizedText,
//       tokens: optimizedCount.tokens,
//       words: optimizedCount.words,
//       suggestions: result.suggestions || [],
//     };
//   }

//   private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
//     const originalCount = await this.countTokens(text);
//     return { 
//       optimizedText: text, 
//       tokens: originalCount.tokens, 
//       words: originalCount.words, 
//       suggestions: ["Anthropic integration pending"] 
//     };
//   }

//   private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
//     const originalCount = await this.countTokens(text);
//     return { 
//       optimizedText: text, 
//       tokens: originalCount.tokens, 
//       words: originalCount.words, 
//       suggestions: ["Google AI integration pending"] 
//     };
//   }

//   async getUserTokenUsage(): Promise<UserTokenUsage> {
//     return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
//   }

//   async incrementUserTokens(): Promise<void> {
//     // Implementation for token tracking
//   }

//   async setUserTokenLimit(): Promise<void> {
//     // Implementation for setting token limits
//   }
// }

// export const llmService = new LLMService();




export type LLMProvider = string;

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface OptimizeUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface TokenizerResponse {
  tokens: number;
  words: number;
}

export interface OptimizeResponse {
  optimizedText: string;
  tokens: number;
  words: number;
  suggestions: string[];
  usage?: OptimizeUsage;
}

export interface UserTokenUsage {
  totalTokensUsed: number;
  tokenLimit: number;
}

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
  openai: "gpt-4o-mini",
  perplexity: "llama-3.1-sonar-small-128k-online",
  anthropic: "claude-instant",
  google: "gemini-pro",
  other: "generic",
};

class LLMService {
  private config: LLMConfig = {
    provider: "openai",
    apiKey: "",
    model: "gpt-4o-mini",
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const savedProvider = localStorage.getItem("llm_provider") || "openai";
    const savedApiKey = localStorage.getItem(`${savedProvider}_key`);
    const savedModel =
      localStorage.getItem(`${savedProvider}_model`) ||
      DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

    const defaultKeyFromEnv = import.meta.env.VITE_OPENAI_API_KEY || "";
    const defaultModelFromEnv =
      import.meta.env.VITE_DEFAULT_MODEL ||
      DEFAULT_MODEL_BY_PROVIDER[savedProvider as LLMProvider];

    this.config = {
      provider: savedProvider as LLMProvider,
      apiKey: savedApiKey || (savedProvider === "openai" ? defaultKeyFromEnv : ""),
      model: savedModel || (savedProvider === "openai" ? defaultModelFromEnv : ""),
    };
  }

  setConfig(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
    localStorage.setItem("llm_provider", this.config.provider);
    if (this.config.apiKey) {
      localStorage.setItem(`${this.config.provider}_key`, this.config.apiKey);
    }
    if (this.config.model) {
      localStorage.setItem(`${this.config.provider}_model`, this.config.model);
    }
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  async countTokens(text: string): Promise<TokenizerResponse> {
    const words = text.split(/\s+/).filter(Boolean).length;
    let tokenMultiplier = 1.3;

    switch (this.config.provider) {
      case "openai":
        tokenMultiplier = 1.3;
        break;
      case "perplexity":
        tokenMultiplier = 1.35;
        break;
      case "anthropic":
        tokenMultiplier = 1.25;
        break;
      case "google":
        tokenMultiplier = 1.2;
        break;
      default:
        tokenMultiplier = 1.3;
    }

    const tokens = Math.round(words * tokenMultiplier);
    return { tokens, words };
  }

  async optimizePrompt(text: string, targetTokens?: number): Promise<OptimizeResponse> {
    if (!this.config.apiKey) throw new Error("API key not set");

    const originalCount = await this.countTokens(text);
    const target = targetTokens || Math.max(Math.floor(originalCount.tokens * 0.7), 10);

    switch (this.config.provider) {
      case "openai":
        return this.optimizeWithOpenAI(text, target);
      case "perplexity":
        return this.optimizeWithPerplexity(text, target);
      case "anthropic":
        return this.optimizeWithAnthropic(text, target);
      case "google":
        return this.optimizeWithGoogle(text, target);
      default:
        return this.optimizeWithOpenAI(text, target);
    }
  }

  private async optimizeWithOpenAI(text: string, targetTokens: number): Promise<OptimizeResponse> {
    const model = (this.config.model || "gpt-4o-mini").trim();

    try {
      const res = await fetch(`${API_BASE}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model, temperature: 0.3, mode: "optimize" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Backend error (${res.status})`);
      }

      const optimizedText = data?.optimizedText || "";
      const suggestions = data?.suggestions || [];

      if (!optimizedText || optimizedText.trim() === "") {
        throw new Error("Model returned empty content");
      }

      const optimizedCount = await this.countTokens(optimizedText);

      return {
        optimizedText,
        tokens: optimizedCount.tokens,
        words: optimizedCount.words,
        suggestions,
      };
    } catch (error) {
      console.error("OpenAI optimization error:", error);
      throw error;
    }
  }

  async generateDetailedPrompt(text: string): Promise<OptimizeResponse> {
    if (!this.config.apiKey) throw new Error("API key not set");

    const model = (this.config.model || "gpt-4o-mini").trim();

    try {
      const res = await fetch(`${API_BASE}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model, temperature: 0.2, mode: "detailed" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Backend error (${res.status})`);
      }

      const optimizedText = data?.optimizedText || "";
      const suggestions = data?.suggestions || [];

      if (!optimizedText || optimizedText.trim() === "") {
        console.warn("⚠️ Empty optimizedText from backend:", data);
        throw new Error("Model returned empty content");
      }

      const optimizedCount = await this.countTokens(optimizedText);

      return {
        optimizedText,
        tokens: optimizedCount.tokens,
        words: optimizedCount.words,
        suggestions: Array.isArray(suggestions) ? suggestions : [],
      };
    } catch (error) {
      console.error("Detailed prompt generation error:", error);
      throw error;
    }
  }

  private async optimizeWithPerplexity(text: string, targetTokens: number): Promise<OptimizeResponse> {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
      body: JSON.stringify({
        model: this.config.model || "llama-3.1-sonar-small-128k-online",
        messages: [
          { role: "system", content: `You are an advanced Prompt Engineer. Return JSON with optimizedText and suggestions.` },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        max_tokens: 700,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "Error optimizing prompt");

    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch {
      throw new Error("Invalid response format from Perplexity");
    }

    const optimizedCount = await this.countTokens(result.optimizedText);
    return {
      optimizedText: result.optimizedText,
      tokens: optimizedCount.tokens,
      words: optimizedCount.words,
      suggestions: result.suggestions || [],
    };
  }

  private async optimizeWithAnthropic(text: string, targetTokens: number): Promise<OptimizeResponse> {
    const originalCount = await this.countTokens(text);
    return {
      optimizedText: text,
      tokens: originalCount.tokens,
      words: originalCount.words,
      suggestions: ["Anthropic integration pending"],
    };
  }

  private async optimizeWithGoogle(text: string, targetTokens: number): Promise<OptimizeResponse> {
    const originalCount = await this.countTokens(text);
    return {
      optimizedText: text,
      tokens: originalCount.tokens,
      words: originalCount.words,
      suggestions: ["Google AI integration pending"],
    };
  }

  async getUserTokenUsage(): Promise<UserTokenUsage> {
    return { totalTokensUsed: 0, tokenLimit: Number.POSITIVE_INFINITY };
  }

  async incrementUserTokens(): Promise<void> {}

  async setUserTokenLimit(): Promise<void> {}
}

export const llmService = new LLMService();