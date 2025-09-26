import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
    selector: 'app-pwa-prompt',
    standalone: true,
    imports: [CommonModule],
    template: `
        <!-- Prompt d'installation -->
        @if (pwaService.canInstall() && show()) {
            <div
                class="position-fixed bottom-0 start-0 end-0 mb-3 ms-md-auto me-md-3 z-3"
                style="max-width: 400px;"
            >
                <div class="bg-primary text-white p-3 rounded shadow border border-primary">
                    <div class="d-flex align-items-start gap-2">
                        <div class="flex-shrink-0 mt-1">
                            <svg
                                class="me-2"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <div class="flex-grow-1">
                            <h4 class="fw-semibold fs-6 mb-1">Installer l'application</h4>
                            <p class="text-white-50 small mb-2">
                                Accédez rapidement à TodoList depuis votre écran d'accueil
                            </p>
                            <div class="d-flex gap-2">
                                <button
                                    (click)="installApp()"
                                    class="btn btn-light btn-sm fw-medium"
                                >
                                    Installer
                                </button>
                                <button
                                    (click)="dismissPrompt()"
                                    class="btn btn-link btn-sm text-white-50"
                                >
                                    Plus tard
                                </button>
                            </div>
                        </div>
                        <button
                            (click)="dismissPrompt()"
                            class="btn btn-link btn-sm text-white-50 p-0 ms-2"
                        >
                            <svg
                                width="16"
                                height="16"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        }

        <!-- Notification de mise à jour -->
        @if (pwaService.hasUpdate()) {
            <div
                class="position-fixed top-0 start-0 end-0 mt-3 ms-md-auto me-md-3 z-3"
                style="max-width: 400px;"
            >
                <div class="bg-success text-white p-3 rounded shadow border border-success">
                    <div class="d-flex align-items-start gap-2">
                        <div class="flex-shrink-0 mt-1">
                            <svg
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                        </div>
                        <div class="flex-grow-1">
                            <h4 class="fw-semibold fs-6 mb-1">Mise à jour disponible</h4>
                            <p class="text-white-50 small mb-2">
                                Une nouvelle version de l'application est prête
                            </p>
                            <div class="d-flex gap-2">
                                <button
                                    (click)="updateApp()"
                                    class="btn btn-light btn-sm fw-medium"
                                >
                                    Mettre à jour
                                </button>
                                <button
                                    (click)="dismissUpdate()"
                                    class="btn btn-link btn-sm text-white-50"
                                >
                                    Plus tard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }

        <!-- Indicateur hors ligne -->
        @if (!pwaService.online()) {
            <div class="position-fixed top-0 start-0 end-0 z-2">
                <div class="bg-warning text-white text-center py-2 px-3">
                    <div class="d-flex align-items-center justify-content-center gap-2 small">
                        <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.5v19M12 2.5a9.5 9.5 0 110 19M12 2.5a9.5 9.5 0 010 19"
                            />
                        </svg>
                        <span>Mode hors ligne - Vos données sont synchronisées localement</span>
                    </div>
                </div>
            </div>
        }
    `,
})
export class PwaPromptComponent {
    public pwaService = inject(PwaService);
    show = signal<boolean>(true);

    async installApp(): Promise<void> {
        await this.pwaService.installApp();
    }

    async updateApp(): Promise<void> {
        await this.pwaService.activateUpdate();
    }

    dismissPrompt(): void {
        this.show.set(false);
    }

    dismissUpdate(): void {
        this.show.set(false);
    }
}
