import { UserModel } from "../models/user.model";


  export class AuthRepository {

    async setOtp(email: string, otp: string, expires: Date): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        $set: {
          otp,
          otp_expires: expires,
        },
      }
    );
  }

  async updatePasswordAndClearOtp(
    email: string,
    hashedPassword: string
  ): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        $set: { password: hashedPassword },
        $unset: { otp: "", otp_expires: "" },
      }
    );
  }

  }