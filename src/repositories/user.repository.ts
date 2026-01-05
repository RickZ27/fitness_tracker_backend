import { UserModel, IUser } from "../models/user.model";

// Interface for repository (teacher-style)
export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByPhone(phone: string): Promise<IUser | null>;
  getUserById(id: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

// MongoDB Implementation
export class UserRepository implements IUserRepository {
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserByPhone(phone: string): Promise<IUser | null> {
    return await UserModel.findOne({ phone });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
