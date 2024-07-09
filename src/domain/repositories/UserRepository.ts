// userRepository.ts

import { User } from "../entities/User";

export interface UserRepository {
  createUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  verifyUser(userId: string): Promise<User>;
  updateUser(userId: string, updateData: Partial<User>): Promise<User>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  // findUserByUsername(username: string): Promise<User>
}
