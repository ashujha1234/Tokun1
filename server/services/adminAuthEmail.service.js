// The admin's login code, and the alert when someone signs in.
//
// Separate from the user OTP mail in routes/authRoutes.js on purpose: that one
// is a friendly "welcome back" for a 4-digit code, and this is a privileged
// login for an account that can move money. Different copy, different urgency,
// and a different code length — see ADMIN_OTP_LENGTH in routes/adminRoutes.js.

const { ACCENT, escapeHtml, sendShellEmail } = require("./emailLayout");

/**
 * The 6-digit code itself.
 *
 * Deliberately says where the request came from. If an admin gets this email
 * without having just typed their password, that is a compromised password and
 * the IP is the first thing anyone will ask for.
 */
exports.sendAdminLoginOtpEmail = async ({ to, code, minutes, ip, userAgent }) =>
  sendShellEmail({
    to,
    subject: `${code} is your Tokun admin login code`,
    heading: "Your admin login code",
    accent: ACCENT.brand,
    preheader: `Expires in ${minutes} minutes. If this wasn't you, change your password now.`,
    introHtml: `Someone just entered the password for this admin account. Enter the code below to finish signing in.
      <div style="margin:18px 0 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:34px;letter-spacing:0.32em;font-weight:700;color:#ffffff">${escapeHtml(
        code
      )}</div>`,
    rows: [
      { label: "Expires in", value: `${minutes} minutes`, emphasis: true },
      { label: ip ? "Request from" : "", value: ip || "" },
      { label: userAgent ? "Device" : "", value: userAgent ? String(userAgent).slice(0, 90) : "" },
    ],
    footerNote:
      "If you didn't just try to sign in, someone has your admin password. Nobody can get in without this code — but change the password immediately, because they will keep trying.",
    receivingBecause: "a sign-in attempt on your Tokun.World admin account",
  });

/**
 * A successful sign-in.
 *
 * The cheapest intrusion detection there is: the real admin sees a login they
 * didn't make, at an IP that isn't theirs, within seconds of it happening.
 */
exports.sendAdminLoginAlertEmail = async ({ to, ip, userAgent, at }) =>
  sendShellEmail({
    to,
    subject: "New sign-in to your Tokun admin account",
    heading: "Signed in",
    accent: ACCENT.info,
    preheader: ip ? `From ${ip}` : "A new admin session was started.",
    introHtml: "Your admin account was just signed into.",
    rows: [
      { label: "When", value: at ? new Date(at).toLocaleString("en-IN") : "just now" },
      { label: ip ? "IP address" : "", value: ip || "" },
      { label: userAgent ? "Device" : "", value: userAgent ? String(userAgent).slice(0, 90) : "" },
    ],
    footerNote:
      "Was this you? Nothing to do. Wasn't it? Change your admin password now and tell the rest of the team — an admin session can approve refunds and suspend accounts.",
    receivingBecause: "a sign-in on your Tokun.World admin account",
  });
