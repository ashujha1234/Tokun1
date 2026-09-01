/**
 * The boundary of last resort, plus a per-route one.
 *
 * React unmounts the ENTIRE tree when a render error reaches the top with no
 * boundary in the way. Not the broken component — everything. The result is a
 * blank white page: no message, no navigation, no reload button, nothing to
 * tell the person whether the site is down or their connection is. The only way
 * out is knowing to press refresh.
 *
 * CanvasErrorBoundary already covers the 3D globe, which is where this was
 * first hit. This is the same idea applied to the app as a whole, because the
 * globe is not the only thing that can throw.
 *
 * Production makes it worse, which is why the copy below matters: the build
 * strips console (vite.config.ts `drop`), and there is no error tracker wired
 * up yet — so a white screen leaves NO trace anywhere. Until Sentry or App
 * Insights lands, the reference shown to the user is the only identifier
 * connecting what they saw to what happened, and asking them to quote it is the
 * only way to find out.
 *
 * A class component because componentDidCatch has no hook equivalent.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "@/lib/telemetry";

type Props = {
  children: ReactNode;
  /** Shown in the message and logged — "page" for a route, omitted at the root. */
  scope?: string;
  /** Route boundaries pass this so the reset button can re-render in place. */
  onReset?: () => void;
};

type State = { error: Error | null; ref: string };

/* Short, readable aloud over a support chat, and unique enough to grep for.
   Not a UUID: nobody types one of those out correctly. */
const makeRef = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null, ref: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error, ref: makeRef() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* console.error survives here in development and is stripped in production
       — deliberately left as-is rather than worked around, because the right
       fix is an error tracker, not a smuggled log. */
    console.error(
      `[AppErrorBoundary${this.props.scope ? `:${this.props.scope}` : ""}] ${this.state.ref}`,
      error?.message || error,
      info?.componentStack?.split("\n").slice(1, 4).join("\n") || ""
    );

    /* The tracker the comment above was waiting for. Until this line existed, a
       white screen in production left no trace anywhere: the boundary rendered a
       reference for the user to quote and there was nothing to look it up in.
       Now the same ref is attached to the report, so quoting it resolves to this
       exact crash with its component stack.

       componentStack is trimmed to the first three frames on purpose — the full
       one is hundreds of lines of provider and router wrappers, and the frames
       that identify the broken component are at the top. */
    reportError(error, {
      ref: this.state.ref,
      scope: this.props.scope || "root",
      componentStack:
        info?.componentStack?.split("\n").slice(1, 4).join(" | ") || "",
    });
  }

  private reset = () => {
    /* A route boundary can recover by re-rendering; the root cannot be trusted
       to, since whatever broke is likely still in whatever state broke it. */
    if (this.props.onReset) {
      this.setState({ error: null, ref: "" });
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    const { error, ref } = this.state;
    if (!error) return this.props.children;

    const isRoute = !!this.props.onReset;

    return (
      <div
        role="alert"
        style={{
          minHeight: isRoute ? "50vh" : "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1.25rem",
          background: "#0B0B0D",
          color: "#E8E8EA",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 650, margin: "0 0 0.6rem" }}>
            {isRoute ? "This page didn't load" : "Something went wrong"}
          </h1>

          {/* No apology and no jargon. It says what happened, that their data is
              fine, and what to do — which is the whole job of this screen. */}
          <p style={{ margin: "0 0 1.4rem", lineHeight: 1.6, color: "rgba(232,232,234,0.7)" }}>
            {isRoute
              ? "The rest of the app is still working — you can try again or head back."
              : "The page hit an unexpected error. Nothing you saved has been lost."}
          </p>

          <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={this.reset}
              style={{
                padding: "0.6rem 1.1rem",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#0B0B0D",
                background: "#D9D9D9",
              }}
            >
              {isRoute ? "Try again" : "Reload"}
            </button>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                padding: "0.6rem 1.1rem",
                borderRadius: 999,
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#E8E8EA",
                background: "transparent",
                border: "1px solid rgba(232,232,234,0.25)",
              }}
            >
              Go home
            </button>
          </div>

          <p
            style={{
              margin: "1.4rem 0 0",
              fontSize: "0.78rem",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: "rgba(232,232,234,0.4)",
            }}
          >
            Reference {ref}
          </p>
        </div>
      </div>
    );
  }
}
