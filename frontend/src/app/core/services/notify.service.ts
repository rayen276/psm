import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/** Petites notifications (toast) et confirmations, basees sur SweetAlert2 (deja dans le template). */
@Injectable({ providedIn: 'root' })
export class NotifyService {

  success(message: string): void { this.toast('success', message); }
  error(message: string): void { this.toast('error', message); }
  warning(message: string): void { this.toast('warning', message); }

  private toast(icon: 'success' | 'error' | 'warning', title: string): void {
    Swal.fire({
      toast: true, position: 'top-end', icon, title,
      showConfirmButton: false, timer: 3500, timerProgressBar: true
    });
  }

  /** Renvoie true si l'utilisateur confirme. */
  async confirmDelete(text: string): Promise<boolean> {
    const res = await Swal.fire({
      title: 'Etes-vous sur ?', text, icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler',
      confirmButtonColor: '#f06548'
    });
    return res.isConfirmed;
  }
}
