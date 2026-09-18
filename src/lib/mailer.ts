/**
 * Mailer abstraction. Replace the console transport with a real provider
 * (SMTP, SES, ...) in production by implementing `sendMail`.
 */
export type MailMessage = {
  to: string;
  subject: string;
  html: string;
};

export const sendMail = async (message: MailMessage): Promise<void> => {
  if (process.env.NODE_ENV === "test") return;

  console.info(
    `[MAIL] to=${message.to} subject="${message.subject}"\n${message.html}`,
  );
};
