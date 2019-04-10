/*
 Copyright (C) 2017 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
import { IAngularStatic, IComponentOptions, IQService, IScope, ITimeoutService } from 'angular';
import { StateService } from '@uirouter/angularjs';
import * as LoginSrvMod from './../services/login-srv';

export const ModuleName = '3nweb.components.signup'
;
const NOTIF_DURATION = 5000;
const KEYS = {
  ENTER: 13,
  ESC: 27,
};

interface SignUpScope extends IScope {
  signup: any;
}

class Controller {
  CONST = {
    NAME_MIN_LENGTH: 6,
    NAME_MAX_LENGTH: 30,
    PASSWORD_MIN_LENGTH: 12,
  };
  user: web3n.start.User = {
    login: '',
    password: '',
    passwordConfirm: '',
    name: '',
    domain: '@3nweb.com',
  };
  step: number = 1;
  signupError: string = '';
  isWait: boolean = false;
  waitText: string = '';
  questions = {
    q1: false,
    q2: false,
    q3: false,
  };
  isCreateDisabled: boolean = true;


  static $inject = ['$scope', '$state', '$q', '$timeout', LoginSrvMod.LoginSrvName];
  constructor(
    private $scope: SignUpScope,
    private $state: StateService,
    private $q: IQService,
    private $timeout: ITimeoutService,
    private _loginSrv: LoginSrvMod.LoginSrv
  ) { 
    this.$timeout(() => {
      const nameInputElement = (document.querySelector('input[name="loginname"]') as HTMLInputElement);
      nameInputElement.focus();
    });
  }

  goToSignin(): void {
    this.$state.go('signin');
  }

  back(): void {
    this.signupError = '';
    switch (this.step) {
      case 2:
        this.step = 1;
        this.user.password = '';
        this.user.passwordConfirm = '';
        this.$timeout(() => {
          const nameInputElement = (document.querySelector('input[name="loginname"]') as HTMLInputElement);
          nameInputElement.focus();
        });
        break;
      case 3:
        this.step = 2;
        this.questions = {
          q1: false,
          q2: false,
          q3: false,
        };
        this.$timeout(() => {
          const passwInputElement = (document.querySelector('input[name="password"]') as HTMLInputElement);
          passwInputElement.focus();
        });
        break;
    }
  }

  keyEventHandler(event: KeyboardEvent, field: string): void {
    const keyCode = event.keyCode || event.which;
    switch (keyCode) {
      case KEYS.ESC:
        this.$timeout(() => {
          this.user[field] = '';
        });
        break;
      case KEYS.ENTER:
        switch (field) {
          case 'name':
            if (!!this.user.name) {
              if (
                this.user.name.length >= this.CONST.NAME_MIN_LENGTH &&
                this.user.name.length <= this.CONST.NAME_MAX_LENGTH &&
                !this.user.name.includes('@')
              ) {
                this.proceed(1);
              }
            }
            break;
          case 'password':
            if (!!this.user.password) {
              if (this.user.password.length >= this.CONST.PASSWORD_MIN_LENGTH) {
                this.$timeout(() => {
                  (document.querySelector('input[name="confirmpassword"]') as HTMLInputElement).focus();
                })
              }
            }
            break;
          case 'passwordConfirm':
            if (!!this.user.passwordConfirm) {
              if (!this.$scope.signup.$invalid && !this.signupError) {
                this.proceed(2);
              }
            }
            break;
        }
        break;
    }
  }

  proceed(step: number): void {
    switch (step) {
      case 1:
        this.stepOne();
        break;
      case 2:
        this.stepTwo();
        break;
      case 3:
        this.createAccount();
        break;
    }
  }

  stepOne(): void {
    this.isWait = true;
    this.user.login = `${this.user.name}${this.user.domain}`;
    this.$q.when(this._loginSrv.getPossibleDomain(this.user.name))
      .then(possibleLogins => {
        // console.log(possibleLogins)
        if (possibleLogins.includes(this.user.login)) {
          this.step = 2;
          this.signupError = '';
          this.isWait = false;
          this.$timeout(() => {
            const passwInputElement = (document.querySelector('input[name="password"]') as HTMLInputElement);
            passwInputElement.focus();
          })
        } else {
          this.isWait = false;
          this.signupError = `Error. The login ${this.user.login} already used.`;
        }
      })
      .catch(err => {  
        console.error(err);
        this.isWait = false;
        this.signupError = `Unknown error. Try later.`;
        this.$timeout(() => {
          this.signupError = '';
        }, NOTIF_DURATION);
      });
  }

  stepTwo(): void {
    this.isWait = true;
    this._loginSrv.getLoginKey(this.user.password, (progress: number) => {
      console.info(progress);
      this.$timeout(() => {
        this.waitText = `Secret key generation is completed by ${progress}%`;
      });
    })
    .then(() => {
      this.isWait = false;
      this.waitText = '';
      this.step = 3;
      this.signupError = '';
    })
    .catch(err => {
      console.error(err);
      this.isWait = false;
      this.waitText = '';
      this.signupError = `Error when generating a secret key. Try again.`;
    });
  }

  checkPassword(event: KeyboardEvent): void {
    if (!!this.user.passwordConfirm) {
      if (this.user.passwordConfirm !== this.user.password) {
        this.signupError = 'Error. Password is not correct.';
      } else {
        this.signupError = '';
        this.keyEventHandler(event, 'passwordConfirm');
      }
    } else {
      this.signupError = '';
    }
  }

  checkAnswers() {
    let isAllTrue = true;
    for (let key of Object.keys(this.questions)) {
      if (!this.questions[key]) {
        isAllTrue = false;
        break;
      }
    }
    this.$timeout(() => {
      this.isCreateDisabled = !isAllTrue;
    });
  }

  createAccount(): void {
    // console.log(this.user.login)
    this.isWait = true;
    this.waitText = 'Account creation in progress ...';
    this.$q.when(this._loginSrv.createNewAccount(this.user.login))
      .then(created => {
        if (!created) {
          this.isWait = false;
          this.waitText = '';
          this.signupError = `Unfortunately, there was an error creating the user ${this.user.login}. Restart Sign Up!`;
        }
      })
      .catch(err => {
        console.error(err);
        this.isWait = false;
        this.waitText = '';
        this.signupError = `Unfortunately, there was an error creating the user ${this.user.login}. Restart Sign Up!`;
      });
  }

}

const componentConfig: IComponentOptions = {
  bindings: {},
  templateUrl: './signup/signup.html',
  controller: Controller,
};

export function addComponent(ng: IAngularStatic): void {
  const mod = ng.module(ModuleName, []);
  mod.component("signUp", componentConfig);
}