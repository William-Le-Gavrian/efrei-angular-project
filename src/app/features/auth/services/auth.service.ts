import { Injectable, signal } from '@angular/core';
import { User, LoginRequest, RegisterRequest, DisplayUser } from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private defaultUsers = signal<User[]>([
        {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date(),
        },
        {
            id: 2,
            name: 'User',
            email: 'user@example.com',
            password: 'user123',
            role: 'user',
            createdAt: new Date(),
        },
    ]);

    private defaultPasswords: Record<string, string> = {
        'admin@example.com': 'admin123',
        'user@example.com': 'user123',
    };

    public currentUser = signal<User | null>(null);
    private users = signal<User[]>(this.defaultUsers());
    private passwords: Record<string, string> = { ...this.defaultPasswords };

    constructor() {
        this.loadUsersFromStorage();
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async login(
        credentials: LoginRequest,
    ): Promise<{ success: boolean; user?: User; error?: string }> {
        await this.delay(500);

        const user = this.users().find(
            (u) => u.email === credentials.email && u.password === credentials.password,
        );

        if (user) {
            this.currentUser.set(user);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user };
        } else {
            return { success: false, error: 'Incorrect email or password' };
        }
    }

    async register(
        userData: RegisterRequest,
    ): Promise<{ success: boolean; user?: User; error?: string }> {
        await this.delay(600);

        // Check if a user already uses the email
        if (this.users().some((u) => u.email === userData.email)) {
            return { success: false, error: 'Email already used' };
        }

        // Check if password and confrimPassword match
        if (userData.password !== userData.confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }

        const newUser: User = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 'user',
            createdAt: new Date(),
        };

        this.users.update((users) => [...users, newUser]);
        this.passwords[newUser.email] = newUser.password;
        this.currentUser.set(newUser);

        this.saveUsersToStorage();

        return { success: true, user: newUser };
    }

    async logout(): Promise<void> {
        await this.delay(200);
        this.currentUser.set(null);
        sessionStorage.removeItem('currentUser');
    }

    // GET - Check if the user is logged in
    isAuthenticated(): boolean {
        return this.currentUser() !== null;
    }

    // GET - Get the logged user
    getCurrentUser(): User | null {
        return this.currentUser();
    }

    // GET - Check if the logged user has the role admin
    isAdmin(): boolean {
        return this.currentUser()?.role === 'admin';
    }

    async getAllUsers(): Promise<DisplayUser[]> {
        await this.delay(400);

        if (!this.isAdmin()) {
            throw new Error('Accès non autorisé');
        }

        return this.users().map(({ id, name, email, role }) => ({
            id,
            name,
            email,
            role,
        }));
    }

    async deleteUser(userId: number): Promise<boolean> {
        this.users.update((users) => users.filter((user: User) => user.id !== userId));
        return true;
    }

    async updateUser(userData: User): Promise<User> {
        let updatedUser: User | null = null;

        this.users.update((users) => {
            return users.map((user) => {
                if (user.id === userData.id) {
                    updatedUser = {
                        ...user,
                        ...userData,
                    };
                    return updatedUser;
                }
                return user;
            });
        });

        if (!updatedUser) throw new Error('User not found');

        return updatedUser;
    }

    private saveUsersToStorage() {
        sessionStorage.setItem('users', JSON.stringify(this.users()));
        sessionStorage.setItem('usersPasswords', JSON.stringify(this.passwords));
    }

    private loadUsersFromStorage() {
        const savedUsers = sessionStorage.getItem('users');
        const savedPasswords = sessionStorage.getItem('usersPasswords');
        const savedCurrentUser = sessionStorage.getItem('currentUser');

        if (savedUsers && savedPasswords) {
            this.users.set(JSON.parse(savedUsers));
            this.passwords = JSON.parse(savedPasswords);
        }

        if (savedCurrentUser) {
            this.currentUser.set(JSON.parse(savedCurrentUser));
        }
    }

    private clearAllUsersData() {
        sessionStorage.removeItem('users');
        sessionStorage.removeItem('usersPasswords');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('currentUser');

        this.loadUsersFromStorage();
    }
}
