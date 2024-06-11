import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import bcrypt from 'bcrypt';

export class CreateUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(email: string, username: string, displayName: string, dateOfBirth: Date, password: string): Promise<User> {
        const existingUser = await this.userRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User('', email, username, displayName, dateOfBirth, hashedPassword);
        const response = this.userRepository.createUser(user);        
        return user
    }
}
