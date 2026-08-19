import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { TOAST_DURATION } from "@/components/ui/toaster"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      /* Above every fixed header (up to z-[999]) and every modal (up to
         z-[9999999]), and offset clear of the header. Sonner's default z-index
         left toasts rendering behind the header — the one message telling you
         whether something worked was the one you couldn't read.
         --toast-top is shared with the Radix viewport in ui/toast.tsx (declared
         in index.css) so the two systems can't disagree about where a toast
         belongs — they used to hold the same 4rem as two separate literals. */
      style={{ zIndex: 10000000, top: "var(--toast-top)" }}
      /* Same visible lifetime as the Radix toasts — the two systems both render
         at the top of the same screen, and a message that outlives the one next
         to it for no reason reads as a bug. Sonner's own default is 4s too, but
         stating it means the two move together when the number changes. */
      duration={TOAST_DURATION}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/10 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-white/15 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-white/70",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white/70",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
