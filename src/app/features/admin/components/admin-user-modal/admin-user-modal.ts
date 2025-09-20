import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    signal,
    SimpleChanges,
} from '@angular/core';
import { DisplayUser } from '../../../auth/models/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
    selector: 'app-admin-user-modal',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <div
            class="modal fade"
            id="modalEditUser"
            aria-labelledby="editUserModalLabel"
            aria-hidden="true"
        >
            <div class="modal-dialog">
                <div class="modal-content py-3 px-4">
                    <div class="modal-header">
                        <h1>Edit User</h1>
                    </div>
                    <div class="modal-body">
                        <form [formGroup]="editUserForm" (ngSubmit)="onSubmit()">
                            <label for="name" class="form-label fs-5">Name</label>
                            <input
                                type="text"
                                name="name"
                                formControlName="name"
                                class="form-control fs-5"
                            />

                            <label for="email" class="form-label fs-5">Email</label>
                            <input
                                type="email"
                                name="email"
                                formControlName="email"
                                class="form-control fs-5"
                            />

                            <label for="role" class="form-label fs-5">Role</label>
                            <select name="role" formControlName="role" class="form-select fs-5">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>

                            <div class="mt-3 d-flex gap-2 justify-content-center">
                                <button
                                    type="submit"
                                    data-bs-dismiss="modal"
                                    class="btn btn-outline-primary"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    class="btn btn-danger"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class AdminUserModal implements OnChanges {
    @Input() user!: DisplayUser;
    @Input() users = signal<DisplayUser[]>([]);
    @Input() isDelete!: boolean;
    @Output() save = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    private formBuilder = inject(FormBuilder);
    private authService = inject(AuthService);
    editUserForm: FormGroup;

    constructor() {
        this.editUserForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            role: ['user', [Validators.required]],
        });
    }

    /**
     * When the Input user chnages thanks to the parent admin-component, the form is
     * filled with the user's infos
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['user'] && this.user) {
            this.editUserForm.patchValue(this.user);
        }
    }

    /**
     * When the form is submitted, the user is updated, the save Output emits to its
     * parent to reload the users, and the close Output emits to its parent to unset the
     * user to update (signal editingUser --> null)
     */
    async onSubmit() {
        if (this.editUserForm.valid) {
            try {
                const updatedUser = {
                    ...this.user,
                    ...this.editUserForm.value,
                };

                await this.authService.updateUser(updatedUser);
                this.save.emit();
                this.closed.emit();
            } catch (error) {
                throw new Error('An error occured while updating the user' + error);
            }
        }
    }
}
