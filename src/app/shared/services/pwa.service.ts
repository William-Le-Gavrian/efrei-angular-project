import { Injectable, signal, computed, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { ErrorService } from './error.service';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;

    prompt(): Promise<void>;
}

interface NavigatorWithStandalone extends Navigator {
    standalone?: boolean;
}
@Injectable({
    providedIn: 'root',
})
export class PwaService {
    private swUpdate = inject(SwUpdate);
    private errorService = inject(ErrorService);

    // Signals for PWA state
    private deferredPrompt = signal<BeforeInstallPromptEvent | null>(null);
    private isInstalled = signal<boolean>(false);
    private isOnline = signal<boolean>(navigator.onLine);
    private updateAvailable = signal<boolean>(false);

    // Computed for state install
    canInstall = computed(() => !!this.deferredPrompt() && !this.isInstalled());

    // État public readonly
    readonly installPrompt = this.deferredPrompt.asReadonly();
    readonly installed = this.isInstalled.asReadonly();
    readonly online = this.isOnline.asReadonly();
    readonly hasUpdate = this.updateAvailable.asReadonly();

    constructor() {
        this.initializePwa();
        this.setupNetworkListener();
        this.setupUpdateListener();
    }

    /**
     * Initialize PWA events
     */
    private initializePwa(): void {
        // Install event detection
        window.addEventListener('beforeinstallprompt', (event: Event) => {
            console.warn('[PWA] Installation prompt available');
            event.preventDefault();
            this.deferredPrompt.set(event as BeforeInstallPromptEvent);
        });

        // Detect if the app is already installed
        window.addEventListener('appinstalled', () => {
            console.warn('[PWA] App installed successfully');
            this.isInstalled.set(true);
            this.deferredPrompt.set(null);
            this.errorService.showInfo('Application installée avec succès !');
        });

        // Initial verif if the app is in standalone mode
        this.checkIfInstalled();
    }

    /**
     * Verif if l'app is in standalone mode (installed)
     */
    private checkIfInstalled(): void {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebAppiOS = (window.navigator as NavigatorWithStandalone).standalone;

        if (isStandalone || isInWebAppiOS) {
            this.isInstalled.set(true);
            console.warn('[PWA] App is running in standalone mode');
        }
    }

    /**
     * Configure network status listening
     */
    private setupNetworkListener(): void {
        window.addEventListener('online', () => {
            this.isOnline.set(true);
            console.warn('[PWA] Network: Online');
            this.errorService.showInfo('Connexion rétablie');
        });

        window.addEventListener('offline', () => {
            this.isOnline.set(false);
            console.warn('[PWA] Network: Offline');
            this.errorService.showWarning('Mode hors ligne activé');
        });
    }

    /**
     * Configure worker service update listening
     */
    private setupUpdateListener(): void {
        if (this.swUpdate.isEnabled) {
            // Updates verif
            this.swUpdate.versionUpdates
                .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
                .subscribe(() => {
                    console.warn('[PWA] New version available');
                    this.updateAvailable.set(true);
                    this.errorService.showInfo('Nouvelle version disponible !');
                });

            setInterval(
                () => {
                    this.swUpdate
                        .checkForUpdate()
                        .then((hasUpdate) => {
                            if (hasUpdate) {
                                console.warn('[PWA] Update check: New version found');
                            }
                        })
                        .catch((error) => {
                            console.error('[PWA] Update check failed:', error);
                        });
                },
                6 * 60 * 60 * 1000,
            );
        }
    }

    /**
     * Ask for app install
     */
    async installApp(): Promise<boolean> {
        const prompt = this.deferredPrompt();
        if (!prompt) {
            console.warn('[PWA] No install prompt available');
            return false;
        }

        try {
            await prompt.prompt();
            const { outcome } = await prompt.userChoice;

            console.warn(`[PWA] Install prompt result: ${outcome}`);

            if (outcome === 'accepted') {
                this.errorService.showInfo('Installation en cours...');
                return true;
            } else {
                this.errorService.showInfo('Installation annulée');
                return false;
            }
        } catch (error) {
            console.error('[PWA] Install error:', error);
            this.errorService.showError("Erreur lors de l'installation");
            return false;
        }
    }

    /**
     * Activate service worker update
     */
    async activateUpdate(): Promise<void> {
        if (!this.swUpdate.isEnabled || !this.updateAvailable()) {
            return;
        }

        try {
            await this.swUpdate.activateUpdate();
            this.updateAvailable.set(false);
            this.errorService.showInfo('Mise à jour appliquée, rechargement...');

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('[PWA] Update activation failed:', error);
            this.errorService.showError('Erreur lors de la mise à jour');
        }
    }
}
