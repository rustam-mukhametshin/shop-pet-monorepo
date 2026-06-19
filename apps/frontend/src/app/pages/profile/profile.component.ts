import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {debounceTime, distinctUntilChanged, forkJoin, shareReplay, Subscription, take} from 'rxjs';
import {ProfileService} from './profile.service';
import {AuthService} from "../../auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  readonly profileForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    twoFA: new FormControl(false, [Validators.required]),
  });
  formSub$?: Subscription;
  profileUpdateSub$?: Subscription;

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  showTwoFAModal = false;
  twoFAQRCode: string | null = null;
  twoFASecret: string | null = null;
  isLoadingTwoFA = false;
  twoFAError = '';

  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
  }

  get nameControl() {
    return this.profileForm.controls.name;
  }

  get twoFAControl() {
    return this.profileForm.controls.twoFA;
  }

  ngOnInit(): void {
    this.setValues();

    this.formSub$ = this.profileForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        shareReplay(),
      )
      .subscribe(values => {
        if (values.twoFA) {
          this.openTwoFAModal();
        } else {
          this.closeTwoFAModal();
        }
        this.save();
      })
  }

  ngOnDestroy() {
    if (this.formSub$) {
      this.formSub$.unsubscribe();
    }

    if (this.profileUpdateSub$) {
      this.profileUpdateSub$.unsubscribe();
    }
  }

  openTwoFAModal(): void {
    this.showTwoFAModal = true;
    this.isLoadingTwoFA = true;
    this.twoFAError = '';

    this.profileService.get2fa()
      .pipe(
        take(1),
        shareReplay(),
        distinctUntilChanged()
      ).subscribe({
      next: (response) => {
        this.twoFAQRCode = response.qrCode;
        this.twoFASecret = response.twoFASecret;
        this.isLoadingTwoFA = false;
      },
      error: (error: HttpErrorResponse) => {
        this.twoFAError = this.getErrorMessage(error, 'Unable to load 2FA QR code.');
        this.isLoadingTwoFA = false;
        this.twoFAControl.setValue(false, {emitEvent: false});
      },
    });
  }

  closeTwoFAModal(): void {
    this.showTwoFAModal = false;
    this.twoFAQRCode = null;
    this.twoFASecret = null;
  }

  private save(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.profileForm.getRawValue();

    this.profileUpdateSub$ = this.profileService.updateProfile(formValue)
      .pipe(
        distinctUntilChanged(),
        shareReplay(),
        debounceTime(500),
      )
      .subscribe(value => {
        this.successMessage = 'Profile updated successfully.';
      })
  }

  private setValues() {
    forkJoin({
      profile: this.profileService.getProfile(),
    }).pipe(
      take(1)
    ).subscribe({
      next: ({profile}) => {
        this.profileForm.patchValue({
          name: profile.name,
          twoFA: profile.twoFA,
        }, {emitEvent: false});
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['login']);
        }

        this.errorMessage = this.getErrorMessage(error, 'Unable to load profile data.');
        this.isLoading = false;
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as { message?: string; error?: string | string[] } | string | undefined;
    const errorValue = body && typeof body === 'object' ? body.error : undefined;

    if (typeof body === 'string') {
      return body;
    }

    if (Array.isArray(errorValue) && errorValue.length > 0) {
      return errorValue[0];
    }

    if (typeof errorValue === 'string') {
      return errorValue;
    }

    if (typeof body?.message === 'string') {
      return body.message;
    }

    return fallback;
  }
}
