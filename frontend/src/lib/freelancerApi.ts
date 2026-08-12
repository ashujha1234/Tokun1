// lib/freelancerApi.ts
//
// Client for the freelancer endpoints (server/routes/freelancerRoutes.js).
//
// Two things this API does NOT do, worth stating because both were true earlier:
//   * The profile is never sent for admin approval — finishing onboarding
//     activates it (`activateFreelancerProfile`). Only the intro video is
//     reviewed.
//   * No bank details pass through here. The Razorpay linked account is
//     collected once by the payout form, whichever flow asks for it first.
//
// Everything returns a result object rather than throwing, because every caller
// is a UI surface that has to render *something* — a form that unmounts on a
// network blip is worse than one showing an error line with the typing intact.

const API_BASE = (
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

/** DRAFT = onboarding unfinished. ACTIVE = live. No review state exists. */
export type FreelancerStatus = "DRAFT" | "ACTIVE";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type LanguageLevel = "basic" | "conversational" | "fluent" | "native";
/** The intro video is the one admin-gated field on a profile. */
export type VideoStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export const LANGUAGE_LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: "basic", label: "Basic" },
  { value: "conversational", label: "Conversational" },
  { value: "fluent", label: "Fluent" },
  { value: "native", label: "Native / bilingual" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "full_time", label: "Full-time — 40+ hrs/week" },
  { value: "part_time", label: "Part-time — 20-30 hrs/week" },
  { value: "occasional", label: "Occasional — a few hrs/week" },
] as const;

export interface CatalogSkill {
  _id?: string;
  name: string;
  slug: string;
  group?: string;
  usageCount?: number;
}

export interface ProfileSkill {
  skillId?: string | null;
  name: string;
  slug: string;
  level: SkillLevel;
}

export interface ProfileLanguage {
  name: string;
  level: LanguageLevel;
}

export interface Specialization {
  _id: string;
  name: string;
  slug: string;
  group?: string;
  description?: string;
}

export interface SpecializationGroup {
  group: string;
  items: Specialization[];
}

export interface WorkExperienceEntry {
  _id?: string;
  title: string;
  company?: string;
  from?: string | null; // "YYYY-MM"
  to?: string | null;
  current?: boolean;
  description?: string;
}

export interface EducationEntry {
  _id?: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  from?: string | null;
  to?: string | null;
}

export interface CertificationEntry {
  _id?: string;
  name: string;
  issuer?: string;
  issuedAt?: string | null;
  url?: string;
}

export interface IntroVideo {
  status: VideoStatus;
  /** Owner sees their own video at any status; the public read only serves APPROVED. */
  url: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  sizeBytes?: number | null;
  originalName?: string;
  uploadedAt?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  submissionCount?: number;
}

/** The requirements shown in the uploader, served by the API so the two agree. */
export interface IntroVideoRules {
  minSeconds: number;
  maxSeconds: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  aspectTolerance: number;
  maxBytes: number;
}

/** One row of the "Profile Strength X/12" checklist. */
export interface StrengthItem {
  /** Also the ?focused_section= value the edit page navigates by. */
  key: string;
  label: string;
  done: boolean;
  /** true for the items that also block activation. */
  required: boolean;
}

export interface ProfileStrength {
  items: StrengthItem[];
  score: number;
  total: number;
}

export interface FreelancerProfile {
  _id: string;
  userId: string;
  displayName: string;
  professionalTitle: string;
  about: string;
  country: string;
  city: string;
  languages: ProfileLanguage[];
  skills: ProfileSkill[];
  specializations: Specialization[];
  workExperience: WorkExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  portfolioLinks: string[];
  introVideo: IntroVideo;
  hourlyRate: number | null;
  availability: "full_time" | "part_time" | "occasional" | null;
  status: FreelancerStatus;
  activatedAt: string | null;
  /** Server-computed list of what still blocks activation. */
  completenessErrors: string[];
  strength: ProfileStrength;
  /** Whether a Razorpay linked account already exists for this user. */
  payoutReady: boolean;
  videoRules: IntroVideoRules;
}

/** The subset of a profile a client is allowed to write. */
export type ProfileDraft = Partial<
  Pick<
    FreelancerProfile,
    | "displayName"
    | "professionalTitle"
    | "about"
    | "country"
    | "city"
    | "languages"
    | "workExperience"
    | "education"
    | "certifications"
    | "portfolioLinks"
    | "hourlyRate"
    | "availability"
  >
> & {
  // Sent as slug+level pairs; the server resolves names from the catalog so a
  // client can't invent a skill by naming it.
  skills?: { slug: string; level: SkillLevel }[];
  specializations?: string[];
};

/**
 * Result of one call. Check `ok` first; `data` is only meaningful when it's true.
 *
 * Written as one flat shape rather than the tidier
 * `{ok: true; data: T} | {ok: false; error: string}` discriminated union because
 * this project compiles with `strict: false` (see tsconfig.app.json), and without
 * strictNullChecks TypeScript won't narrow a union on a boolean discriminant —
 * every `if (!res.ok) return res.message` would fail to compile.
 */
export interface ApiResult<T> {
  ok: boolean;
  /** The response body. Only populated when `ok` is true. */
  data: T;
  /** Machine-readable failure code, e.g. "video_under_review". */
  error?: string;
  /** Always safe to show a person. */
  message?: string;
  /** Per-item problems — the completeness list, or every video rule broken. */
  errors?: string[];
  status?: number;
}

function authHeaders(token?: string | null): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Single place that turns a fetch into an ApiResult. `message` is always
// populated with something worth showing a person, so callers never have to
// invent copy for the failure case.
async function request<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<ApiResult<T>> {
  const { token, ...rest } = init;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: { ...authHeaders(token), ...(rest.headers as Record<string, string>) },
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok || data?.success === false) {
      return {
        ok: false,
        data: undefined as unknown as T,
        status: res.status,
        error: data?.error || `http_${res.status}`,
        message:
          data?.message ||
          (res.status === 401 ? "Please log in again." : "Something went wrong. Please try again."),
        errors: Array.isArray(data?.errors) ? data.errors : undefined,
      };
    }

    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      data: undefined as unknown as T,
      error: "network_error",
      message: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

/* ─────────────────────────── catalog ─────────────────────────── */

/**
 * Autocomplete for the skills section. An empty `q` returns the popular-skills
 * list shown before the freelancer types anything.
 *
 * `exactMatch` is false when nothing in the catalog matches exactly — the signal
 * to offer "add <query> as a new skill". `creatable` is false when that offer
 * would be rejected anyway (all punctuation, or too short), so both are checked.
 */
export function searchSkills(q: string, limit = 12, token?: string | null) {
  return request<{
    skills: CatalogSkill[];
    query: string;
    exactMatch?: boolean;
    creatable?: boolean;
  }>(`/api/freelancer/skills/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
    method: "GET",
    token,
  });
}

/** Adds a skill the curated catalog is missing, or returns the existing row. */
export function createSkill(name: string, token: string) {
  return request<{ skill: CatalogSkill; created: boolean }>(`/api/freelancer/skills`, {
    method: "POST",
    token,
    body: JSON.stringify({ name }),
  });
}

type SpecializationsPayload = {
  specializations: Specialization[];
  grouped: SpecializationGroup[];
};

// The specialization catalog is a fixed list that changes only when the server's
// seed data does — refetching it every time the wizard or an editor opens is
// pure latency. Cached for the tab's lifetime, and shared by every caller so
// concurrent opens make one request rather than several.
let specializationsCache: SpecializationsPayload | null = null;
let specializationsInflight: Promise<ApiResult<SpecializationsPayload>> | null = null;

export function getSpecializations(token?: string | null) {
  if (specializationsCache) {
    return Promise.resolve<ApiResult<SpecializationsPayload>>({
      ok: true,
      data: specializationsCache,
    });
  }
  if (specializationsInflight) return specializationsInflight;

  specializationsInflight = request<SpecializationsPayload>(
    `/api/freelancer/specializations`,
    { method: "GET", token }
  ).then((res) => {
    specializationsInflight = null;
    // Only a successful, non-empty response is cached — caching a failure would
    // pin an empty picker for the rest of the session.
    if (res.ok && res.data?.specializations?.length) specializationsCache = res.data;
    return res;
  });

  return specializationsInflight;
}

/** Warms the catalog so the picker is ready before it's rendered. Fire-and-forget. */
export function prefetchSpecializations(token?: string | null) {
  if (!specializationsCache && !specializationsInflight) void getSpecializations(token);
}

/* ─────────────────────────── my profile ─────────────────────────── */

/**
 * `profile` is null when the flow was never started — a normal state, not an
 * error. `eligible` is false for org team members, who can't freelance in their
 * own right.
 */
export function getMyFreelancerProfile(token: string) {
  return request<{
    profile: FreelancerProfile | null;
    eligible: boolean;
    reason?: string;
    message?: string;
  }>(`/api/freelancer/me`, { method: "GET", token });
}

/** Saves one section. Fields absent from `draft` are left untouched. */
export function saveFreelancerDraft(draft: ProfileDraft, token: string) {
  return request<{ profile: FreelancerProfile }>(`/api/freelancer/me`, {
    method: "PUT",
    token,
    body: JSON.stringify(draft),
  });
}

/**
 * DRAFT → ACTIVE. The profile goes live immediately; nothing is queued for an
 * admin. Fails with `errors` listing what's still missing.
 */
export function activateFreelancerProfile(token: string) {
  return request<{ profile: FreelancerProfile }>(`/api/freelancer/me/activate`, {
    method: "POST",
    token,
  });
}

/* ─────────────────────────── intro video ─────────────────────────── */

/**
 * Uploads the intro video and queues it for admin review.
 *
 * Uses XMLHttpRequest rather than fetch purely for `onProgress`: these files are
 * large enough that a spinner with no percentage looks broken. Content-Type is
 * deliberately not set — the browser has to add the multipart boundary itself.
 */
export function uploadIntroVideo(
  file: File,
  token: string,
  onProgress?: (percent: number) => void
): Promise<ApiResult<{ introVideo: IntroVideo; strength: ProfileStrength }>> {
  return new Promise((resolve) => {
    const form = new FormData();
    form.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/freelancer/me/intro-video`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: any = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON body — handled by the status check below */
      }

      if (xhr.status >= 200 && xhr.status < 300 && data?.success !== false) {
        resolve({ ok: true, data });
        return;
      }

      resolve({
        ok: false,
        data: undefined as any,
        status: xhr.status,
        error: data?.error || `http_${xhr.status}`,
        message: data?.message || "That video couldn't be uploaded.",
        errors: Array.isArray(data?.errors) ? data.errors : undefined,
      });
    };

    xhr.onerror = () =>
      resolve({
        ok: false,
        data: undefined as any,
        error: "network_error",
        message: "The upload failed. Check your connection and try again.",
      });

    xhr.onabort = () =>
      resolve({ ok: false, data: undefined as any, error: "aborted", message: "Upload cancelled." });

    xhr.send(form);
  });
}

export function deleteIntroVideo(token: string) {
  return request<{ introVideo: IntroVideo; strength: ProfileStrength }>(
    `/api/freelancer/me/intro-video`,
    { method: "DELETE", token }
  );
}

/**
 * Checks a chosen video in the browser before the bytes go anywhere.
 *
 * Purely a courtesy — the server re-measures with ffprobe and its verdict is the
 * one that counts (a duration read off a form is just a number). But telling
 * someone their video is portrait after a 400 MB upload is a bad way to find out.
 *
 * Note this cannot see rotation metadata: a phone-filmed portrait video stored
 * as 1920×1080 passes here and is caught server-side. That's the right split —
 * being occasionally too lenient locally is fine, being too strict is not.
 */
export function precheckIntroVideo(
  file: File,
  rules: IntroVideoRules
): Promise<{ ok: boolean; errors: string[]; meta: { durationSeconds: number; width: number; height: number } | null }> {
  return new Promise((resolve) => {
    const errors: string[] = [];

    if (file.size > rules.maxBytes) {
      errors.push(`Your video must be under ${Math.round(rules.maxBytes / 1024 / 1024 / 1024)} GB.`);
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    // Whatever happens, the blob URL is released and the promise settles once —
    // a metadata load that never fires would otherwise leave the UI spinning.
    let settled = false;
    const finish = (meta: any) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve({ ok: errors.length === 0, errors, meta });
    };

    const timer = window.setTimeout(() => {
      // Couldn't read it locally — let the server be the judge rather than
      // blocking an upload that might be perfectly fine.
      finish(null);
    }, 15000);

    video.onloadedmetadata = () => {
      window.clearTimeout(timer);

      const duration = Math.round(video.duration * 100) / 100;
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (Number.isFinite(duration) && duration > 0) {
        if (duration < rules.minSeconds || duration > rules.maxSeconds) {
          errors.push(
            `Make sure your video is between ${rules.minSeconds} - ${rules.maxSeconds} seconds (this one is ${Math.round(
              duration
            )}s).`
          );
        }
      }

      if (width && height) {
        if (width < rules.minWidth || height < rules.minHeight) {
          errors.push(
            `Your video needs to be at least ${rules.minWidth}×${rules.minHeight} (this one is ${width}×${height}).`
          );
        }
        if (height > width) {
          errors.push("Your video needs to be filmed in landscape mode.");
        } else if (Math.abs(width / height - rules.aspectRatio) > rules.aspectTolerance) {
          errors.push("Your video aspect ratio needs to be 16:9.");
        }
      }

      finish({ durationSeconds: duration, width, height });
    };

    video.onerror = () => {
      window.clearTimeout(timer);
      errors.push("We couldn't read this video. Try an MP4 (H.264) export.");
      finish(null);
    };

    video.src = url;
  });
}

/* ─────────────────────────── public ─────────────────────────── */

export interface PublicFreelancerProfile {
  userId: string;
  displayName: string;
  professionalTitle: string;
  about: string;
  country: string;
  city: string;
  languages: ProfileLanguage[];
  skills: Pick<ProfileSkill, "name" | "slug" | "level">[];
  specializations: Specialization[];
  workExperience: WorkExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  portfolioLinks: string[];
  /** URL is null unless the video is APPROVED. */
  introVideo: IntroVideo;
  hourlyRate: number | null;
  availability: "full_time" | "part_time" | "occasional" | null;
  activatedAt: string | null;
}

/** ACTIVE profiles only; resolves to null for everyone else. */
export function getPublicFreelancerProfile(userId: string) {
  return request<{ profile: PublicFreelancerProfile | null }>(
    `/api/freelancer/public/${userId}`,
    { method: "GET" }
  );
}

/** Resolves an API-relative upload path (e.g. /uploads/...) against the API origin. */
export function freelancerMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}
