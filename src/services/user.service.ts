import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { AuthRepository } from "../repositories/auth.repository";
import { emailService } from "./email.service";
import bcrypt from "bcryptjs";
import { generateOtp } from "../utils/getOtp";

let userRepository = new UserRepository();
let authRepo = new AuthRepository();

export class UserService {


    async forgotPassword(email: string) {
    const user = await userRepository.getUserByEmail(email);

    if (!user) return null;

    const otp = generateOtp(6);
    const expires = new Date(Date.now() + 3 * 60 * 1000);

    await authRepo.setOtp(email, otp, expires);

    await emailService.sendEmail(
      email,
      "Password Reset OTP",
      `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 3 minutes.</p>
      `
    );

    const token = jwt.sign({ email }, "3m");

    return token;
  }

  async resetPassword(token: string, otp: string, newPassword: string) {
    let email: string;

    try {
      const decoded = jwt.verify(token, "3m");
      email = (decoded as any).email;
    } catch {
      throw new HttpError(400,"Invalid or expired token");
    }

    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      throw new HttpError(400,"Invalid token");
    }

    if (
      !user.otp ||
      user.otp !== otp ||
      !user.otp_expires ||
      user.otp_expires < new Date()
    ) {
      throw new HttpError(400,"Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authRepo.updatePasswordAndClearOtp(email, hashedPassword);

    return true;
  }

    async createUser(data: CreateUserDTO){
        // business logic before creating user
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        // create user
        const newUser = await userRepository.createUser(data);
        return newUser;
    }



    async loginUser(data: LoginUserDTO){
        const user =  await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        // plaintext, hashed
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        // generate jwt
        const payload = { // user identifier
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); // 30 days
        return { token, user }
    }

     async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(userId: string, data: UpdateUserDTO) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if(user.email !== data.email){
            const emailExists = await userRepository.getUserByEmail(data.email!);
            if(emailExists){
                throw new HttpError(403, "Email already in use");
            }
        }
        if(user.username !== data.username){
            const usernameExists = await userRepository.getUserByUsername(data.username!);
            if(usernameExists){
                throw new HttpError(403, "Username already in use");
            }
        }
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUser(userId, data);
        return updatedUser;
    }
}