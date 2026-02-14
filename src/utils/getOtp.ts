import crypto from "crypto";
export function generateOtp(length = 6) {
  const charset =
    "ABCDEFGHIJKLM~!@#$%^&*NOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    otp += charset[randomIndex];
  }
  return otp;
}