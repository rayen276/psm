import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserDto } from '../../core/models/psm.models';
import { NotifyService } from '../../core/services/notify.service';
import { SessionService } from '../../core/services/session.service';
import { UserService } from '../../core/services/user.service';
import { ApiError } from '../../core/helpers/error.interceptor';

/** Gestion des utilisateurs : page reservee a l'ADMIN (RoleGuard + SecurityConfig cote API). */
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {

  users: UserDto[] = [];
  allRoles: string[] = [];
  loading = true;
  error = '';

  search = '';
  page = 1;
  readonly pageSize = 10;

  form!: FormGroup;
  editing: UserDto | null = null;
  selectedRoles = new Set<string>();
  submitted = false;
  saving = false;
  formError = '';

  @ViewChild('formModal') formModal!: TemplateRef<unknown>;
  private modalRef?: NgbModalRef;

  constructor(private api: UserService, private fb: FormBuilder, private modal: NgbModal,
              private notify: NotifyService, public session: SessionService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      tel: ['']
    });
    this.api.getRoles().subscribe({ next: r => this.allRoles = r });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: list => { this.users = list; this.loading = false; },
      error: (err: ApiError) => { this.error = err.message; this.loading = false; }
    });
  }

  get filtered(): UserDto[] {
    const q = this.search.trim().toLowerCase();
    if (!q) { return this.users; }
    return this.users.filter(u =>
      [u.nom, u.prenom, u.email, u.tel].some(v => (v ?? '').toLowerCase().includes(q)));
  }

  get paged(): UserDto[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  isSelf(u: UserDto): boolean {
    return u.email === this.session.user?.email;
  }

  openForm(user: UserDto): void {
    this.submitted = false;
    this.formError = '';
    this.editing = user;
    this.selectedRoles = new Set(user.roles);
    this.form.reset({ nom: user.nom, prenom: user.prenom, tel: user.tel ?? '' });
    this.modalRef = this.modal.open(this.formModal, { centered: true });
  }

  toggleRole(role: string, checked: boolean): void {
    checked ? this.selectedRoles.add(role) : this.selectedRoles.delete(role);
  }

  save(): void {
    this.submitted = true;
    this.formError = '';
    if (this.form.invalid || !this.editing) { return; }
    if (this.selectedRoles.size === 0) {
      this.formError = 'Selectionnez au moins un role';
      return;
    }

    this.saving = true;
    const v = this.form.value;
    this.api.update(this.editing.id, { nom: v.nom, prenom: v.prenom, tel: v.tel, roles: Array.from(this.selectedRoles) })
      .subscribe({
        next: () => {
          this.notify.success('Utilisateur modifie');
          this.saving = false;
          this.modalRef?.close();
          this.load();
        },
        error: (err: ApiError) => { this.formError = err.message; this.saving = false; }
      });
  }

  async remove(user: UserDto): Promise<void> {
    if (!(await this.notify.confirmDelete(`Supprimer l'utilisateur "${user.prenom} ${user.nom}" ?`))) { return; }
    this.api.delete(user.id).subscribe({
      next: () => { this.notify.success('Utilisateur supprime'); this.load(); },
      error: (err: ApiError) => this.notify.error(err.message)
    });
  }
}
