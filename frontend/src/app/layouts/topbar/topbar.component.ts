import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthenticationService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { UserDto } from '../../core/models/psm.models';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {

  element: any;
  user: UserDto | null = null;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  constructor(@Inject(DOCUMENT) private document: any, private auth: AuthenticationService,
              private session: SessionService) { }

  ngOnInit(): void {
    this.element = document.documentElement;
    this.session.user$.subscribe(u => this.user = u);
  }

  get initials(): string {
    if (!this.user) { return '?'; }
    return ((this.user.prenom?.[0] ?? '') + (this.user.nom?.[0] ?? '')).toUpperCase() || '?';
  }

  get roleLabel(): string {
    if (!this.user) { return ''; }
    return this.user.roles.includes('ADMIN') ? 'Administrateur' : 'Collaborateur';
  }

  /** Ouvre / ferme le menu lateral (mobile + condense). */
  toggleMobileMenu(event: any) {
    document.querySelector('.hamburger-icon')?.classList.toggle('open');
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
    if (document.documentElement.clientWidth <= 1024) {
      if (document.documentElement.getAttribute('data-layout') == 'vertical') {
        (document.documentElement.getAttribute('data-sidebar-size') == 'sm')
          ? document.documentElement.setAttribute('data-sidebar-size', 'lg')
          : document.documentElement.setAttribute('data-sidebar-size', 'sm');
      }
    }
    if (document.documentElement.clientWidth <= 767) {
      document.body.classList.toggle('vertical-sidebar-enable');
      document.documentElement.setAttribute('data-sidebar-size', 'lg');
    }
  }

  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (!document.fullscreenElement) {
      this.element.requestFullscreen?.();
    } else {
      this.document.exitFullscreen?.();
    }
  }

  /** Bascule theme clair / sombre. */
  toggleMode() {
    const dark = document.documentElement.getAttribute('data-layout-mode') === 'dark';
    document.documentElement.setAttribute('data-layout-mode', dark ? 'light' : 'dark');
    document.documentElement.setAttribute('data-sidebar', 'dark');
  }

  logout() {
    this.auth.logout();
  }

  windowScroll() {
    const btn = document.getElementById('back-to-top');
    const scrolled = document.body.scrollTop > 100 || document.documentElement.scrollTop > 100;
    if (btn) { btn.style.display = scrolled ? 'block' : 'none'; }
    const header = document.getElementById('page-topbar');
    scrolled ? header?.classList.add('topbar-shadow') : header?.classList.remove('topbar-shadow');
  }
}
