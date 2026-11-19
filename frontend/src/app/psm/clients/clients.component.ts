import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Client } from '../../core/models/psm.models';
import { ClientService } from '../../core/services/client.service';
import { NotifyService } from '../../core/services/notify.service';
import { SessionService } from '../../core/services/session.service';
import { ApiError } from '../../core/helpers/error.interceptor';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {

  clients: Client[] = [];
  loading = true;
  error = '';

  search = '';
  page = 1;
  readonly pageSize = 10;

  form!: FormGroup;
  editingId: number | null = null;
  submitted = false;
  saving = false;
  formError = '';

  @ViewChild('formModal') formModal!: TemplateRef<unknown>;
  private modalRef?: NgbModalRef;

  constructor(private api: ClientService, private fb: FormBuilder, private modal: NgbModal,
              private notify: NotifyService, public session: SessionService) { }

  /** Modifier / Supprimer : ADMIN uniquement. Consulter / Ajouter : ADMIN + COLLABORATEUR. */
  get isAdmin(): boolean { return this.session.isAdmin; }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      tel: [''],
      email: ['', Validators.email],
      adresse: ['']
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: list => { this.clients = list; this.loading = false; },
      error: (err: ApiError) => { this.error = err.message; this.loading = false; }
    });
  }

  get filtered(): Client[] {
    const q = this.search.trim().toLowerCase();
    if (!q) { return this.clients; }
    return this.clients.filter(c =>
      [c.nom, c.email, c.tel, c.adresse].some(v => (v ?? '').toLowerCase().includes(q)));
  }

  get paged(): Client[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  openForm(client?: Client): void {
    this.submitted = false;
    this.formError = '';
    this.editingId = client?.id ?? null;
    this.form.reset({
      nom: client?.nom ?? '',
      tel: client?.tel ?? '',
      email: client?.email ?? '',
      adresse: client?.adresse ?? ''
    });
    this.modalRef = this.modal.open(this.formModal, { centered: true });
  }

  save(): void {
    this.submitted = true;
    this.formError = '';
    if (this.form.invalid) { return; }

    this.saving = true;
    const payload: Client = this.form.value;
    const call = this.editingId
      ? this.api.update(this.editingId, payload)
      : this.api.create(payload);

    call.subscribe({
      next: () => {
        this.notify.success(this.editingId ? 'Client modifie' : 'Client ajoute');
        this.saving = false;
        this.modalRef?.close();
        this.load();
      },
      error: (err: ApiError) => { this.formError = err.message; this.saving = false; }
    });
  }

  async remove(client: Client): Promise<void> {
    const extra = client.nbProjets ? ` Ses ${client.nbProjets} projet(s) seront aussi supprimes.` : '';
    if (!(await this.notify.confirmDelete(`Supprimer le client "${client.nom}" ?${extra}`))) { return; }
    this.api.delete(client.id!).subscribe({
      next: () => { this.notify.success('Client supprime'); this.load(); },
      error: (err: ApiError) => this.notify.error(err.message)
    });
  }
}
