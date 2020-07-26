/**
 *   @author Siddharth Kapania <sid.kapania@dal.ca>
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Logger, untilDestroyed } from '@core';
import { AuthenticationService } from './authentication.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatDialogWrapperComponent } from '@app/@shared';

const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;

  private _matDialogConfig: MatDialogConfig = {
    minWidth: '250px',
    minHeight: '200px',
  };

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private _matDialog: MatDialog
  ) {
    this._createLoginForm();
  }

  ngOnInit() {}

  ngOnDestroy() {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.authenticationService
        .login(this.loginForm.value)
        .pipe(untilDestroyed(this))
        .subscribe(
          (res) => {
            if (res?.token?.length > 0 && res?.authenticate?.success === true) {
              this.authenticationService.authToken = res.token;
              this.authenticationService.authUserRole = res?.authenticate?.user?.roleid;
              console.log(this.bannerId);
              this.authenticationService.authUserBanner = res.bannerId;
              this.authenticationService.setIsLoggedIn(true);

              this.router.navigate(['/home']);
            } else {
              const dialogConfig = this._matDialogConfig;
              dialogConfig.data = { header: 'Error!', content: 'Please enter correct username or password.' };
              this._matDialog.open(MatDialogWrapperComponent, dialogConfig);

              this.authenticationService.clearLocalStorage();
              this.authenticationService.setIsLoggedIn(false);
            }
          },
          (err) => {
            const dialogConfig = this._matDialogConfig;
            dialogConfig.data = { header: 'Error!', content: 'Please enter correct username or password.' };
            this._matDialog.open(MatDialogWrapperComponent, dialogConfig);

            this.authenticationService.clearLocalStorage();
            this.authenticationService.setIsLoggedIn(false);
          }
        );
    }
    this.loginForm.reset();
  }

  get bannerId() {
    return this.loginForm.controls.bannerId;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  private _createLoginForm() {
    this.loginForm = this.formBuilder.group({
      bannerId: ['', [Validators.required, Validators.maxLength(9)]],
      password: ['', Validators.required],
    });
  }
}
