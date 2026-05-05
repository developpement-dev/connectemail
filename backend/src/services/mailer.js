// backend/src/services/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `ConnectMail <${process.env.SMTP_FROM}>`;
const BASE_URL = process.env.APP_URL || 'http://localhost';

const emailTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body{font-family:'Segoe UI',sans-serif;background:#080c12;color:#e8edf5;margin:0;padding:0}
  .wrap{max-width:520px;margin:40px auto;background:#0d1420;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden}
  .header{background:linear-gradient(135deg,#1a2840,#111b28);padding:32px;text-align:center}
  .logo{font-size:24px;font-weight:800;color:#3b82f6;letter-spacing:-.02em}
  .body{padding:32px}
  h1{font-size:22px;font-weight:700;margin:0 0 12px;color:#e8edf5}
  p{color:#8b99b5;line-height:1.7;margin:0 0 16px}
  .btn{display:inline-block;padding:13px 28px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:10px;font-weight:500;font-size:15px;margin:8px 0}
  .footer{padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:12px;color:#5a6880}
</style></head>
<body><div class="wrap">
  <div class="header"><div class="logo">ConnectMail</div></div>
  <div class="body">${content}</div>
  <div class="footer">© 2025 ConnectMail — Ne répondez pas à cet email.</div>
</div></body></html>`;

export const sendVerificationEmail = async (email, firstName, token) => {
  const link = `${BASE_URL}/api/auth/verify-email/${token}`;
  const html = emailTemplate('Vérifiez votre email', `
    <h1>Bienvenue, ${firstName} 👋</h1>
    <p>Merci de vous être inscrit sur ConnectMail. Cliquez sur le bouton ci-dessous pour activer votre compte.</p>
    <a href="${link}" class="btn">Activer mon compte</a>
    <div class="note">Si le bouton ne fonctionne pas, copiez ce lien : ${link}</div>
  `);

  await transporter.sendMail({ from: FROM, to: email, subject: 'Activez votre compte', html });
};

export const sendPasswordResetEmail = async (email, firstName, token) => {
  const link = `${BASE_URL}/reset-password.html?token=${token}`;
  const html = emailTemplate('Réinitialisation', `
    <h1>Réinitialiser votre mot de passe</h1>
    <a href="${link}" class="btn">Réinitialiser</a>
  `);

  await transporter.sendMail({ from: FROM, to: email, subject: 'Réinitialisation de mot de passe', html });
};
