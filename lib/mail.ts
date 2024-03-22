import { Resend } from "resend";
//import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);

const adress = process.env.EMAIL_SENDING_ADRESS as string;

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    //from: "mail@auth-masterclass-tutorial.com",
    from: adress,
    to: email,
    subject: "2FA Code",
    html: `<p>Your two factor authentication code: ${token}</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    //from: "mail@auth-masterclass-tutorial.com",
    from: adress,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    //from: "mail@auth-masterclass-tutorial.com",
    // from: "lap04635@gmail.com",
    from: adress,
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
};

/* export const NEWsendVerificationEmail = async (
  email: string,
  token: string
) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  console.log("confirmLink from sendVerificationEmail: ", confirmLink);

  const transporter = nodemailer.createTransport({
    service: "gmail", //old
    port: 465, //new
    host: "smtp.gmail.com", //new
    secure: true, //new
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
  //console.log("transporter: ", transporter);
  // verify connection configuration
  try {
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        console.log("verify connection configuration");
        if (error) {
          console.log("error:", error);
          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    let mailOptions = {
      from: `Auth tut ${process.env.EMAIL_FROM}`,
      to: email,
      subject: "Confirm email",
      text: confirmLink,
      html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
    };
    // html: `Click on the link to reset the password ${link}`, //new
    //console.log("mailOptions: ", mailOptions);

    const prom = await new Promise((resolve, reject) => {
      // send mail
      transporter.sendMail(mailOptions, (err, info) => {
        console.log("Email sent: " + info.response);
        if (err) {
          console.error(err);
          reject(err);
          //return "error";
        } else {
          // res          .status(200)          .send({ message: "Success from transporter.sendMail" });
          //console.log("info from transporter.sendMail", info);
          resolve(info);
          //return "success";
        }
      });
    });
    console.log(" result of verification email sending: ", prom);
    if (prom.accepted && prom.accepted?.length > 0) {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    return "error";
  }
};
 */
