import { useEffect, useRef, useState } from "react";
import { Link as LinkIcon, Check, Share2 } from "lucide-react";
import {
  FaWhatsapp,
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa6";
import { toast } from "@/components/ui/use-toast";

type Props = {
  /** The public link being shared. */
  url: string;
  /** Prompt title — used as the message text on networks that accept one. */
  title?: string;
  /** Extra classes for the trigger button, so callers can match local styling. */
  className?: string;
  /** Which side the panel opens towards. Default "right" (panel is right-aligned). */
  align?: "left" | "right";
};

/**
 * Share menu for a prompt listing: the destinations people actually use, plus
 * the copy-link fallback this used to be on its own.
 *
 * Only the listing URL ever leaves — never the prompt text — so this is safe to
 * show to everyone, including visitors who haven't bought the prompt.
 */
const SharePromptMenu = ({ url, title, className = "", align = "right" }: Props) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const shareText = title ? `${title} — on Tokun` : "Check out this prompt on Tokun";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const openExternal = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast({ title: "Link copied", description: "Share it with anyone." });
      return true;
    } catch {
      toast({
        title: "Couldn't copy the link",
        description: "Please try again.",
      });
      return false;
    }
  };

  // Instagram has no share-a-link endpoint on the web — the only honest thing
  // to do is hand over the link and open the app, so it can be pasted into a
  // story or DM.
  const shareToInstagram = async () => {
    const ok = await copyLink();
    if (!ok) return;
    toast({
      title: "Link copied for Instagram",
      description: "Paste it into your story or a DM.",
    });
    openExternal("https://www.instagram.com/");
  };

  const channels = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      Icon: FaWhatsapp,
      color: "#25D366",
      onClick: () => openExternal(`https://wa.me/?text=${encodedText}%20${encodedUrl}`),
    },
    {
      key: "facebook",
      label: "Facebook",
      Icon: FaFacebookF,
      color: "#1877F2",
      onClick: () =>
        openExternal(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      key: "instagram",
      label: "Instagram",
      Icon: FaInstagram,
      color: "#E1306C",
      onClick: shareToInstagram,
    },
    {
      key: "x",
      label: "X",
      Icon: FaXTwitter,
      color: "#FFFFFF",
      onClick: () =>
        openExternal(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`),
    },
    {
      key: "email",
      label: "Email",
      Icon: FaEnvelope,
      color: "#A78BFA",
      onClick: () => {
        window.location.href = `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`;
        setOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Share this prompt"
        className={
          className ||
          "h-9 px-4 rounded-[8px] border border-white/10 bg-[#1C1C1E] flex items-center justify-center gap-1.5 text-white text-[13px] hover:bg-[#2A2A2D] transition-all whitespace-nowrap"
        }
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Share this prompt"
          className={`absolute z-50 mt-2 w-[268px] rounded-[12px] border border-white/10 bg-[#17171A] p-3 shadow-[0_18px_44px_rgba(0,0,0,0.55)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Three across, not five: "Instagram" and "WhatsApp" collide at five
              columns in a panel this width. */}
          <div className="grid grid-cols-3 gap-1">
            {channels.map(({ key, label, Icon, color, onClick }) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={onClick}
                title={`Share on ${label}`}
                aria-label={`Share on ${label}`}
                className="flex flex-col items-center gap-1.5 rounded-[8px] px-1 py-2.5 text-[11px] text-white/60 hover:bg-white/[0.07] hover:text-white transition-colors"
              >
                <Icon className="w-[19px] h-[19px]" style={{ color }} />
                <span className="leading-none">{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-2 border-t border-white/10 pt-2">
            <button
              type="button"
              role="menuitem"
              onClick={copyLink}
              className="w-full flex items-center gap-2 rounded-[8px] px-2 py-2 text-[13px] text-white/80 hover:bg-white/[0.07] hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharePromptMenu;
