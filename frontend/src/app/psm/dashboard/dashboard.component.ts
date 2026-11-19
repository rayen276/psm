import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Projet, Stats } from '../../core/models/psm.models';
import { ProjetService } from '../../core/services/projet.service';
import { SessionService } from '../../core/services/session.service';
import { StatsService } from '../../core/services/stats.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  stats?: Stats;
  derniersProjets: Projet[] = [];
  loading = true;
  error = '';

  constructor(private statsService: StatsService, private projetService: ProjetService,
              public session: SessionService) { }

  ngOnInit(): void {
    forkJoin({ stats: this.statsService.get(), projets: this.projetService.getAll() }).subscribe({
      next: ({ stats, projets }) => {
        this.stats = stats;
        this.derniersProjets = projets.slice(0, 5);   // l'API renvoie du plus recent au plus ancien
        this.loading = false;
      },
      error: err => { this.error = err.message; this.loading = false; }
    });
  }

  /** Part du budget d'un client dans le budget total (barre de progression). */
  part(budget: number): number {
    const total = this.stats?.budgetTotal ?? 0;
    return total > 0 ? Math.round((budget / total) * 100) : 0;
  }
}
