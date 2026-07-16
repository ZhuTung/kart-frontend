import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Gender } from '../../models/user';
import { DatePicker } from '../../shared/components/date-picker/date-picker';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, DatePicker],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly fieldErrors = signal<string[]>([]);
  readonly maxDate = new Date().toISOString().split('T')[0];

  readonly genders: { value: Gender; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: ['' as Gender | '', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');
    this.fieldErrors.set([]);

    this.auth
      .register({
        username: raw.username,
        password: raw.password,
        firstName: raw.firstName,
        lastName: raw.lastName,
        dateOfBirth: raw.dateOfBirth,
        gender: raw.gender as Gender,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Registration failed. Please try again.');
          if (err.error?.errors) {
            this.fieldErrors.set(err.error.errors);
          }
        },
      });
  }
}
