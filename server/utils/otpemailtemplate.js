//  function buildOtpEmailHtml({ name = "there", otp, siteUrl = "https://tokun.ai" }) {
//   const firstName = (name || "there").split(" ")[0];
//   const digits = String(otp).split(""); // supports 4 or 6 digits

//   // Helper to render the OTP boxes (4 or 6)
//   const renderBoxes = (n) => {
//     const boxes = [];
//     for (let i = 0; i < n; i++) {
//       const d = digits[i] || "&nbsp;";
//       boxes.push(`
//         <td style="background:#15171C; border:1px solid #2A2D36; width:48px; height:48px; border-radius:8px; font-family: Inter, Arial, Helvetica, sans-serif; color:#FFFFFF; font-size:22px; font-weight:700; text-align:center;">
//           ${d}
//         </td>
//       `);
//       if (i !== n - 1) boxes.push(`<td width="10"></td>`);
//     }
//     return boxes.join("");
//   };

//   // Decide how many boxes to show by OTP length (fallback 4)
//   const boxCount = digits.length === 6 ? 6 : 4;

//   return `<!DOCTYPE html>
// <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
//   <head>
//     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//     <title>Tokun.ai OTP</title>
//     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
//     <style>
//       body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
//       table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
//       img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
//       table { border-collapse: collapse !important; }
//       body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #030406; }
//       a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
//       @media (prefers-color-scheme: dark) { .dark-bg { background-color: #0b0e13 !important; } }
//       @media screen and (max-width: 600px) { .container { width: 100% !important; } .px-32 { padding-left: 16px !important; padding-right: 16px !important; } }
//     </style>
//   </head>
//   <body style="background-color:#030406; margin:0; padding:0;">
//     <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color:#030406;">
//       <tr>
//         <td align="center" class="px-32" style="padding: 32px;">
//           <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="width:600px; max-width:600px;">

//             <tr>
//               <td align="center" style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:28px; font-weight:700; color:#FFFFFF; padding-bottom: 24px;">
//                 TOKUN.AI
//               </td>
//             </tr>

//             <tr>
//               <td align="center" style="padding-bottom: 28px;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:20px; overflow:hidden;">
//                   <tr>
//                     <td align="center" style="background: linear-gradient(90deg, #A300FF 0%, #6A67FF 50%, #2F86FF 100%); padding: 28px 24px; border-radius: 20px; box-shadow: 0px 5px 14px 0px #080F340A;">
//                      <a href="${siteUrl}" 
//   style="
//     display:inline-block;
//     text-decoration:none;
//     font-family: Inter, Arial, Helvetica, sans-serif;
//     color:#FFFFFF;
//     padding:14px 22px;
//     border-radius:12px;
//     font-weight:700;
//     font-size:36px;
//     background-image: url('${siteUrl}/icons/cube.png');
//     background-repeat: no-repeat;
//     background-size: cover;
//     background-position: center;
//     box-shadow:0px 5px 14px 0px #080F340A;
//   ">
//   Tokun.ai
// </a>

//                       <div style="height:10px; line-height:10px;">&nbsp;</div>
//                       <div style="font-family: Inter, Arial, Helvetica, sans-serif; font-weight:600; color:#ffffff; font-size:14px;">What would you like to create today?</div>
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <tr><td style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:18px; color:#FFFFFF; padding: 4px;">Hi ${firstName},</td></tr>

//             <tr><td style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:14px; color:#C9CDD6; line-height:22px; padding: 0 4px 18px;">Here is your One Time Password (OTP).<br/>Please enter this code to verify your email address for Tokun.AI</td></tr>

//             <tr>
//               <td align="center" style="padding: 10px 0 6px;">
//                 <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
//                   <tr>
//                     ${renderBoxes(boxCount)}
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <tr><td align="center" style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:12px; color:#8E95A5; padding-bottom: 24px;">OTP will expire in <span style="color:#FFFFFF; font-weight:600;">5 minutes</span>.</td></tr>

//             <tr><td style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:14px; color:#C9CDD6; line-height:22px; padding: 0 4px;">Best Regards,<br/><strong style="color:#FFFFFF;">Team Tokun.AI</strong></td></tr>

//             <tr><td style="padding-top:28px;"><table role="presentation" width="100%"><tr><td style="border-top:1px solid #24262B; font-size:0; line-height:0;">&nbsp;</td></tr></table></td></tr>

//             <tr>
//               <td align="center" style="padding: 18px 0;">
//                 <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="28" alt="Facebook" /></a>
//                 <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="28" alt="X" /></a>
//                 <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" width="28" alt="Instagram" /></a>
//                 <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" width="28" alt="LinkedIn" /></a>
//               </td>
//             </tr>

//             <tr><td style="padding-top:10px;"><table role="presentation" width="100%"><tr><td style="border-top:1px solid #24262B; font-size:0; line-height:0;">&nbsp;</td></tr></table></td></tr>

//             <tr><td align="center" style="padding: 6px 16px 0;"><div style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:10px; color:#B4BAC5; text-align:center;">You are receiving this mail because you registered to join the TOKUN.AI platform as a user or a creator. This also shows that you agree to our Terms of use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</div></td></tr>

//             <tr><td align="center" style="padding: 14px 8px 32px;"><a href="${siteUrl}/privacy" style="font-family: Inter, Arial, Helvetica, sans-serif; color:#9CA3AF; font-size:12px; text-decoration:underline; padding:0 6px;">Privacy policy</a> | <a href="${siteUrl}/terms" style="font-family: Inter, Arial, Helvetica, sans-serif; color:#9CA3AF; font-size:12px; text-decoration:underline; padding:0 6px;">Terms of use</a> | <a href="${siteUrl}/help" style="font-family: Inter, Arial, Helvetica, sans-serif; color:#9CA3AF; font-size:12px; text-decoration:underline; padding:0 6px;">Help center</a> | <a href="${siteUrl}/unsubscribe" style="font-family: Inter, Arial, Helvetica, sans-serif; color:#9CA3AF; font-size:12px; text-decoration:underline; padding:0 6px;">Unsubscribe</a></td></tr>

//           </table>
//         </td>
//       </tr>
//     </table>
//   </body>
// </html>`;
// }

// module.exports = { buildOtpEmailHtml };




function buildOtpEmailHtml({ name = "there", otp }) {
  const firstName = (name || "there").split(" ")[0];
  const digits = String(otp).split("");

  // Helper to render OTP boxes
  const renderBoxes = (n) => {
    const boxes = [];
    for (let i = 0; i < n; i++) {
      const d = digits[i] || "&nbsp;";
      boxes.push(`
        <td style="background:#15171C; border:1px solid #2A2D36; width:48px; height:48px; border-radius:8px; font-family:Inter, Arial, Helvetica, sans-serif; color:#FFFFFF; font-size:22px; font-weight:700; text-align:center;">
          ${d}
        </td>
      `);
      if (i !== n - 1) boxes.push(`<td width="10"></td>`);
    }
    return boxes.join("");
  };

  const boxCount = digits.length === 6 ? 6 : 4;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Tokun.ai OTP</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #030406; }
      a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
      @media (prefers-color-scheme: dark) { .dark-bg { background-color: #0b0e13 !important; } }
      @media screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .px-32 { padding-left: 16px !important; padding-right: 16px !important; }
      }
    </style>
  </head>
  <body style="background-color:#030406; margin:0; padding:0;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color:#030406;">
      <tr>
        <td align="center" class="px-32" style="padding: 32px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="width:600px; max-width:600px;">

            <tr>
              <td align="center" style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:28px; font-weight:700; color:#FFFFFF; padding-bottom: 24px;">
                TOKUN.AI
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom: 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:20px; overflow:hidden;">
                  <tr>
                    <td align="center" style="background: linear-gradient(90deg, #A300FF 0%, #6A67FF 50%, #2F86FF 100%); padding: 28px 24px; border-radius: 20px; box-shadow: 0px 5px 14px 0px #080F340A;">
                      <a href="#" 
                        style="
                          display:inline-block;
                          text-decoration:none;
                          font-family: Inter, Arial, Helvetica, sans-serif;
                          color:#FFFFFF;
                          padding:14px 22px;
                          border-radius:12px;
                          font-weight:700;
                          font-size:36px;
                          background: linear-gradient(90deg, #A300FF 0%, #6A67FF 50%, #2F86FF 100%);
                          background-image: url('cid:cube');
                          background-repeat: no-repeat;
                          background-size: cover;
                          background-position: center;
                          box-shadow:0px 5px 14px 0px #080F340A;
                        ">
                        Tokun.ai
                      </a>

                      <div style="height:10px; line-height:10px;">&nbsp;</div>
                      <div style="font-family: Inter, Arial, Helvetica, sans-serif; font-weight:600; color:#ffffff; font-size:14px;">What would you like to create today?</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr><td style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:18px; color:#FFFFFF; padding: 4px;">Hi ${firstName},</td></tr>

            <tr><td style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:14px; color:#C9CDD6; line-height:22px; padding: 0 4px 18px;">Here is your One Time Password (OTP).<br/>Please enter this code to verify your email address for Tokun.AI</td></tr>

            <tr>
              <td align="center" style="padding: 10px 0 6px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>${renderBoxes(boxCount)}</tr>
                </table>
              </td>
            </tr>

            <tr><td align="center" style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:12px; color:#8E95A5; padding-bottom: 24px;">OTP will expire in <span style="color:#FFFFFF; font-weight:600;">5 minutes</span>.</td></tr>

            <tr><td style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:14px; color:#C9CDD6; line-height:22px; padding: 0 4px;">Best Regards,<br/><strong style="color:#FFFFFF;">Team Tokun.AI</strong></td></tr>

            <tr><td style="padding-top:28px;"><table role="presentation" width="100%"><tr><td style="border-top:1px solid #24262B; font-size:0; line-height:0;">&nbsp;</td></tr></table></td></tr>

            <!-- ✅ Footer Icons -->
            <tr>
              <td align="center" style="padding: 18px 0;">
                <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="28" alt="Facebook" /></a>
                <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="28" alt="X" /></a>
                <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" width="28" alt="Instagram" /></a>
                <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" width="28" alt="LinkedIn" /></a>
              </td>
            </tr>

            <tr><td style="padding-top:10px;"><table role="presentation" width="100%"><tr><td style="border-top:1px solid #24262B; font-size:0; line-height:0;">&nbsp;</td></tr></table></td></tr>

            <!-- ✅ Footer Text -->
            <tr><td align="center" style="padding: 6px 16px 0;">
              <div style="font-family: Inter, Arial, Helvetica, sans-serif; font-size:10px; color:#B4BAC5; text-align:center;">
                You are receiving this mail because you registered to join the TOKUN.AI platform as a user or a creator. This also shows that you agree to our Terms of use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.
              </div>
            </td></tr>

            <tr><td align="center" style="padding: 14px 8px 32px;">
              <a href="#" style="font-family: Inter, Arial, Helvetica, sans-serif; color:#9CA3AF; font-size:12px; text-decoration:underline; padding:0 6px;">Privacy policy</a> |
              <a href="#" style="font-family: Inter, Arial, Helvetica, sans-serif; color:#9CA3AF; font-size:12px; text-decoration:underline; padding:0 6px;">Terms of use</a> |
              <a href="#" style="font-family: Inter, Arial, Helvetica, sans-serif; color:#9CA3AF; font-size:12px; text-decoration:underline; padding:0 6px;">Help center</a> |
              <a href="#" style="font-family: Inter, Arial, Helvetica, sans-serif; color:#9CA3AF; font-size:12px; text-decoration:underline; padding:0 6px;">Unsubscribe</a>
            </td></tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = { buildOtpEmailHtml };
