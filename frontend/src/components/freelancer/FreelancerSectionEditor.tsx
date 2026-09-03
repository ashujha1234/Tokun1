import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  ABOUT_MAX,
  AboutCounter,
  CityPicker,
  CountryPicker,
  LanguagesEditor,
  ProfessionalTitlePicker,
  RepeatableRows,
  SkillsPicker,
  SpecializationsPicker,
  inputClass,
  DateField,
  labelClass,
} from "@/components/freelancer/pickers";
import {
  saveFreelancerDraft,
  uploadIntroVideo,
  deleteIntroVideo,
  precheckIntroVideo,
  freelancerMediaUrl,
  AVAILABILITY_OPTIONS,
  type CertificationEntry,
  type EducationEntry,
  type FreelancerProfile,
  type IntroVideo,
  type IntroVideoRules,
  type ProfileDraft,
  type ProfileLanguage,
  type ProfileSkill,
  type ProfileStrength,
  type SpecializationGroup,
  type WorkExperienceEntry,
} from "@/lib/freelancerApi";

/*
 * Edits ONE section of a freelancer profile, in a dialog.
 *
 * A dialog rather than an inline editor on purpose. The previous version put the
 * sections in a left column and a checklist on the right, and clicking a
 * checklist item scrolled the matching section into view — which meant every
 * click yanked the page somewhere else, and after the jump it wasn't obvious
 * which section had opened or where its upload control was. Opening the editor
 * on top of the page removes the problem outright: the thing you clicked is
 * directly in front of you and the page hasn't moved at all.
 *
 * `section` decides which fields render. The same component serves the profile
 * page's per-section "Edit" buttons and its Profile Strength checklist, so both
 * routes into editing behave identically.
 */

export type EditableSection =
  | "basics"
  | "about"
  | "skills"
  | "specializations"
  | "portfolio"
  | "intro_video"
  | "experience"
  | "education"
  | "certifications"
  | "rate";

/** Strength-item key → the section that satisfies it. Some sections cover several. */
export const STRENGTH_KEY_TO_SECTION: Record<string, EditableSection> = {
  title: "basics",
  location: "basics",
  languages: "basics",
  about: "about",
  skills: "skills",
  specializations: "specializations",
  portfolio: "portfolio",
  intro_video: "intro_video",
  experience: "experience",
  education: "education",
  certifications: "certifications",
  // "photo" is absent on purpose — the avatar control lives in the profile
  // header, so that checklist row focuses it there instead of opening a dialog.
};

const SECTION_META: Record<EditableSection, { title: string; subtitle: string }> = {
  basics: {
    title: "Basic details",
    subtitle: "Your name, professional title, location and languages.",
  },
  about: {
    title: "About you",
    subtitle: "The first thing a buyer reads. Specifics beat adjectives.",
  },
  skills: {
    title: "Skills and expertise",
    subtitle: "Type to search. Buyers filter by these, so pick from the list.",
  },
  specializations: {
    title: "Specializations",
    subtitle: "What you sell. Most creators pick more than one.",
  },
  portfolio: {
    title: "Portfolio",
    subtitle: "Link the work you want clients to see first.",
  },
  intro_video: {
    title: "Intro video",
    subtitle: "Introduce yourself and make a connection with potential clients.",
  },
  experience: {
    title: "Work experience",
    subtitle: "Job history and achievements give clients insight into your expertise.",
  },
  education: {
    title: "Education",
    subtitle: "Back up your skills with degrees or programmes.",
  },
  certifications: {
    title: "Certifications",
    subtitle: "Credentials that prove what you claim.",
  },
  rate: {
    title: "Rate and availability",
    subtitle: "A guide for buyers. You still price each service yourself.",
  },
};

const GRADIENT = "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)";

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const VIDEO_STATUS_META: Record<
  IntroVideo["status"],
  { label: string; tint: string; icon: React.ReactNode } | null
> = {
  NONE: null,
  PENDING: { label: "Pending review", tint: "#7FB3F5", icon: <Clock className="w-3.5 h-3.5" /> },
  APPROVED: {
    label: "Live on your profile",
    tint: "#19E66C",
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Not approved",
    tint: "#F87171",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

/* ══════════════════════ intro video ══════════════════════ */

/**
 * The one field an admin approves.
 *
 * The chosen file is checked in the browser before anything uploads — learning a
 * video is portrait after a 400 MB upload is a bad way to find out. The server
 * re-measures with ffprobe regardless and its verdict is the one that counts;
 * this only saves the round-trip.
 */
function IntroVideoEditor({
  video,
  rules,
  token,
  onChange,
}: {
  video: IntroVideo;
  rules: IntroVideoRules;
  token: string;
  onChange: (video: IntroVideo, strength?: ProfileStrength) => void;
}) {
  const [picked, setPicked] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [removing, setRemoving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Object URLs are per-file allocations; without this each re-pick leaks one.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPicked(null);
    setPreviewUrl(null);
    setErrors([]);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const choose = async (file: File | null) => {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPicked(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors([]);
    setChecking(true);

    const verdict = await precheckIntroVideo(file, rules);
    setChecking(false);
    setErrors(verdict.errors);
  };

  const submit = async () => {
    if (!picked) return;

    setUploading(true);
    setProgress(0);
    const res = await uploadIntroVideo(picked, token, setProgress);
    setUploading(false);

    if (!res.ok) {
      // The server returns every rule broken, not just the first — shown as a
      // list so a video that's both too short and portrait is fixed in one pass.
      setErrors(res.errors?.length ? res.errors : [res.message || "Upload failed."]);
      return;
    }

    onChange(res.data.introVideo, res.data.strength);
    reset();
    toast({
      title: "Video submitted",
      description: "Our team will review it and let you know once it's live.",
    });
  };

  const remove = async () => {
    setRemoving(true);
    const res = await deleteIntroVideo(token);
    setRemoving(false);

    if (!res.ok) {
      toast({ title: "Couldn't remove the video", description: res.message });
      return;
    }
    onChange(res.data.introVideo, res.data.strength);
  };

  const statusMeta = VIDEO_STATUS_META[video.status];
  const existingUrl = freelancerMediaUrl(video.url);
  const underReview = video.status === "PENDING";
  const canSubmit = !!picked && errors.length === 0 && !checking && !uploading;

  return (
    <div className="space-y-4">
      {/* Current video, whatever its state — reviewing a rejection is impossible
          if you can't watch what was rejected. */}
      {video.status !== "NONE" && (
        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {statusMeta && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: `${statusMeta.tint}1F`, color: statusMeta.tint }}
              >
                {statusMeta.icon}
                {statusMeta.label}
              </span>
            )}
            {video.durationSeconds != null && (
              <span className="text-[11px] text-white/40">
                {Math.round(video.durationSeconds)}s · {video.width}×{video.height}
                {video.sizeBytes ? ` · ${formatBytes(video.sizeBytes)}` : ""}
              </span>
            )}
          </div>

          {existingUrl ? (
            <video
              src={existingUrl}
              controls
              preload="metadata"
              className="w-full rounded-lg bg-black"
            />
          ) : (
            <p className="text-xs text-white/40">
              The video file is no longer available. Upload a new one below.
            </p>
          )}

          {video.status === "REJECTED" && video.rejectionReason && (
            <div
              className="mt-3 rounded-lg border px-3 py-2.5"
              style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}
            >
              <p className="text-[10px] text-red-300/70 mb-1">WHAT OUR TEAM SAID</p>
              <p className="text-sm text-red-200">{video.rejectionReason}</p>
            </div>
          )}

          {underReview ? (
            <p className="mt-3 text-[11px] text-white/40">
              You can upload a replacement once this review is finished.
            </p>
          ) : (
            <button
              type="button"
              onClick={remove}
              disabled={removing}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {removing ? "Removing…" : "Remove this video"}
            </button>
          )}
        </div>
      )}

      {!underReview && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs font-medium text-white/80 mb-2">Video requirements</p>
          <ul className="space-y-1 text-[11px] text-white/55 mb-4">
            <li>· Length: {rules.minSeconds}–{rules.maxSeconds} seconds</li>
            <li>· Minimum resolution: {rules.minWidth}×{rules.minHeight}</li>
            <li>· Aspect ratio: 16:9 (landscape)</li>
            <li>· File size: up to {Math.round(rules.maxBytes / 1024 / 1024 / 1024)} GB</li>
          </ul>

          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            className="hidden"
            onChange={(e) => choose(e.target.files?.[0] ?? null)}
          />

          {previewUrl ? (
            <video
              src={previewUrl}
              controls
              preload="metadata"
              className="w-full rounded-lg bg-black mb-3"
            />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video rounded-lg border border-dashed border-white/15 grid place-items-center hover:border-white/30 transition-colors mb-3"
            >
              <div className="text-center">
                <Video className="w-6 h-6 mx-auto text-white/25" />
                <p className="text-[11px] text-white/40 mt-2">Click to choose a video</p>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/85 hover:border-white/30 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {picked ? "Choose a different file" : "Choose a video"}
          </button>

          {picked && (
            <p className="mt-2 text-[11px] text-white/40 truncate">
              {picked.name} · {formatBytes(picked.size)}
            </p>
          )}

          {checking && (
            <p className="mt-3 inline-flex items-center gap-2 text-[11px] text-white/50">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking your video…
            </p>
          )}

          {errors.length > 0 && (
            <ul className="mt-3 space-y-1">
              {errors.map((err) => (
                <li key={err} className="text-[12px] text-red-400">
                  {err}
                </li>
              ))}
            </ul>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full transition-all duration-200"
                  style={{ width: `${progress}%`, background: GRADIENT }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/45">Uploading… {progress}%</p>
            </div>
          )}

          <div
            className="mt-4 rounded-lg border px-3 py-2.5 flex gap-2.5"
            style={{ borderColor: "rgba(26,115,232,0.28)", background: "rgba(26,115,232,0.07)" }}
          >
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#7FB3F5" }} />
            <div>
              <p className="text-[11px] text-white font-medium">
                Your video will be manually reviewed for approval
              </p>
              <p className="text-[11px] text-white/50 mt-0.5">
                To speed up approval, make sure it features you or a team member.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            {picked && (
              <button
                type="button"
                onClick={reset}
                disabled={uploading}
                className="rounded-lg px-4 py-2 text-xs text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="rounded-lg px-4 py-2 text-xs font-medium text-white transition-opacity disabled:opacity-40"
              style={{ background: canSubmit ? GRADIENT : "#2A2A2E" }}
            >
              {uploading ? "Uploading…" : "Submit video"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════ the dialog ══════════════════════ */

export interface FreelancerSectionEditorProps {
  section: EditableSection | null;
  profile: FreelancerProfile;
  token: string;
  specGroups: SpecializationGroup[];
  onClose: () => void;
  /** Fires with the saved profile so the page can re-render without refetching. */
  onSaved: (profile: FreelancerProfile) => void;
  /** Intro video saves through its own endpoints, so it reports separately. */
  onVideoChange: (video: IntroVideo, strength?: ProfileStrength) => void;
}

// Local, fully-populated mirror of the fields this dialog can write, so inputs
// are never fighting undefined.
interface DraftState {
  displayName: string;
  professionalTitle: string;
  country: string;
  city: string;
  languages: ProfileLanguage[];
  about: string;
  skills: ProfileSkill[];
  specializationIds: string[];
  portfolioLinks: string[];
  workExperience: WorkExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  hourlyRate: string;
  availability: "full_time" | "part_time" | "occasional" | null;
}

const draftFrom = (p: FreelancerProfile): DraftState => ({
  displayName: p.displayName || "",
  professionalTitle: p.professionalTitle || "",
  country: p.country || "",
  city: p.city || "",
  languages: p.languages || [],
  about: p.about || "",
  skills: p.skills || [],
  specializationIds: (p.specializations || []).map((s) => s._id),
  portfolioLinks: p.portfolioLinks || [],
  workExperience: p.workExperience || [],
  education: p.education || [],
  certifications: p.certifications || [],
  hourlyRate: p.hourlyRate != null ? String(p.hourlyRate) : "",
  availability: p.availability,
});

export default function FreelancerSectionEditor({
  section,
  profile,
  token,
  specGroups,
  onClose,
  onSaved,
  onVideoChange,
}: FreelancerSectionEditorProps) {
  const [draft, setDraft] = useState<DraftState>(() => draftFrom(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seeded each time the dialog opens on a section, so it never shows edits
  // abandoned from a previous open.
  useEffect(() => {
    if (section) {
      setDraft(draftFrom(profile));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    if (!section) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // The page behind must not scroll while a dialog is over it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [section, onClose]);

  if (!section) return null;

  const patch = (p: Partial<DraftState>) => setDraft((prev) => ({ ...prev, ...p }));
  const meta = SECTION_META[section];

  // Only the fields this section owns. Sending the whole draft would let a stale
  // value from a section the user never opened overwrite a good one.
  const payloadFor = (id: EditableSection): ProfileDraft => {
    switch (id) {
      case "basics":
        return {
          displayName: draft.displayName.trim(),
          professionalTitle: draft.professionalTitle.trim(),
          country: draft.country.trim(),
          city: draft.city.trim(),
          languages: draft.languages.filter((l) => l.name.trim()),
        };
      case "about":
        return { about: draft.about.trim() };
      case "skills":
        return { skills: draft.skills.map((s) => ({ slug: s.slug, level: s.level })) };
      case "specializations":
        return { specializations: draft.specializationIds };
      case "portfolio":
        return { portfolioLinks: draft.portfolioLinks.map((l) => l.trim()).filter(Boolean) };
      case "experience":
        return { workExperience: draft.workExperience.filter((w) => w.title?.trim()) };
      case "education":
        return { education: draft.education.filter((e) => e.institution?.trim()) };
      case "certifications":
        return { certifications: draft.certifications.filter((c) => c.name?.trim()) };
      case "rate":
        return {
          hourlyRate: draft.hourlyRate ? Number(draft.hourlyRate) : null,
          availability: draft.availability,
        };
      default:
        return {};
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    const res = await saveFreelancerDraft(payloadFor(section), token);
    setSaving(false);

    if (!res.ok) {
      setError(res.message || "Couldn't save.");
      return;
    }

    onSaved(res.data.profile);
    toast({ title: "Saved" });
    onClose();
  };

  const aboutLength = draft.about.trim().length;

  const body = () => {
    switch (section) {
      case "basics":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Name buyers see *</label>
              <input
                className={inputClass}
                value={draft.displayName}
                onChange={(e) => patch({ displayName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Professional title *</label>
              <ProfessionalTitlePicker
                value={draft.professionalTitle}
                onChange={(professionalTitle) => patch({ professionalTitle })}
              />
            </div>
            <div>
              <label className={labelClass}>Country *</label>
              {/* Clears the city on a country change, same as the onboarding
                  wizard — this editor writes the same two fields, and the last
                  time logic here diverged from there the copies drifted. */}
              <CountryPicker
                value={draft.country}
                onChange={(country) =>
                  patch(country === draft.country ? { country } : { country, city: "" })
                }
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <CityPicker
                country={draft.country}
                value={draft.city}
                onChange={(city) => patch({ city })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Languages *</label>
              <LanguagesEditor
                languages={draft.languages}
                onChange={(languages) => patch({ languages })}
              />
            </div>
          </div>
        );

      case "about":
        return (
          <div>
            <textarea
              className={`${inputClass} min-h-[180px] resize-y`}
              value={draft.about}
              onChange={(e) => patch({ about: e.target.value.slice(0, ABOUT_MAX) })}
              placeholder="What you build, who you build it for, and what a buyer gets when they hire you."
            />
            {/* The same counter component as the onboarding wizard's About
                field — both screens edit this one field, and a hint that differs
                between them is how the two copies start drifting. */}
            <AboutCounter length={aboutLength} />
          </div>
        );

      case "skills":
        return (
          <SkillsPicker
            selected={draft.skills}
            onChange={(skills) => patch({ skills })}
            token={token}
          />
        );

      case "specializations":
        return (
          <SpecializationsPicker
            groups={specGroups}
            selectedIds={draft.specializationIds}
            onChange={(specializationIds) => patch({ specializationIds })}
          />
        );

      case "portfolio":
        return (
          <div>
            {draft.portfolioLinks.length === 0 && (
              <p className="text-[11px] text-white/35 mb-3">
                No links yet. Add a GitHub, Behance, Dribbble or personal site.
              </p>
            )}
            {draft.portfolioLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  className={inputClass}
                  value={link}
                  onChange={(e) =>
                    patch({
                      portfolioLinks: draft.portfolioLinks.map((l, i) =>
                        i === index ? e.target.value : l
                      ),
                    })
                  }
                  placeholder="https://github.com/you"
                />
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      portfolioLinks: draft.portfolioLinks.filter((_, i) => i !== index),
                    })
                  }
                  className="text-white/40 hover:text-red-400 transition-colors shrink-0"
                  aria-label="Remove link"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {draft.portfolioLinks.length < 10 && (
              <button
                type="button"
                onClick={() => patch({ portfolioLinks: [...draft.portfolioLinks, ""] })}
                className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add a link
              </button>
            )}
          </div>
        );

      case "intro_video":
        return (
          <IntroVideoEditor
            video={profile.introVideo}
            rules={profile.videoRules}
            token={token}
            onChange={onVideoChange}
          />
        );

      case "experience":
        return (
          <RepeatableRows<WorkExperienceEntry>
            items={draft.workExperience}
            onChange={(workExperience) => patch({ workExperience })}
            blank={() => ({
              title: "",
              company: "",
              from: null,
              to: null,
              current: false,
              description: "",
            })}
            addLabel="Add work experience"
            emptyHint="Nothing added yet."
            renderRow={(item, update) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-6">
                <input
                  className={inputClass}
                  value={item.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Job title"
                />
                <input
                  className={inputClass}
                  value={item.company || ""}
                  onChange={(e) => update({ company: e.target.value })}
                  placeholder="Company"
                />
                {/* Both dates used to share ONE grid cell, so each got a quarter
                    of the dialog — narrower than a month field can render — and
                    the second one spilled over the checkbox beside it. They now
                    take a cell each, and the checkbox gets its own line. */}
                <DateField
                  label="From"
                  value={item.from || ""}
                  onChange={(e) => update({ from: e.target.value || null })}
                />
                <DateField
                  label="To"
                  value={item.to || ""}
                  onChange={(e) => update({ to: e.target.value || null })}
                  disabled={!!item.current}
                />
                <label className="sm:col-span-2 flex items-center gap-2 text-xs text-white/70 select-none">
                  <input
                    type="checkbox"
                    checked={!!item.current}
                    // Clearing `to` keeps "current role" and an end date from both
                    // being set, which reads as a contradiction on the profile.
                    onChange={(e) =>
                      update({
                        current: e.target.checked,
                        ...(e.target.checked ? { to: null } : {}),
                      })
                    }
                    className="accent-[#1A73E8]"
                  />
                  I currently work here
                </label>
                <textarea
                  className={`${inputClass} sm:col-span-2 min-h-[60px] resize-y`}
                  value={item.description || ""}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="What you were responsible for (optional)"
                />
              </div>
            )}
          />
        );

      case "education":
        return (
          <RepeatableRows<EducationEntry>
            items={draft.education}
            onChange={(education) => patch({ education })}
            blank={() => ({
              institution: "",
              degree: "",
              fieldOfStudy: "",
              from: null,
              to: null,
            })}
            addLabel="Add education"
            max={10}
            emptyHint="Nothing added yet."
            renderRow={(item, update) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-6">
                <input
                  className={inputClass}
                  value={item.institution}
                  onChange={(e) => update({ institution: e.target.value })}
                  placeholder="Institution"
                />
                <input
                  className={inputClass}
                  value={item.degree || ""}
                  onChange={(e) => update({ degree: e.target.value })}
                  placeholder="Degree, e.g. B.Tech"
                />
                <input
                  className={inputClass}
                  value={item.fieldOfStudy || ""}
                  onChange={(e) => update({ fieldOfStudy: e.target.value })}
                  placeholder="Field of study"
                />
                <DateField
                  label="From"
                  value={item.from || ""}
                  onChange={(e) => update({ from: e.target.value || null })}
                />
                <DateField
                  label="To"
                  value={item.to || ""}
                  onChange={(e) => update({ to: e.target.value || null })}
                />
              </div>
            )}
          />
        );

      case "certifications":
        return (
          <RepeatableRows<CertificationEntry>
            items={draft.certifications}
            onChange={(certifications) => patch({ certifications })}
            blank={() => ({ name: "", issuer: "", issuedAt: null, url: "" })}
            addLabel="Add certification"
            emptyHint="Nothing added yet."
            renderRow={(item, update) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-6">
                <input
                  className={inputClass}
                  value={item.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Certification name"
                />
                <input
                  className={inputClass}
                  value={item.issuer || ""}
                  onChange={(e) => update({ issuer: e.target.value })}
                  placeholder="Issued by"
                />
                <DateField
                  label="Issued"
                  value={item.issuedAt || ""}
                  onChange={(e) => update({ issuedAt: e.target.value || null })}
                />
                <input
                  className={inputClass}
                  value={item.url || ""}
                  onChange={(e) => update({ url: e.target.value })}
                  placeholder="Verification link (optional)"
                />
              </div>
            )}
          />
        );

      case "rate":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Indicative hourly rate (₹)</label>
              <input
                className={inputClass}
                value={draft.hourlyRate}
                onChange={(e) =>
                  patch({ hourlyRate: e.target.value.replace(/\D/g, "").slice(0, 7) })
                }
                inputMode="numeric"
                placeholder="1500"
              />
            </div>
            <div>
              <label className={labelClass}>Availability</label>
              <select
                className={inputClass}
                value={draft.availability || ""}
                onChange={(e) => patch({ availability: (e.target.value || null) as any })}
              >
                <option value="" className="bg-[#0B0F17]">
                  Not specified
                </option>
                {AVAILABILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#0B0F17]">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // The video section saves through its own upload endpoints, so a Save button
  // here would do nothing.
  const showSaveBar = section !== "intro_video";

  return (
    <div className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm overflow-hidden">
      <div className="h-full w-full flex items-center justify-center p-0 sm:p-4">
        {/* Full-screen sheet on a phone, centred card from `sm` up — the same
            change, for the same reason, as the dialog in
            components/BecomeFreelancerWizard.tsx, which carries the long
            version of this note.

            Short version: the overlay is capped to the dynamic viewport, and on
            Android the keyboard is part of that. A card sized to hug its content
            and floating in the middle visibly collapsed to a third of its height
            the moment someone tapped into a field — and "About you" is one of
            the sections this editor opens. A sheet that already fills the screen
            has nothing to collapse from; the keyboard just takes the bottom of
            it, which is what a keyboard is supposed to do.

            The dvh cap itself is correct and stays: with vh the save bar would
            end up behind the keyboard, unreachable. */}
        <div
          className="relative w-full h-full max-w-none rounded-none sm:h-auto sm:max-w-[640px] sm:rounded-[20px] sm:max-h-[calc(100dvh-24px)] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
          style={{
            background:
              "radial-gradient(900px circle at 50% 0%, rgba(255,20,239,0.10), transparent 55%), linear-gradient(180deg,#0B0C10 0%, #08090B 100%)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label={meta.title}
        >
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-white/8 shrink-0">
            <div className="min-w-0">
              <h3 className="text-white text-lg font-semibold">{meta.title}</h3>
              <p className="text-white/45 text-xs mt-0.5">{meta.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 overflow-y-auto">{body()}</div>

          {error && (
            <div className="px-6 pb-2">
              <div
                className="rounded-lg border px-3 py-2.5"
                style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}
              >
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            </div>
          )}

          {showSaveBar && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/8 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
