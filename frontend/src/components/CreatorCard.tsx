/**
 * One creator card, for the directory and for your saved list.
 *
 * It lived inside FindCreatorsPage as `PersonCard`, which is why the Saved page
 * had to draw its own: an avatar, a name and the word "Creator", against this
 * card's title, location, tier badges, specializations, skills and rate. Two
 * cards for the same person, and only one of them told you why you had saved
 * them.
 *
 * Now both pages render this. A `DirectoryPerson` is all it takes, and every
 * field on it is optional to the layout — an empty row is never drawn — so a
 * saved creator whose profile has since gone quiet renders as much of the card
 * as is still true rather than as a broken one.
 */

import { useNavigate } from "react-router-dom";
import {
  Award,
  Briefcase,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { avatarFor, onAvatarError } from "@/lib/avatar";
import SaveButton from "@/components/SaveButton";
import { GLASS_CARD } from "@/lib/glass";
import type { DirectoryPerson } from "@/lib/discoverApi";

const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

/* Enough products sold to be worth calling out. Lives with the card because the
   card is the only thing that renders the badge. */
const TOP_CREATOR_THRESHOLD = 5; // totalSoldPrompts

const AVAILABILITY_LABEL: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  occasional: "Occasional",
};

export default function CreatorCard({
  person,
  onMessage,
  messaging,
  saved,
  savingSave,
  onToggleSave,
}: {
  person: DirectoryPerson;
  onMessage: (person: DirectoryPerson) => void;
  messaging: boolean;
  saved: boolean;
  savingSave: boolean;
  onToggleSave: (person: DirectoryPerson) => void;
}) {
  const navigate = useNavigate();
  const isTopCreator = person.totalSoldPrompts >= TOP_CREATOR_THRESHOLD;
  const openProfile = () => navigate(`/profile/${person.userId}`);

  /* Two independent things have to be true before a hire can happen, and the
     card states both rather than only discovering them at the proposal:

       payoutReady  — Razorpay has ACTIVATED their account. Money for a hire is
                      routed there and held, so a proposal to an unverified
                      account is a dead end.
       superCreator — their intro video is approved (or they're allowlisted).
                      POST /api/hire/create-proposal refuses otherwise.

     Message stays available in both cases: a client should still be able to
     talk to someone who's mid-setup. */
  const videoPending = person.isFreelancer && !person.superCreator;
  const payoutPending = person.isFreelancer && !person.payoutReady;
  const canHire = person.isFreelancer && person.payoutReady && person.superCreator;
  const hireBlocked = videoPending || payoutPending;

  return (
    <div className={`${GLASS_CARD} group relative flex flex-col`}>
      {/* Gradient wash that only shows on hover — gives the glass something to
          refract instead of sitting flat. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,20,239,0.10) 0%, rgba(26,115,232,0.06) 45%, transparent 75%)",
        }}
      />

      {/* Save, at the corner rather than in the footer: the footer's two buttons
          are the actions on this person, and this is an action on your own list.
          Absolute so it costs the name no width — it sits over the identity
          block, which is why that block reserves room for it on the right.
          stopPropagation because that whole block is a link to the profile. */}
      <div
        className="absolute top-3.5 right-3.5 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <SaveButton
          size="sm"
          saved={saved}
          busy={savingSave}
          onClick={() => onToggleSave(person)}
        />
      </div>

      <div className="relative p-5 flex flex-col gap-4 flex-1">
        {/* Identity — the whole block is the link to the profile, which is where
            hiring, messaging and their services all live. */}
        <div className="flex items-start gap-3 cursor-pointer pr-[78px]" onClick={openProfile}>
          <div className="relative shrink-0">
            <img loading="lazy" decoding="async"
              src={avatarFor(person)}
              onError={onAvatarError(person)}
              alt={person.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            {person.verified && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full grid place-items-center"
                style={{ background: "#0B0B0B" }}
                title="Identity verified"
              >
                <ShieldCheck className="w-3 h-3" style={{ color: "#22D3EE" }} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-[15px] truncate">{person.name}</span>
              {/* Wrapped rather than putting `title` on the icon — lucide
                  components don't forward it. */}
              {person.hasIntroVideo && (
                <span className="shrink-0" title="Has an intro video">
                  <Video className="w-3.5 h-3.5 text-white/30" />
                </span>
              )}
            </div>

            {/* Falls back to the tier name — a prompt seller has no
                professional title, and inventing one would be a lie. It was
                "Product creator", a third name for a group the badges already
                call Creators. Not repeated for a Super Creator: the badge
                directly below says that, and saying it twice on one card reads
                as a rendering bug. */}
            <p className="text-white/45 text-[12px] truncate">
              {person.professionalTitle || (person.isSeller && !person.isFreelancer ? "Creator" : "")}
            </p>

            {person.location && (
              <p className="text-white/30 text-[11px] truncate inline-flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                {person.location}
              </p>
            )}
          </div>
        </div>

        {/* What kind of account this is. Both badges appear when both are true. */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* The gradient badge is the claim "this person can be hired right
              now", so it is spent only on someone the server agrees with. A
              live profile whose video isn't approved yet is still a real
              creator — it just reads flat until they're cleared, and the
              pending state below says why. */}
          {/* Said only where it's true. Wearing it on a profile that can't be
              hired is what made the directory claim five Super Creators when
              one person could actually take work — the badge, the filter count
              and the Hire button now all read the same flag. Someone still
              waiting gets the amber chip below instead, which names the tier
              and the fact that they haven't reached it yet. */}
          {person.isFreelancer && person.superCreator && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white"
              style={{ background: GRADIENT }}
            >
              <Briefcase className="w-3 h-3" />
              SUPER CREATOR
            </span>
          )}
          {person.isSeller && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
            >
              <Sparkles className="w-3 h-3" />
              {/* `isSeller` is the data flag; PRODUCTS is what we call it. */}
              PRODUCTS
            </span>
          )}
          {isTopCreator && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(255,211,77,0.12)", color: "#FFD34D" }}
            >
              <Award className="w-3 h-3" />
              TOP
            </span>
          )}
          {/* Stated on the card rather than only on a disabled button, so a
              client understands the gap before clicking anything.

              Deliberately vague about which state the video is in: NONE,
              PENDING and REJECTED are all "not cleared" to a client, and
              spelling out a rejection would leak a moderation decision about
              someone else. Same wording the proposal endpoint uses. */}
          {videoPending && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(250,188,78,0.10)", color: "#FABC4E" }}
              title="This creator isn't approved to take on work yet"
            >
              <Clock className="w-3 h-3" />
              SUPER CREATOR PENDING
            </span>
          )}
          {payoutPending && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(250,188,78,0.10)", color: "#FABC4E" }}
              title="Their payout account is still being verified, so they can't take paid work yet"
            >
              <Clock className="w-3 h-3" />
              SETTING UP PAYOUTS
            </span>
          )}
        </div>

        {/* Specializations, then skills. Both are cut short — a card is a
            summary, and the profile has the full list. */}
        {person.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {person.specializations.slice(0, 2).map((spec) => (
              <span
                key={spec._id}
                className="px-2 py-1 rounded-md text-[11px] text-white/80"
                style={{
                  background: "rgba(26,115,232,0.12)",
                  border: "1px solid rgba(26,115,232,0.25)",
                }}
              >
                {spec.name}
              </span>
            ))}
            {person.specializations.length > 2 && (
              <span className="px-2 py-1 rounded-md text-[11px] text-white/40">
                +{person.specializations.length - 2}
              </span>
            )}
          </div>
        )}

        {person.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {person.skills.slice(0, 4).map((skill) => (
              <span
                key={skill.slug}
                className="px-2 py-1 rounded-md text-[11px] text-white/55 bg-white/[0.04] border border-white/[0.07]"
              >
                {skill.name}
              </span>
            ))}
            {person.skillCount > 4 && (
              <span className="px-2 py-1 rounded-md text-[11px] text-white/35">
                +{person.skillCount - 4}
              </span>
            )}
          </div>
        )}

        {/* Facts, and only the ones that exist. An empty row is worse than none. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-auto text-[11px]">
          {person.hourlyRate != null && (
            <span className="text-white/70">
              from <span className="text-white font-semibold">₹{person.hourlyRate}</span>/hr
            </span>
          )}
          {person.availability && (
            <span className="text-white/40 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {AVAILABILITY_LABEL[person.availability]}
            </span>
          )}
          {person.rating > 0 && (
            <span className="text-white/40 inline-flex items-center gap-1">
              <Star className="w-3 h-3" style={{ color: "#FFD34D" }} />
              {person.rating.toFixed(1)}
              {person.reviewsCount > 0 && ` (${person.reviewsCount})`}
            </span>
          )}
          {person.totalUploadedPrompts > 0 && (
            <span className="text-white/40">
              {/* "product", not "prompt" — the API field name stays
                  totalUploadedPrompts; only the wording changes. */}
              {person.totalUploadedPrompts} product{person.totalUploadedPrompts === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-2 px-5 pb-5">
        <button
          onClick={() => onMessage(person)}
          disabled={messaging}
          className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-[12px] font-medium text-white transition-colors disabled:opacity-50 bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] backdrop-blur-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Message
        </button>

        {/* Disabled, not hidden. Hiding it would leave a client wondering
            whether this person takes custom work at all; a disabled button with
            a reason answers that. */}
        {hireBlocked ? (
          <button
            type="button"
            disabled
            title={
              videoPending
                ? "This creator isn't approved to take on work yet. You can still message them."
                : "This creator is still setting up payouts, so they can't take paid work yet. You can still message them."
            }
            className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white/35 bg-white/[0.04] border border-white/[0.07] cursor-not-allowed"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Can't hire yet
          </button>
        ) : (
          <button
            onClick={openProfile}
            className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Briefcase className="w-3.5 h-3.5" />
            {canHire ? "Hire" : "View profile"}
          </button>
        )}
      </div>
    </div>
  );
}
