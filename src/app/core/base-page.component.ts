import { ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SharedModels } from '@kentico/kontent-management';

import { ComponentDependencies } from '../../di';
import { environment } from '../../environments/environment';
import { BaseComponent } from './base.component';

type eventCategory = 'button';
type eventAction =
    | 'download-template'
    | 'export'
    | 'prepare-import-from-project'
    | 'prepare-import-from-file'
    | 'import-from-file'
    | 'import-from-project'
    | 'prepare-cleanup'
    | 'cleanup'
    | 'prepare-migrate-from-project'
    | 'migrate-from-project';

export abstract class BasePageComponent extends BaseComponent implements OnDestroy {
    public processsing: boolean = false;

    constructor(protected dependencies: ComponentDependencies, protected cdr: ChangeDetectorRef) {
        super(dependencies, cdr);

        dependencies.googleAnalyticsService.trackPageview({
            pageTitle: `${environment.google.trackingPrefix}${dependencies.router.url}`,
            pagePath: `${environment.google.trackingPrefix}${dependencies.router.url}`
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.resetErrors();
    }

    protected async runWithErrorHandlerAsync(func: () => Promise<void>): Promise<void> {
        try {
            await func();
        } catch (error) {
            this.processsing = false;
            if (error instanceof SharedModels.ContentManagementBaseKontentError) {
                this.setError(`${error.message} ${error.validationErrors.join(', ')}`);
            } else {
                this.setError('Unknown error during data import');
            }
            super.markForCheck();
        }
    }

    protected trackEvent(data: {
        eventCategory: eventCategory;
        eventAction: eventAction;
        eventLabel?: string;
        eventValue?: number;
    }): void {
        this.dependencies.googleAnalyticsService.logEvent(data);
    }

    protected setTitle(title: string): void {
        this.dependencies.layoutService.setTitle(title);
    }

    protected setError(error: string): void {
        this.dependencies.layoutService.setError(error);
    }

    protected resetErrors(): void {
        this.dependencies.layoutService.setError(undefined);
    }
}
