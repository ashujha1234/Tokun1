import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, ChevronLeft, Loader2, X } from "lucide-react";
import {
  CountryPicker,
  LanguagesEditor,
  RepeatableRows,
  SkillsPicker,
  SpecializationsPicker,
  inputClass,
  labelClass,
} from "@/components/freelancer/pickers";
import {
  getMyFreelancerProfile,
  saveFreelancerDraft,
  activateFreelancerProfile,
  getSpecializations,
  type CertificationEntry,
  type EducationEntry,
  type FreelancerProfile,
  type ProfileDraft,
  type ProfileLanguage,
  type ProfileSkill,
  type Specialization,
  type SpecializationGroup,
  type WorkExperienceEntry,
} from "@/lib/freelancerApi";

/*
 * Onboarding for a new freelancer.
 *
 * Sequence: who you are → skills → specializations → credentials → done.
 *
 * Three deliberate choices:
 *
 *  - NO ADMIN REVIEW. Finishing this puts the profile live immediately, and the
 *    freelancer lands back on their own profile page. Only the intro video is
 *    approved by an admin, and only the video.
 *
 *  - Credentials (experience / education / certifications) are ASKED HERE, even
 *    though they're optional, because someone filling in a profile is already in
 *    the mood to type — coming back for them later is a second decision most
 *    people never make. Skipping is one click, and anything skipped shows up on
 *    the profile page's Profile Strength list instead.
 *
 *  - NO BANK DETAILS. Asking for a payout account before anyone has agreed to
 *    pay this person is friction with nothing behind it. The Razorpay linked
 *    account is collected once, later, by whichever flow needs it first —
 *    freelancing or prompt selling — and satisfies both.
 *
 * The resume point is DERIVED from the saved data rather than a stored step
 * number: a counter drifts the moment a step's rules change or a save half-fails.
 */

const GRADIENT = "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)";
const ACCENT = "#1A73E8";
const ABOUT_MIN = 80;
const ABOUT_MAX = 3000;

type StepId = "basics" | "skills" | "specializations" | "credentials" | "review";

// Fixed order. The "Are you part of a team?" step that used to lead this list has
// been removed; FreelancerProfile still carries the team fields so it can return
// without a migration.
const STEPS: StepId[] = ["basics", "skills", "specializations", "credentials", "review"];

const STEP_TITLES: Record<StepId, string> = {
  basics: "Set up your Super Creator profile",
  skills: "What are your skills?",
  specializations: "What do you specialize in?",
  credentials: "Experience, education & certifications",
  review: "Ready to go live",
};

const STEP_SUBTITLES: Record<StepId, string> = {
  basics: "This is the first thing a buyer reads about you.",
  skills: "Start typing — pick from the list so buyers searching that skill can find you.",
  specializations: "Pick everything that applies. Most freelancers do more than one thing.",
  credentials:
    "All optional, but profiles with these get hired noticeably more often. You can add them later from your profile.",
  review: "Your profile goes live straight away. You can add more to it any time.",
};

/* ────────────────────── local form state ────────────────────── */

interface FormState {
  displayName: string;
  professionalTitle: string;
  about: string;
  country: string;
  city: string;
  languages: ProfileLanguage[];
  skills: ProfileSkill[];
  specializationIds: string[];
  workExperience: WorkExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
}

const EMPTY_FORM: FormState = {
  displayName: "",
  professionalTitle: "",
  about: "",
  country: "",
  city: "",
  languages: [],
  skills: [],
  specializationIds: [],
  workExperience: [],
  education: [],
  certifications: [],
};

const formFromProfile = (p: FreelancerProfile): FormState => ({
  displayName: p.displayName || "",
  professionalTitle: p.professionalTitle || "",
  about: p.about || "",
  country: p.country || "",
  city: p.city || "",
  languages: p.languages || [],
  skills: p.skills || [],
  specializationIds: (p.specializations || []).map((s) => s._id),
  workExperience: p.workExperience || [],
  education: p.education || [],
  certifications: p.certifications || [],
});

/* ────────────────────── per-step validation ──────────────────────
   The same rules the server enforces in FreelancerProfile.completenessErrors,
   split per step so a blocked Continue can point at what's blocking it. The
   server stays authoritative — this only decides which button is greyed. */

const stepErrors = (step: StepId, f: FormState): string[] => {
  switch (step) {
    case "basics": {
      const errs: string[] = [];
      if (!f.displayName.trim()) errs.push("Add the name buyers will see.");
      if (!f.professionalTitle.trim()) errs.push("Add a professional title.");
      if (f.about.trim().length < ABOUT_MIN) {
        errs.push(`Write at least ${ABOUT_MIN} characters about yourself.`);
      }
      if (!f.country.trim()) errs.push("Add the country you work from.");
      if (!f.languages.length) errs.push("Add at least one language.");
      return errs;
    }
    case "skills":
      return f.skills.length ? [] : ["Add at least one skill."];
    case "specializations":
      return f.specializationIds.length ? [] : ["Pick at least one specialization."];
    // "credentials" is optional by design — never blocks.
    default:
      return [];
  }
};

const Field = ({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className={labelClass}>{label}</label>
    {children}
    {hint && <p className="text-[11px] text-white/35 mt-1">{hint}</p>}
  </div>
);

/* ══════════════════════ the wizard ══════════════════════ */

export interface BecomeFreelancerWizardProps {
  open: boolean;
  onClose: () => void;
  token: string;
  /** Prefills the display name for a brand-new profile. */
  defaultName?: string;
  /**
   * A profile the caller has already fetched (the account menu does, to label
   * its row). Supplying it lets the wizard render its first step immediately
   * instead of showing a spinner while it re-requests the same document.
   * `null` means "already checked, this user has no profile" — also actionable,
   * and distinct from `undefined`, which means "unknown, go and look".
   */
  initialProfile?: FreelancerProfile | null;
  /** Fires whenever the profile's status changes, so a menu label can follow. */
  onStatusChange?: (status: FreelancerProfile["status"] | null) => void;
  /** Called once the profile is live, so the host can refresh or navigate. */
  onActivated?: () => void;
}

type Phase = "loading" | "wizard" | "live" | "blocked";

export default function BecomeFreelancerWizard({
  open,
  onClose,
  token,
  defaultName,
  initialProfile,
  onStatusChange,
  onActivated,
}: BecomeFreelancerWizardProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [blockedMessage, setBlockedMessage] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [step, setStep] = useState<StepId>("basics");
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  // Errors stay hidden until Continue is pressed, so a half-typed field isn't
  // scolded while it's being typed into.
  const [showErrors, setShowErrors] = useState(false);

  const [specGroups, setSpecGroups] = useState<SpecializationGroup[]>([]);
  const [specById, setSpecById] = useState<Map<string, Specialization>>(new Map());

  const patch = useCallback((p: Partial<FormState>) => setForm((prev) => ({ ...prev, ...p })), []);

  const stepIndex = Math.max(STEPS.indexOf(step), 0);
  const currentErrors = stepErrors(step, form);
  const blocking = currentErrors.length > 0;

  /* Sets the form up from a profile (or the absence of one). Shared by the
     seeded path and the fetched path so both land on the same step for the same
     data — a second copy of this is exactly how a resume point starts drifting. */
  const applyProfile = useCallback(
    (loaded: FreelancerProfile | null) => {
      onStatusChange?.(loaded?.status ?? null);

      if (!loaded) {
        setForm({ ...EMPTY_FORM, displayName: defaultName || "" });
        setStep("basics");
        setPhase("wizard");
        return;
      }

      const loadedForm = formFromProfile(loaded);
      setForm(loadedForm);

      // An already-live profile has nothing to onboard — it's edited from the
      // profile page from here on.
      if (loaded.status === "ACTIVE") {
        setPhase("live");
        return;
      }

      // Resume at the first step that still isn't valid.
      const firstIncomplete = STEPS.find((st) => stepErrors(st, loadedForm).length > 0);
      setStep(firstIncomplete ?? "review");
      setPhase("wizard");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultName]
  );

  /* ── load profile + specialization catalog ── */
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setBanner(null);
    setServerErrors([]);
    setShowErrors(false);

    // `undefined` means the caller hasn't looked yet, so there's nothing to show
    // but a spinner. `null` is an answer — this user has no profile — and lets
    // step one render at once.
    const seeded = initialProfile !== undefined;

    if (seeded) {
      applyProfile(initialProfile ?? null);
    } else {
      setPhase("loading");
    }

    // Fired alongside the profile fetch, not after it — the catalog is only
    // needed by the third step, so it has plenty of time to land. Served from
    // the client-side cache when the account menu already warmed it.
    getSpecializations(token).then((res) => {
      if (cancelled || !res.ok) return;
      setSpecGroups(res.data.grouped || []);
      setSpecById(new Map((res.data.specializations || []).map((s) => [s._id, s])));
    });

    (async () => {
      const res = await getMyFreelancerProfile(token);
      if (cancelled) return;

      // Revalidation behind an already-rendered form. A failure here is not
      // worth interrupting someone mid-typing over — what's on screen came from
      // the same endpoint moments ago, and the next save will surface any real
      // problem.
      if (!res.ok) {
        if (!seeded) {
          setBanner(res.message);
          setPhase("wizard");
        }
        return;
      }

      if (res.data.eligible === false) {
        setBlockedMessage(res.data.message || "This account can't create a Super Creator profile.");
        setPhase("blocked");
        return;
      }

      // Only re-seeds the form when the wizard wasn't already showing one. A
      // seeded wizard the user has started typing into must not have its fields
      // replaced by a response that arrived afterwards.
      if (!seeded) applyProfile(res.data.profile);
      else onStatusChange?.(res.data.profile?.status ?? null);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token]);

  /* ── persistence ── */

  // Only the fields the step being left owns. Sending the whole form on every
  // step would let a stale value from an untouched step overwrite a good one.
  const draftForStep = (id: StepId): ProfileDraft => {
    switch (id) {
      case "basics":
        return {
          displayName: form.displayName.trim(),
          professionalTitle: form.professionalTitle.trim(),
          about: form.about.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          languages: form.languages.filter((l) => l.name.trim()),
        };
      case "skills":
        return { skills: form.skills.map((s) => ({ slug: s.slug, level: s.level })) };
      case "specializations":
        return { specializations: form.specializationIds };
      case "credentials":
        return {
          workExperience: form.workExperience.filter((w) => w.title.trim()),
          education: form.education.filter((e) => e.institution.trim()),
          certifications: form.certifications.filter((c) => c.name.trim()),
        };
      default:
        return {};
    }
  };

  const persist = async (id: StepId): Promise<boolean> => {
    setSaving(true);
    setBanner(null);
    const res = await saveFreelancerDraft(draftForStep(id), token);
    setSaving(false);

    if (!res.ok) {
      setBanner(res.message);
      return false;
    }

    onStatusChange?.(res.data.profile.status);
    return true;
  };

  const goNext = async () => {
    if (blocking) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (!(await persist(step))) return;

    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    setShowErrors(false);
    setBanner(null);
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const handleActivate = async () => {
    setActivating(true);
    setBanner(null);
    setServerErrors([]);

    // The credentials step can be walked past without pressing Continue, so its
    // values are flushed before activating.
    if (!(await persist("credentials"))) {
      setActivating(false);
      return;
    }

    const res = await activateFreelancerProfile(token);
    setActivating(false);

    if (!res.ok) {
      setBanner(res.message);
      setServerErrors(res.errors || []);
      return;
    }

    onStatusChange?.(res.data.profile.status);
    setPhase("live");
  };

  if (!open) return null;

  const selectedSpecs = form.specializationIds
    .map((id) => specById.get(id))
    .filter(Boolean) as Specialization[];

  const credentialCount =
    form.workExperience.filter((w) => w.title.trim()).length +
    form.education.filter((e) => e.institution.trim()).length +
    form.certifications.filter((c) => c.name.trim()).length;

  /* ────────────────────── step bodies ────────────────────── */

  const renderBasicsStep = () => {
    const aboutLength = form.about.trim().length;
    const aboutShort = aboutLength > 0 && aboutLength < ABOUT_MIN;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Your name *">
          <input
            className={inputClass}
            value={form.displayName}
            onChange={(e) => patch({ displayName: e.target.value })}
            placeholder="Ashutosh Jha"
          />
        </Field>

        <Field label="Professional title *" hint="One line. This sits under your name.">
          <input
            className={inputClass}
            value={form.professionalTitle}
            onChange={(e) => patch({ professionalTitle: e.target.value })}
            placeholder="Full-stack developer"
          />
        </Field>

        <div className="sm:col-span-2">
          <label className={labelClass}>About you *</label>
          <textarea
            className={`${inputClass} min-h-[120px] resize-y`}
            value={form.about}
            onChange={(e) => patch({ about: e.target.value.slice(0, ABOUT_MAX) })}
            placeholder="What you build, who you build it for, and what a buyer gets when they hire you."
          />
          <div className="flex items-center justify-between mt-1">
            <p className={`text-[11px] ${aboutShort ? "text-amber-400/80" : "text-white/35"}`}>
              {aboutShort
                ? `${ABOUT_MIN - aboutLength} more characters needed`
                : `At least ${ABOUT_MIN} characters — buyers skim this first.`}
            </p>
            <p className="text-[11px] text-white/30">
              {aboutLength}/{ABOUT_MAX}
            </p>
          </div>
        </div>

        <Field label="Country *">
          <CountryPicker value={form.country} onChange={(country) => patch({ country })} />
        </Field>

        <Field label="City">
          <input
            className={inputClass}
            value={form.city}
            onChange={(e) => patch({ city: e.target.value })}
            placeholder="Bengaluru"
          />
        </Field>

        <div className="sm:col-span-2">
          <label className={labelClass}>Languages you speak *</label>
          <LanguagesEditor
            languages={form.languages}
            onChange={(languages) => patch({ languages })}
          />
        </div>
      </div>
    );
  };

  const CredentialBlock = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <p className="text-[11px] text-white/40 mt-0.5 mb-3">{description}</p>
      {children}
    </div>
  );

  const renderCredentialsStep = () => (
    <div className="space-y-4">
      <CredentialBlock
        title="Work experience"
        description="Where you've worked and what you did there."
      >
        <RepeatableRows<WorkExperienceEntry>
          items={form.workExperience}
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
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  className={inputClass}
                  value={item.from || ""}
                  onChange={(e) => update({ from: e.target.value || null })}
                  aria-label="From"
                />
                <input
                  type="month"
                  className={inputClass}
                  value={item.to || ""}
                  onChange={(e) => update({ to: e.target.value || null })}
                  disabled={!!item.current}
                  aria-label="To"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-white/70 select-none">
                <input
                  type="checkbox"
                  checked={!!item.current}
                  // Clearing `to` keeps "current role" and an end date from both
                  // being set, which reads as a contradiction on the profile.
                  onChange={(e) =>
                    update({ current: e.target.checked, ...(e.target.checked ? { to: null } : {}) })
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
      </CredentialBlock>

      <CredentialBlock title="Education" description="Degrees and programmes you've completed.">
        <RepeatableRows<EducationEntry>
          items={form.education}
          onChange={(education) => patch({ education })}
          blank={() => ({ institution: "", degree: "", fieldOfStudy: "", from: null, to: null })}
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
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  className={inputClass}
                  value={item.from || ""}
                  onChange={(e) => update({ from: e.target.value || null })}
                  aria-label="From"
                />
                <input
                  type="month"
                  className={inputClass}
                  value={item.to || ""}
                  onChange={(e) => update({ to: e.target.value || null })}
                  aria-label="To"
                />
              </div>
            </div>
          )}
        />
      </CredentialBlock>

      <CredentialBlock
        title="Certifications"
        description="Credentials that back up your skills."
      >
        <RepeatableRows<CertificationEntry>
          items={form.certifications}
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
              <input
                type="month"
                className={inputClass}
                value={item.issuedAt || ""}
                onChange={(e) => update({ issuedAt: e.target.value || null })}
                aria-label="Issued"
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
      </CredentialBlock>
    </div>
  );

  const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/45 shrink-0">{label}</span>
      <span className="text-xs text-white text-right">{value || "—"}</span>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h4 className="text-sm font-medium text-white mb-1">{form.displayName || "Your name"}</h4>
        <p className="text-xs text-white/60">{form.professionalTitle}</p>
        <p className="text-[11px] text-white/35 mt-1">
          {[form.city, form.country].filter(Boolean).join(", ")}
        </p>
        {form.about && (
          <p className="text-xs text-white/60 mt-3 whitespace-pre-line">{form.about}</p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <SummaryRow
          label="Languages"
          value={form.languages.filter((l) => l.name).map((l) => l.name).join(", ")}
        />
        <SummaryRow label="Specializations" value={selectedSpecs.map((s) => s.name).join(", ")} />
        <SummaryRow label="Skills" value={form.skills.map((s) => s.name).join(", ")} />
        <SummaryRow
          label="Experience"
          value={
            form.workExperience.filter((w) => w.title.trim()).length
              ? `${form.workExperience.filter((w) => w.title.trim()).length} entries`
              : "Not added"
          }
        />
        <SummaryRow
          label="Education"
          value={
            form.education.filter((e) => e.institution.trim()).length
              ? `${form.education.filter((e) => e.institution.trim()).length} entries`
              : "Not added"
          }
        />
        <SummaryRow
          label="Certifications"
          value={
            form.certifications.filter((c) => c.name.trim()).length
              ? `${form.certifications.filter((c) => c.name.trim()).length} entries`
              : "Not added"
          }
        />
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "rgba(25,230,108,0.28)", background: "rgba(25,230,108,0.06)" }}
      >
        <p className="text-xs text-white font-medium">What happens next</p>
        <ul className="mt-2 space-y-1.5 text-[11px] text-white/60">
          <li>· Your profile goes live right away — no waiting on approval.</li>
          <li>
            · You land on your profile page. Anything still missing is listed there, and clicking it
            opens the fields straight away.
          </li>
          <li>
            · An intro video is optional, and it's the one thing our team checks before it shows on
            your profile.
          </li>
          <li>· Payout details come later, only when you're about to get paid.</li>
        </ul>
      </div>
    </div>
  );

  const stepBody: Record<StepId, () => React.ReactNode> = {
    basics: renderBasicsStep,
    skills: () => (
      <SkillsPicker selected={form.skills} onChange={(skills) => patch({ skills })} token={token} />
    ),
    specializations: () => (
      <SpecializationsPicker
        groups={specGroups}
        selectedIds={form.specializationIds}
        onChange={(specializationIds) => patch({ specializationIds })}
      />
    ),
    credentials: renderCredentialsStep,
    review: renderReviewStep,
  };

  const primaryBtn =
    "rounded-lg px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity";
  const secondaryBtn =
    "rounded-lg px-5 py-2.5 text-sm font-medium text-white/80 border border-white/15 hover:text-white hover:border-white/25 transition-colors";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-hidden">
      <div className="h-full w-full flex items-center justify-center p-2 sm:p-4">
        <div
          className="relative w-full max-w-[640px] rounded-[20px] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
          style={{
            background:
              "radial-gradient(900px circle at 50% 0%, rgba(255,20,239,0.14), transparent 55%), linear-gradient(180deg,#070A12 0%, #07080A 100%)",
            maxHeight: "calc(100dvh - 24px)",
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white z-20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {phase === "wizard" && (
            <div className="h-[3px] w-full bg-white/[0.06] shrink-0">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
                  background: GRADIENT,
                }}
              />
            </div>
          )}

          <div className="p-6 overflow-y-auto">
            {phase === "loading" && (
              <div className="py-14 text-center">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-white/40" />
                <p className="text-white/50 text-sm mt-3">Loading your profile…</p>
              </div>
            )}

            {phase === "blocked" && (
              <div className="text-center py-6 px-2">
                <div
                  className="mx-auto mb-4 w-14 h-14 rounded-full grid place-items-center"
                  style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
                >
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  Freelancing is handled by your organization
                </h3>
                <p className="text-white/60 text-sm max-w-[420px] mx-auto">{blockedMessage}</p>
                <button onClick={onClose} className={`${primaryBtn} mt-6`} style={{ background: ACCENT }}>
                  Got it
                </button>
              </div>
            )}

            {phase === "live" && (
              <div className="text-center py-6 px-2">
                <div
                  className="mx-auto mb-4 w-14 h-14 rounded-full grid place-items-center"
                  style={{ background: "rgba(25,230,108,0.12)", color: "#19E66C" }}
                >
                  <BadgeCheck className="w-7 h-7" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  Your Super Creator profile is live
                </h3>
                <div className="text-white/60 text-sm space-y-2 max-w-[420px] mx-auto">
                  {/* Deliberately not "you can be hired now" any more: a live
                      profile is discoverable, but publishing services and
                      taking hire work both wait on an approved intro video —
                      the server refuses either without one. Promising work that
                      can't happen yet is how a new creator concludes the
                      platform is broken. */}
                  <p>Buyers can find you and message you right now.</p>
                  <p>
                    Services and hiring unlock once an admin approves your intro video — that's
                    the one thing left.
                  </p>
                  <p className="text-white/40 text-[12px]">
                    Anything else still missing — portfolio, or the credentials you skipped — is
                    listed on your profile page. Click any of it to fill it in.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onActivated?.();
                    }}
                    className={primaryBtn}
                    style={{ background: GRADIENT }}
                  >
                    View my profile
                  </button>
                  <button onClick={onClose} className={secondaryBtn}>
                    Close
                  </button>
                </div>
              </div>
            )}

            {phase === "wizard" && (
              <>
                <p className="text-[11px] uppercase tracking-wide text-white/35 mb-2">
                  Step {stepIndex + 1} of {STEPS.length}
                </p>
                <h3 className="text-white text-xl font-semibold mb-1">{STEP_TITLES[step]}</h3>
                <p className="text-white/45 text-sm mb-5">{STEP_SUBTITLES[step]}</p>

                {stepBody[step]()}

                {showErrors && currentErrors.length > 0 && (
                  <div
                    className="mt-4 rounded-lg border px-3 py-2.5"
                    style={{
                      borderColor: "rgba(239,68,68,0.35)",
                      background: "rgba(239,68,68,0.08)",
                    }}
                  >
                    <ul className="space-y-1">
                      {currentErrors.map((err) => (
                        <li key={err} className="text-red-300 text-xs flex gap-1.5">
                          <span aria-hidden>•</span>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {banner && (
                  <div
                    className="mt-4 rounded-lg border px-3 py-2.5"
                    style={{
                      borderColor: "rgba(239,68,68,0.35)",
                      background: "rgba(239,68,68,0.08)",
                    }}
                  >
                    <p className="text-red-300 text-xs">{banner}</p>
                    {serverErrors.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {serverErrors.map((err) => (
                          <li key={err} className="text-red-300/80 text-[11px] flex gap-1.5">
                            <span aria-hidden>•</span>
                            {err}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-3">
                  {stepIndex > 0 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={saving || activating}
                      className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  ) : (
                    <span />
                  )}

                  {step === "review" ? (
                    <button
                      type="button"
                      onClick={handleActivate}
                      disabled={activating || saving}
                      className={primaryBtn}
                      style={{ background: GRADIENT }}
                    >
                      {activating ? "Creating…" : "Create my profile"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={saving}
                      className={primaryBtn}
                      style={{ background: blocking && showErrors ? "#333335" : GRADIENT }}
                    >
                      {saving
                        ? "Saving…"
                        : // The credentials step is optional, so its button says so
                          // rather than implying something is required.
                          step === "credentials" && credentialCount === 0
                          ? "Skip for now"
                          : "Continue"}
                    </button>
                  )}
                </div>

                <p className="mt-3 text-center text-[11px] text-white/25">
                  Saved as you go — you can close this and pick up where you left off.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
