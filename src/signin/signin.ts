/*
 Copyright (C) 2017 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import { IAngularStatic, IComponentOptions, IScope, ITimeoutService } from 'angular';
import { StateService } from '@uirouter/angularjs';
import * as LoginSrvMod from './../services/login-srv';

export const ModuleName = '3nweb.components.signin';

const KEYS = {
  ENTER: 13,
  ESC: 27
};

class Controller {
  users: string[];
  selectLogin: string = '';
  loginEnterMode: string = 'single';
  user: web3n.start.User = {
    login: '',
    password: '',
  };
  signinError: string = '';
  isWait: boolean = false;
  waitText: string = '';

  static $inject = ['$scope', '$state', '$timeout', LoginSrvMod.LoginSrvName];
  constructor(
    private $scope: IScope,
    private $state: StateService,
    private $timeout: ITimeoutService,
    private _loginSrv: LoginSrvMod.LoginSrv
  ) { 
    this.$timeout(() => {
      // console.log(this.users)
      if (this.users.length > 0) {
        this.selectLogin = this.users[0];
        this.user.login = this.selectLogin;
        this.loginEnterMode = 'select';
        this.$timeout(() => {
          (document.querySelector('input[name="password"]') as HTMLInputElement).focus();
        })
      }
    })

  }

  goToRegistration() {
    this.$state.go('signup');
  }

  changeEnterMode() {
    this.loginEnterMode = 'single';
    this.selectLogin = '';
    this.user.login = '';
    this.user.password = '';
    this.signinError = '';
    this.$timeout(() => {
      (document.querySelector('input[name="login"]') as HTMLInputElement).focus();
    })
  }

  onChange() {
    this.selectLogin = this.user.login;
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
          case 'login':
            if (!!this.user.login) {
              this.$timeout(() => {
                (document.querySelector('input[name="password"]') as HTMLInputElement).focus();
              });
            }
            break;
          case 'password':
            if (!!this.user.password) { this.signIn(); }
        }
        break;
    }
  }

  signIn(): void {
    this.isWait = true;
    this.$timeout(() => {
      this.waitText = 'Please wait, connecting to the server ...';
    });
    this._loginSrv.signIn(
        this.user.login,
        this.user.password,
        (progress: number) => {
          // console.info(progress)
          this.$timeout(() => {
            this.waitText = `Progress of generation ${progress}%`;
        });
    })
    .then(result => {
      this.isWait = false;
      this.waitText = '';
      if (!result.success) {
        const fieldName = !result.errorType || result.errorType === 'login'
          ? 'login'
          : 'password';
        this.$timeout(() => {
          (document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement).focus();
          this.signinError = result.error;
        });
      }
    })
    .catch(error => {
      console.error(error);
    });
  }
}

const componentConfig: IComponentOptions = {
  bindings: {
    users: '<',
  },
  templateUrl: './signin/signin.html',
  controller: Controller,
};

export function addComponent(ng: IAngularStatic): void {
  const mod = ng.module(ModuleName, []);
  mod.component("signIn", componentConfig);
}