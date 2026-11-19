import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Client, Projet } from '../../core/models/psm.models';
import { ClientService } from '../../core/services/client.service';
import { NotifyService } from '../../core/services/notify.service';
import { ProjetService } from '../../core/services/projet.service';
import { SessionService } from '../../core/services/session.service';
import { ApiError } from '../../core/helpers/error.interceptor';

@Component({
  selector: 'app-projets',
  templateUrl: './projets.component.html'
})
export class ProjetsComponent implements OnInit {

  projets: Projet[] = [];
  clients: Client[] = [];
  loading = true;
  error = '';

  search = '';
  clientFilter: number | '' = '';
  page = 1;
  readonly pageSize = 10;

  form!: FormGroup;
  editingId: number | null = null;
  submitted = false;
  saving = false;
  formError = '';

  @ViewChild('formModal') formModal!: TemplateRef<unknown>;
  private modalRef?: NgbModalRef;

  constructor(private api: ProjetService, private clientApi: ClientService, private fb: FormBuilder,
              private modal: NgbModal, private notify: NotifyService, public session: SessionService) { }

  get isAdmin(): boolean { return this.session.isAdmin; }

  ngOnInit(): void {
    this.form = this.fb.group({
      libelle: ['', Validators.required],
      budget: [null, [Validators.required, Validators.min(0)]],
      duree: [null, [Validators.required, Validators.min(1)]],
      clientId: [null, Validators.required],
      description: ['']
    });
    this.clientApi.getAll().subscribe({ next: list => this.clients = list });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: list => { this.projets = list; this.loading = false; },
      error: (err: ApiError) => { this.error = err.message; this.loading = false; }
    });
  }

  get filtered(): Projet[] {
    const q = this.search.trim().toLowerCase();
    return this.projets.filter(p =>
      (this.clientFilter === '' || p.clientId === Number(this.clientFilter)) &&
      (!q || [p.libelle, p.clientNom, p.description].some(v => (v ?? '').toLowerCase().includes(q))));
  }

  get paged(): Projet[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  openForm(projet?: Projet): void {
    this.submitted = false;
    this.formError = '';
    this.editingId = projet?.id ?? null;
    this.form.reset({
      libelle: projet?.libelle ?? '',
      budget: projet?.budget ?? null,
      duree: projet?.duree ?? null,
      clientId: projet?.clientId ?? null,
      description: projet?.description ?? ''
    });
    this.modalRef = this.modal.open(this.formModal, { centered: true });
  }

  save(): void {
    this.submitted = true;
    this.formError = '';
    if (this.form.invalid) { return; }

    this.saving = true;
    const v = this.form.value;
    const payload: Projet = {
      libelle: v.libelle, budget: Number(v.budget), duree: Number(v.duree),
      clientId: Number(v.clientId), description: v.description
    };
    const call = this.editingId
      ? this.api.update(this.editingId, payload)
      : this.api.create(payload);

    call.subscribe({
      next: () => {
        this.notify.success(this.editingId ? 'Projet modifie' : 'Projet ajoute');
        this.saving = false;
        this.modalRef?.close();
        this.load();
      },
      error: (err: ApiError) => { this.formError = err.message; this.saving = false; }
    });
  }

  async remove(projet: Projet): Promise<void> {
    if (!(await this.notify.confirmDelete(`Supprimer le projet "${projet.libelle}" ?`))) { return; }
    this.api.delete(projet.id!).subscribe({
      next: () => { this.notify.success('Projet supprime'); this.load(); },
      error: (err: ApiError) => this.notify.error(err.message)
    });
  }
}
