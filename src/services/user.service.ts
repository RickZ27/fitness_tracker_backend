import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";


let userRepository = new UserRepository();

export class UserService {

  async createUser(data: CreateUserDTO) {
    // Check if email already exists
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }

    // Check if username already exists
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    } 

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    // Create user
    const newUser = await userRepository.createUser({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      username: data.username,
      role: data.role || "user",
    });

    return newUser;
  }


  async loginUser(data: LoginUserDTO) {
    // Find user by email
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // Compare password
    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    // Generate JWT
    const payload = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return { token, user };
  }
}
