import {Directive, Input, Output, EventEmitter, OnDestroy, Inject} from '@angular/core';
import {Router, NavigationEnd, NavigationError, NavigationCancel} from '@angular/router';
import {DOCUMENT} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {IEasingFunction} from './ng2-page-scroll-config';
import {PageScrollService} from './ng2-page-scroll.service';
import {PageScrollInstance} from './ng2-page-scroll-instance';

@Directive({
    selector: '[pageScroll]',
    host: { // tslint:disable-line:use-host-property-decorator
        '(click)': 'handleClick($event)',
    },
    providers: [PageScrollService]
})
export class PageScroll implements OnDestroy {

    @Input()
    public routerLink: any;

    @Input()
    public href: string;

    @Input()
    public pageScrollOffset: number = null;

    @Input()
    public pageScrollDuration: number = null;

    @Input()
    public pageScrollEasing: IEasingFunction = null;

    @Input()
    public pageScrollInterruptible: boolean;

    @Input()
    public pageScroll: string = null;

    @Output()
    pageScrollFinish: EventEmitter<boolean> = new EventEmitter<boolean>();

    private pageScrollInstance: PageScrollInstance;

    constructor(private router: Router, @Inject(DOCUMENT) private document: any) {
    }

    ngOnDestroy(): any {
        if (this.pageScrollInstance) {
            PageScrollService.stop(this.pageScrollInstance);
        }
        return undefined;
    }

    private generatePageScrollInstance(): PageScrollInstance {
        if (PageScrollService.isUndefinedOrNull(this.pageScrollInstance)) {
            let scrollTopSources = [this.document.documentElement, this.document.body, this.document.body.parentNode];
            let anchorTarget: HTMLElement = this.document.body.ownerDocument.getElementById(this.href.substr(1));
            let namespace = this.pageScroll;
            this.pageScrollInstance = PageScrollInstance.advancedInstance(
                this.document,
                anchorTarget,
                scrollTopSources,
                namespace,
                this.pageScrollOffset,
                this.pageScrollInterruptible,
                this.pageScrollEasing,
                this.pageScrollDuration
            );
        }
        return this.pageScrollInstance;
    }

    private handleClick(clickEvent: Event): boolean { // tslint:disable-line:no-unused-variable

        if (this.routerLink) {
            // We need to navigate their first.
            // Navigation is handled by the routerLink directive
            // so we only need to listen for route change
            // Note: the change event is also emitted when navigating to the current route again
            let subscription: Subscription = <Subscription>this.router.events.subscribe((routerEvent) => {
                if (routerEvent instanceof NavigationEnd) {
                    subscription.unsubscribe();
                    PageScrollService.start(this.generatePageScrollInstance());
                } else if (routerEvent instanceof NavigationError || routerEvent instanceof NavigationCancel) {
                    subscription.unsubscribe();
                }
            });
        } else {
            PageScrollService.start(this.generatePageScrollInstance());
        }
        return false; // to preventDefault()
    }

}
