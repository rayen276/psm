import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { ApiError } from '../../core/helpers/error.interceptor';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  fieldTextType = false;
  returnUrl = '/';
  year = new Date().getFullYear();

  constructor(private fb: FormBuilder, private auth: AuthenticationService, private session: SessionService,
              private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Deja connecte -> directement vers l'application
    if (this.session.isLoggedIn()) {
      this.router.navigate(['/']);
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get f() { return this.loginForm.controls; }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.loginForm.invalid) { return; }

    this.loading = true;
    this.auth.login(this.f['email'].value, this.f['password'].value).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: (err: ApiError) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
