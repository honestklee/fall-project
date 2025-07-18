// npm install resend dulu
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendAdminAccountEmailParams {
  to: string;
  email: string;
  resetLink: string;
}

export async function sendAdminAccountEmail({
  to,
  email,
  resetLink,
}: SendAdminAccountEmailParams) {
  return resend.emails.send({
    from: "onboarding@resend.dev", // default sender dari resend
    to,
    subject: "Akun Admin Baru",
    html: `
      <h2>Selamat, akun admin Anda telah dibuat!</h2>
      <p>Email: <b>${email}</b></p>
      <p>Silakan atur password Anda melalui link berikut:</p>
      <a href="${resetLink}">${resetLink}</a>
      <br><br>
      <small>Jangan bagikan link ini ke siapapun.</small>
    `,
  });
}
