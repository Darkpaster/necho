import type { User, UpdateUserDto } from './types';
declare class UsersService {
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    searchUsers(query: string): Promise<User[]>;
    updateOnlineStatus(isOnline: boolean): Promise<void>;
}
export declare const usersService: UsersService;
export {};
