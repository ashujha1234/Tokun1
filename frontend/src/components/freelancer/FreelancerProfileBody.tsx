import { useMemo } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Camera,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  GraduationCap,
  Languages as LanguagesIcon,
  Pencil,
  Plus,
  ScrollText,
  Trophy,
  Video,
  Wallet,
} from "lucide-react";
import { freelancerMediaUrl, type ProfileStrength } from "@/lib/freelancerApi";
import {
  VIDEO_STATUS_META,
  type EditableSection,
} from "@/components/freelancer/FreelancerSectionEditor";

/*
 * The freelancer half of a profile page, for both viewers and the owner.
 *
 * One component for both on purpose: a profile that looks materially different
 * to its owner is a profile whose owner can't tell what buyers actually see. The
 * owner gets Edit affordances and empty-state prompts layered on the same
 * markup, not a separate screen.
 *
 * Nothing here is admin-gated except the intro video, which only appears to
 * viewers once approved (the public API returns no URL until then).
 */

const GRADIENT = "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)";

/** The overlap between FreelancerProfile and PublicFreelancerProfile. */
export interface FreelancerBodyProfile {
  displayName?: string;
  professionalTitle?: string;
  about?: string;
  country?: string;
  city?: string;
  languages?: { name: string; level: string }[];
  skills?: { name: string; slug: string; level: string }[];
  specializations?: { _id: string; name: string; group?: string }[];
  workExperience?: {
    title: string;
    company?: string;
    from?: string | null;
    to?: string | null;
    current?: boolean;
    description?: string;
  }[];
  education?: {
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    from?: string | null;
    to?: string | null;
  }[];
  certifications?: { name: string; issuer?: string; issuedAt?: string | null; url?: string }[];
  portfolioLinks?: string[];
  introVideo?: {
    status: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
    url: string | null;
    durationSeconds?: number | null;
    rejectionReason?: string | null;
  };
  hourlyRate?: number | null;
  availability?: "full_time" | "part_time" | "occasional" | null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2023-04" → "Apr 2023". Parsed by hand rather than through Date, because the
// value is a month with no day and Date would invent one, then shift it in
// another timezone.
export const formatMonth = (v?: string | null) => {
  if (!v || !/^\d{4}-\d{2}$/.test(v)) return "";
  const [year, month] = v.split("-");
  return `${MONTHS[Number(month) - 1] || month} ${year}`;
};

export const monthRange = (from?: string | null, to?: string | null, current?: boolean) => {
  const start = formatMonth(from);
  const end = current ? "Present" : formatMonth(to);
  if (!start && !end) return "";
  return [start || "?", end || "?"].join(" – ");
};

const SKILL_LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const AVAILABILITY_LABEL: Record<string, string> = {
  full_time: "Available full-time",
  part_time: "Available part-time",
  occasional: "Available occasionally",
};

const CARD = "rounded-2xl border border-white/10 bg-[#101012]";

/* ══════════════════════ section shell ══════════════════════ */

function Card({
  icon,
  title,
  section,
  isOwn,
  onEdit,
  isEmpty,
  emptyPrompt,
  children,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  section?: EditableSection;
  isOwn: boolean;
  onEdit?: (section: EditableSection) => void;
  isEmpty?: boolean;
  emptyPrompt?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  // A section with nothing in it is hidden from viewers rather than shown as an
  // empty box — but the owner still sees it, as a prompt to fill it in.
  if (isEmpty && !isOwn) return null;

  const canEdit = isOwn && section && onEdit;

  return (
    <section className={`${CARD} p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-white/40 shrink-0">{icon}</span>
          <h2 className="text-white font-semibold text-[15px] truncate">{title}</h2>
        </div>

        {action}

        {canEdit && !action && (
          <button
            type="button"
            onClick={() => onEdit!(section!)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-2.5 py-1.5 text-[11px] text-white/70 hover:text-white hover:border-white/30 transition-colors shrink-0"
          >
            {isEmpty ? <Plus className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
            {isEmpty ? "Add" : "Edit"}
          </button>
        )}
      </div>

      {isEmpty ? (
        <button
          type="button"
          onClick={() => canEdit && onEdit!(section!)}
          className="w-full text-left rounded-xl border border-dashed border-white/12 px-4 py-5 hover:border-white/25 transition-colors"
        >
          <p className="text-sm text-white/45">{emptyPrompt}</p>
        </button>
      ) : (
        children
      )}
    </section>
  );
}

const Chip = ({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent";
}) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
    style={
      tone === "accent"
        ? {
            background: "rgba(26,115,232,0.15)",
            border: "1px solid rgba(26,115,232,0.32)",
            color: "#fff",
          }
        : {
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.85)",
          }
    }
  >
    {children}
  </span>
);

/* ══════════════════════ profile strength ══════════════════════ */

/**
 * "Profile Strength X/12" — owner only.
 *
 * Each incomplete row opens that section's editor as a dialog. It deliberately
 * does NOT scroll the page to a section: doing that made every click jump the
 * viewport somewhere else, and after the jump it wasn't clear which section had
 * opened or where its upload control was.
 */
export function ProfileStrengthCard({
  strength,
  onOpenSection,
  onFocusPhoto,
}: {
  strength: ProfileStrength;
  onOpenSection: (section: EditableSection) => void;
  onFocusPhoto: () => void;
}) {
  const missing = useMemo(() => strength.items.filter((i) => !i.done), [strength.items]);
  const done = useMemo(() => strength.items.filter((i) => i.done), [strength.items]);

  const activate = (key: string) => {
    // The avatar control lives in the profile header, so this row highlights it
    // there rather than opening a dialog for a file the header already handles.
    if (key === "photo") {
      onFocusPhoto();
      return;
    }
    const section = (
      {
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
      } as Record<string, EditableSection>
    )[key];
    if (section) onOpenSection(section);
  };

  const pct = strength.total ? (strength.score / strength.total) * 100 : 0;

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <h2 className="text-white font-semibold text-[15px]">Profile Strength</h2>
        <span className="text-white font-bold text-lg">
          {strength.score}
          <span className="text-white/35 text-sm font-normal">/{strength.total}</span>
        </span>
      </div>
      <p className="text-white/45 text-xs mb-4">
        A stronger profile gets seen by more buyers.
      </p>

      <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden mb-5">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: GRADIENT }}
        />
      </div>

      {missing.length === 0 ? (
        <div
          className="rounded-xl border px-3 py-4 text-center"
          style={{ borderColor: "rgba(25,230,108,0.3)", background: "rgba(25,230,108,0.07)" }}
        >
          <Check className="w-4 h-4 mx-auto mb-1.5" style={{ color: "#19E66C" }} />
          <p className="text-xs text-white">Your profile is complete.</p>
        </div>
      ) : (
        <>
          <p className="text-[10px] uppercase tracking-wide text-white/35 mb-2.5">Still to add</p>
          <div className="space-y-2">
            {missing.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => activate(item.key)}
                className="w-full flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left hover:border-white/25 hover:bg-white/[0.05] transition-all group"
              >
                <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-xs text-white truncate">{item.label}</span>
                  {item.required && (
                    <span className="block text-[10px] text-amber-400/70">Required</span>
                  )}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-white/25 group-hover:text-white/60 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-wide text-white/25 mt-5 mb-2">Done</p>
          <div className="space-y-1.5">
            {done.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => activate(item.key)}
                className="w-full flex items-center gap-2.5 px-1 py-1 text-left group"
              >
                <span
                  className="w-4 h-4 rounded-full grid place-items-center shrink-0"
                  style={{ background: "rgba(25,230,108,0.18)" }}
                >
                  <Check className="w-2.5 h-2.5" style={{ color: "#19E66C" }} />
                </span>
                <span className="flex-1 text-[11px] text-white/45 truncate group-hover:text-white/70 transition-colors">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════ the body ══════════════════════ */

export default function FreelancerProfileBody({
  profile,
  isOwn,
  onEdit,
}: {
  profile: FreelancerBodyProfile;
  isOwn: boolean;
  onEdit?: (section: EditableSection) => void;
}) {
  const video = profile.introVideo;
  const videoUrl = freelancerMediaUrl(video?.url);
  const videoMeta = video ? VIDEO_STATUS_META[video.status] : null;

  return (
    <div className="space-y-5">
      {/* ── About ── */}
      <Card
        icon={<ScrollText className="w-4 h-4" />}
        title="About"
        section="about"
        isOwn={isOwn}
        onEdit={onEdit}
        isEmpty={!profile.about?.trim()}
        emptyPrompt="Tell buyers what you do and who you do it for. This is the first thing they read."
      >
        <p className="text-white/70 text-sm whitespace-pre-line leading-relaxed">
          {profile.about}
        </p>
      </Card>

      {/* ── Specializations ── */}
      <Card
        icon={<Briefcase className="w-4 h-4" />}
        title="Specializations"
        section="specializations"
        isOwn={isOwn}
        onEdit={onEdit}
        isEmpty={!profile.specializations?.length}
        emptyPrompt="Pick what you sell — most freelancers do more than one thing."
      >
        <div className="flex flex-wrap gap-2">
          {profile.specializations?.map((spec) => (
            <Chip key={spec._id} tone="accent">
              {spec.name}
            </Chip>
          ))}
        </div>
      </Card>

      {/* ── Skills ── */}
      <Card
        icon={<Trophy className="w-4 h-4" />}
        title="Skills and expertise"
        section="skills"
        isOwn={isOwn}
        onEdit={onEdit}
        isEmpty={!profile.skills?.length}
        emptyPrompt="Add the skills you want to be found for. Buyers filter by these."
      >
        <div className="flex flex-wrap gap-2">
          {profile.skills?.map((skill) => (
            <Chip key={skill.slug}>
              {skill.name}
              <span className="text-white/40">
                {SKILL_LEVEL_LABEL[skill.level] ? ` · ${SKILL_LEVEL_LABEL[skill.level]}` : ""}
              </span>
            </Chip>
          ))}
        </div>
      </Card>

      {/* ── Intro video ──
          Viewers only ever see an approved one; the public API withholds the URL
          until then. The owner also sees the review state, since it's the only
          thing on their profile that waits on someone else. */}
      <Card
        icon={<Video className="w-4 h-4" />}
        title="Intro video"
        section="intro_video"
        isOwn={isOwn}
        onEdit={onEdit}
        isEmpty={!videoUrl && !(isOwn && video && video.status !== "NONE")}
        emptyPrompt="Record a 20–60 second intro. Profiles with a video get more replies."
        action={
          isOwn && video && video.status !== "NONE" && videoMeta ? (
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: `${videoMeta.tint}1F`, color: videoMeta.tint }}
              >
                {videoMeta.icon}
                {videoMeta.label}
              </span>
              <button
                type="button"
                onClick={() => onEdit?.("intro_video")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-2.5 py-1.5 text-[11px] text-white/70 hover:text-white hover:border-white/30 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Manage
              </button>
            </div>
          ) : undefined
        }
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            preload="metadata"
            className="w-full max-w-[560px] rounded-xl bg-black border border-white/10"
          />
        ) : (
          isOwn &&
          video && (
            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-4">
              <p className="text-sm text-white/60">
                {video.status === "PENDING"
                  ? "Your video is with our team for review. You'll get a notification when it's decided."
                  : video.status === "REJECTED"
                  ? "Your video wasn't approved."
                  : "No video yet."}
              </p>
              {video.status === "REJECTED" && video.rejectionReason && (
                <div
                  className="mt-3 rounded-lg border px-3 py-2.5"
                  style={{
                    borderColor: "rgba(239,68,68,0.35)",
                    background: "rgba(239,68,68,0.08)",
                  }}
                >
                  <p className="text-[10px] text-red-300/70 mb-1">WHAT OUR TEAM SAID</p>
                  <p className="text-sm text-red-200">{video.rejectionReason}</p>
                </div>
              )}
            </div>
          )
        )}
      </Card>

      {/* ── Work experience ── */}
      <Card
        icon={<Briefcase className="w-4 h-4" />}
        title="Work experience"
        section="experience"
        isOwn={isOwn}
        onEdit={onEdit}
        isEmpty={!profile.workExperience?.length}
        emptyPrompt="Add where you've worked. Clients use this to judge depth."
      >
        <div className="space-y-4">
          {profile.workExperience?.map((job, i) => (
            <div key={i} className="relative pl-4 border-l border-white/10">
              <span
                className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full -translate-x-[3.5px]"
                style={{ background: "#1A73E8" }}
              />
              <p className="text-white text-sm font-medium">
                {job.title}
                {job.company && <span className="text-white/50 font-normal"> · {job.company}</span>}
              </p>
              <p className="text-white/35 text-[11px] mt-0.5">
                {monthRange(job.from, job.to, job.current)}
              </p>
              {job.description && (
                <p className="text-white/55 text-xs mt-1.5 whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Education ── */}
      <Card
        icon={<GraduationCap className="w-4 h-4" />}
        title="Education"
        section="education"
        isOwn={isOwn}
        onEdit={onEdit}
        isEmpty={!profile.education?.length}
        emptyPrompt="Add degrees or programmes that back up your skills."
      >
        <div className="space-y-3">
          {profile.education?.map((edu, i) => (
            <div key={i}>
              <p className="text-white text-sm">
                {edu.degree ? `${edu.degree}, ` : ""}
                {edu.institution}
              </p>
              <p className="text-white/35 text-[11px] mt-0.5">
                {[edu.fieldOfStudy, monthRange(edu.from, edu.to)].filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Certifications ── */}
      <Card
        icon={<BadgeCheck className="w-4 h-4" />}
        title="Certifications"
        section="certifications"
        isOwn={isOwn}
        onEdit={onEdit}
        isEmpty={!profile.certifications?.length}
        emptyPrompt="Add credentials that prove what you claim."
      >
        <div className="space-y-3">
          {profile.certifications?.map((cert, i) => (
            <div key={i}>
              <p className="text-white text-sm">
                {cert.url ? (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 hover:underline"
                  >
                    {cert.name}
                    <ExternalLink className="w-3 h-3 text-white/40" />
                  </a>
                ) : (
                  cert.name
                )}
              </p>
              <p className="text-white/35 text-[11px] mt-0.5">
                {[cert.issuer, formatMonth(cert.issuedAt)].filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Portfolio ── */}
      <Card
        icon={<Camera className="w-4 h-4" />}
        title="Portfolio"
        section="portfolio"
        isOwn={isOwn}
        onEdit={onEdit}
        isEmpty={!profile.portfolioLinks?.length}
        emptyPrompt="Link the work you want clients to see first."
      >
        <div className="flex flex-wrap gap-2">
          {profile.portfolioLinks?.map((link) => (
            <a
              key={link}
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-sky-300 bg-white/[0.05] border border-white/10 hover:border-white/25 transition-colors max-w-[300px]"
            >
              <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="w-3 h-3 shrink-0 text-white/35" />
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════ sidebar summary ══════════════════════ */

/** Languages, rate and availability — the at-a-glance facts, for the sidebar. */
export function FreelancerFactsCard({
  profile,
  isOwn,
  onEdit,
}: {
  profile: FreelancerBodyProfile;
  isOwn: boolean;
  onEdit?: (section: EditableSection) => void;
}) {
  const hasFacts =
    !!profile.languages?.length || profile.hourlyRate != null || !!profile.availability;

  if (!hasFacts && !isOwn) return null;

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-white font-semibold text-[15px]">At a glance</h2>
        {isOwn && onEdit && (
          <button
            type="button"
            onClick={() => onEdit("rate")}
            className="text-[11px] text-white/50 hover:text-white transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {profile.hourlyRate != null && (
          <div className="flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-white/35 shrink-0" />
            <span className="text-sm text-white">
              ₹{profile.hourlyRate}
              <span className="text-white/45 text-xs"> /hour</span>
            </span>
          </div>
        )}

        {profile.availability && (
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-white/35 shrink-0" />
            <span className="text-sm text-white/80">
              {AVAILABILITY_LABEL[profile.availability]}
            </span>
          </div>
        )}

        {!!profile.languages?.length && (
          <div className="flex items-start gap-2.5">
            <LanguagesIcon className="w-4 h-4 text-white/35 shrink-0 mt-0.5" />
            <div className="min-w-0">
              {profile.languages.map((lang) => (
                <p key={lang.name} className="text-sm text-white/80">
                  {lang.name}
                  <span className="text-white/40 text-xs"> · {lang.level}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {!hasFacts && isOwn && (
          <button
            type="button"
            onClick={() => onEdit?.("rate")}
            className="w-full text-left text-xs text-white/45 hover:text-white/70 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add your rate and availability
          </button>
        )}
      </div>
    </div>
  );
}

/** Compact "you haven't finished setting up" nudge for a DRAFT profile. */
export function DraftNoticeCard({
  errors,
  onPublish,
  publishing,
}: {
  errors: string[];
  onPublish: () => void;
  publishing: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "rgba(245,158,11,0.32)", background: "rgba(245,158,11,0.06)" }}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#F59E0B" }} />
        <div>
          <p className="text-sm text-white font-medium">
            Your freelancer profile isn't visible yet
          </p>
          <p className="text-[11px] text-white/55 mt-0.5">
            Finish these and it goes live immediately — nothing waits on approval.
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 mb-4 pl-1">
          {errors.map((err) => (
            <li key={err} className="text-[11px] text-amber-200/75">
              · {err}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onPublish}
        disabled={publishing || errors.length > 0}
        className="rounded-lg px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
        style={{ background: GRADIENT }}
      >
        {publishing ? "Publishing…" : "Publish my profile"}
      </button>
    </div>
  );
}
