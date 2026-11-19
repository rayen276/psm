import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/services/auth.service';
import { NotifyService } from '../../core/services/notify.service';
import { ApiError } from '../../core/helpers/error.interceptor';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const p = group.get('password')?.value;
  const c = group.get('confirm')?.value;
  return p === c ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  signupForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  year = new Date().getFullYear();

  constructor(private fb: FormBuilder, private auth: AuthenticationService,
              private router: Router, private notify: NotifyService) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tel: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  get f() { return this.signupForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.signupForm.invalid) { return; }

    this.loading = true;
    const v = this.signupForm.value;
    this.auth.register({ email: v.email, password: v.password, nom: v.nom, prenom: v.prenom, tel: v.tel }).subscribe({
      next: () => {
        this.notify.success('Compte cree. Vous pouvez vous connecter.');
        this.router.navigate(['/auth/login']);
      },
      error: (err: ApiError) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
