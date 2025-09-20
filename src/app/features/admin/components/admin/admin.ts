import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { DisplayUser } from '../../../auth/models/user.model';
import { AdminUserModal } from '../admin-user-modal/admin-user-modal';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, AdminUserModal],
    template: `
        <div class="container my-4">
            <h2 class="fs-1 fw-medium">Admin Dashboard</h2>

            <!--          <div class="d-flex">-->
            <!--              <nav>-->
            <!--                  <button-->
            <!--                      type="button"-->
            <!--                      class="btn btn-outline-dark"-->
            <!--                      [class.bg-dark]="activeTab() === 'users'"-->
            <!--                      [class.text-white]="activeTab() === 'users'"-->
            <!--                  >-->
            <!--                      Users-->
            <!--                  </button>-->
            <!--              </nav>-->
            <!--          </div>-->

            <ul>
                <li class="row align-items-center" style="height: 3rem">
                    <div class="col-2">ID</div>
                    <div class="col-3">Email</div>
                    <div class="col-3">Name</div>
                    <div class="col-1">Rôle</div>
                    <div class="d-flex justify-content-end gap-2 col-3">Actions</div>
                </li>
                @for (user of users(); track user.id) {
                    <li
                        class="row align-items-center"
                        [class.bg-primary-subtle]="$even"
                        style="height: 3rem"
                    >
                        <div class="col-2">{{ user.id }}</div>
                        <div class="col-3">{{ user.email }}</div>
                        <div class="col-3">{{ user.name }}</div>
                        <div class="col-1">{{ user.role }}</div>
                        <div class="d-flex justify-content-end gap-2 col-3">
                            <button
                                type="button"
                                class="btn btn-outline-dark"
                                data-bs-toggle="modal"
                                data-bs-target="#modalEditUser"
                                (click)="onEdit(user)"
                            >
                                E
                            </button>
                            <button
                                type="button"
                                class="btn btn-danger"
                                (click)="deleteUser(user.id)"
                            >
                                D
                            </button>
                        </div>
                    </li>
                }
            </ul>

            <app-admin-user-modal
                [user]="editingUser()!"
                [users]="users"
                (save)="loadUsers()"
                (closed)="editingUser.set(null)"
            >
            </app-admin-user-modal>
        </div>
    `,
})
export class Admin implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    users = signal<DisplayUser[]>([]);
    editingUser = signal<DisplayUser | null>(null);

    async ngOnInit() {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            await this.router.navigate(['/transactions']);
            return;
        }
        await this.loadUsers();
    }

    async loadUsers() {
        try {
            this.users.set(await this.authService.getAllUsers());
        } catch (error) {
            throw new Error('An error occured while retrieving the users: ' + error);
        }
    }

    async deleteUser(userId: number) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await this.authService.deleteUser(userId);
                await this.loadUsers();
            } catch (error) {
                throw new Error('An error occured while deleting the user' + error);
            }
        }
    }

    onEdit(user: DisplayUser) {
        this.editingUser.set(user);
    }
}
