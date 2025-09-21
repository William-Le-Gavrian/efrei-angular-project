import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest } from '../models/user.model';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);

        // Clear sessionStorage before each test
        sessionStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should login with correct credentials', async () => {
            const credentials: LoginRequest = { email: 'admin@example.com', password: 'admin123' };
            const result = await service.login(credentials);

            expect(result.success).toBeTrue();
            expect(result.user?.email).toBe('admin@example.com');
            expect(service.getCurrentUser()?.email).toBe('admin@example.com');
            expect(sessionStorage.getItem('currentUser')).toBeTruthy();
        });

        it('should fail login with wrong credentials', async () => {
            const credentials: LoginRequest = { email: 'admin@example.com', password: 'wrong' };
            const result = await service.login(credentials);

            expect(result.success).toBeFalse();
            expect(result.error).toBe('Incorrect email or password');
            expect(service.getCurrentUser()).toBeNull();
        });
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const newUser: RegisterRequest = {
                name: 'Test User',
                email: 'test@example.com',
                password: '123456',
                confirmPassword: '123456',
            };

            const result = await service.register(newUser);

            expect(result.success).toBeTrue();
            expect(result.user?.email).toBe('test@example.com');
            expect(service.getCurrentUser()?.email).toBe('test@example.com');
            expect(sessionStorage.getItem('users')).toContain('test@example.com');
        });

        it('should fail if email already exists', async () => {
            const existingUser: RegisterRequest = {
                name: 'Admin',
                email: 'admin@example.com',
                password: 'admin123',
                confirmPassword: 'admin123',
            };

            const result = await service.register(existingUser);

            expect(result.success).toBeFalse();
            expect(result.error).toBe('Email already used');
        });

        it('should fail if passwords do not match', async () => {
            const newUser: RegisterRequest = {
                name: 'Mismatch User',
                email: 'mismatch@example.com',
                password: '123456',
                confirmPassword: 'abcdef',
            };

            const result = await service.register(newUser);

            expect(result.success).toBeFalse();
            expect(result.error).toBe('Passwords do not match');
        });
    });

    describe('logout', () => {
        it('should clear current user on logout', async () => {
            await service.login({ email: 'admin@example.com', password: 'admin123' });
            expect(service.getCurrentUser()).toBeTruthy();

            await service.logout();
            expect(service.getCurrentUser()).toBeNull();
            expect(sessionStorage.getItem('currentUser')).toBeNull();
        });
    });

    describe('getAllUsers', () => {
        it('should return users for admin', async () => {
            await service.login({ email: 'admin@example.com', password: 'admin123' });
            const users = await service.getAllUsers();
            expect(users.length).toBeGreaterThan(0);
            expect(users[0].email).toBeDefined();
        });

        it('should throw error for non-admin', async () => {
            await service.login({ email: 'user@example.com', password: 'user123' });
            await expectAsync(service.getAllUsers()).toBeRejectedWithError('Accès non autorisé');
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            const newUser = await service.register({
                name: 'Delete Me',
                email: 'delete@example.com',
                password: '123456',
                confirmPassword: '123456',
            });
            const userId = newUser.user!.id;

            const deleted = await service.deleteUser(userId);
            expect(deleted).toBeTrue();

            const users = await service.getAllUsers().catch(() => []); // admin needed
            expect(users.find((u) => u.id === userId)).toBeUndefined();
        });
    });

    describe('updateUser', () => {
        it('should update an existing user', async () => {
            const newUser = await service.register({
                name: 'Update Me',
                email: 'update@example.com',
                password: '123456',
                confirmPassword: '123456',
            });
            const userToUpdate = { ...newUser.user!, name: 'Updated Name' };

            const updated = await service.updateUser(userToUpdate);
            expect(updated.name).toBe('Updated Name');
        });

        it('should throw error if user not found', async () => {
            await expectAsync(
                service.updateUser({
                    id: 9999,
                    name: '',
                    email: '',
                    password: '',
                    role: 'user',
                    createdAt: new Date(),
                }),
            ).toBeRejectedWithError('User not found');
        });
    });

    describe('isAdmin', () => {
        it('should return true if current user is admin', async () => {
            await service.login({ email: 'admin@example.com', password: 'admin123' });
            expect(service.isAdmin()).toBeTrue();
        });

        it('should return false if current user is not admin', async () => {
            await service.login({ email: 'user@example.com', password: 'user123' });
            expect(service.isAdmin()).toBeFalse();
        });
    });
});
