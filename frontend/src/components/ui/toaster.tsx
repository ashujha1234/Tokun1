import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

/* How long a toast stays up, in ms. Stated here rather than left to Radix's
   implicit 5000 default, so the two toast systems this app renders (this one and
   Sonner, in App.tsx) can be set from a number someone can actually find — they
   used to disagree by whatever their separate library defaults happened to be.

   Radix still pauses this countdown while the pointer is over the toast or the
   window is in the background, which is why one could seem to hang around
   forever: the viewport sits top-centre, right where the cursor tends to be, and
   a pointermove across it stops the clock. That pause is deliberate — it stops a
   message vanishing while it's being read — and resumes the moment the pointer
   leaves. */
export const TOAST_DURATION = 4000

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={TOAST_DURATION}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
