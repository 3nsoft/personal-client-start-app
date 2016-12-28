/*
 Copyright (C) 2016 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>. */

/// <reference path="../../typings/tsd.d.ts" />

import {User} from "../sign-in/sign-in";
export let ModuleName = "3nweb.components.sign-up";

let tmplts = [
  "./templates/sign-up/sign-up-address.html",
  "./templates/sign-up/sign-up-password.html",
  "./templates/sign-up/sign-up-password-storage.html",
  "./templates/sign-up/sign-up-finality.html",
];

class Controller {
  signUp: web3n.startup.SignUpService;
  currentTmpl: string;
  step: number;
  user: User;
  passwordConfirm: string;
  passwordConfirmed: boolean;
  error: {
    checkName: boolean;
    passwordConfirm: boolean;
  };
  isWait: boolean;
  generationProgress: number;
  possibleLogins: string[];
  consent: {
    passLoss: boolean;
    onPaper: boolean;
    secondCopy: boolean;
  };
  created: boolean;
  htmlElements: any;
  
  nameMinLength: number;
  nameMaxLength: number;
  passMinLength: number;
  
  static $inject = ["$scope", "$q", "$state", "$timeout"];
  static injectShim = (<any[]>Controller.$inject).concat(($scope, $q, $state, $timeout) => {
    return new Controller($scope, $q, $state, $timeout);
  });
  constructor(private $scope: angular.IScope, private $q: angular.IQService, private $state: angular.ui.IStateService, private $timeout: angular.ITimeoutService) {
    this.signUp = w3n.signUp;
    this.currentTmpl = tmplts[0];
    this.step = 1;
    this.user = {
      name: "",
      mail: "",
      password: "",
      storPassword: ""
    };
    this.passwordConfirm = "";
    this.passwordConfirmed = false;
    this.isWait = false;
    this.generationProgress = null;
    this.error = {
      checkName: false,
      passwordConfirm: null
    };
    this.possibleLogins = [];
    this.consent = {
      passLoss: false,
      onPaper: false,
      secondCopy: false
    };
    this.created = null;
    
    this.nameMinLength = 6;
    this.nameMaxLength = 60;
    this.passMinLength = 1;
  }
  
  /* методы, касающися проверки имени пользователя */
  preCheckName(event): void {
    let keycode = event.keyCode || event.which;
    if (keycode === 13) {
      if ((this.user.name !== undefined) && 
        (this.user.name !== null) && 
        (this.user.name.length >= this.nameMinLength) &&
        (this.user.name.length <= this.nameMaxLength) && 
        (this.user.name.indexOf("@") === -1)) {
        this.checkName();
      }   
    }   
  };
  
  checkName(): void {
    this.isWait = true;
    this.$q.when(<any>this.signUp.getAvailableAddresses(this.user.name))
      .then((response) => {
        this.possibleLogins = response;
        this.error.checkName = false;
        this.isWait = false;
        this.step = 2;
        this.$timeout(() => {
          this.htmlElements = angular.element(document).find("tr");
          this.htmlElements[0].focus();
        });
      })
      .catch((err) => {
        this.error.checkName = true;
        this.isWait = false;
        console.error(err);
      });
  };
  
  chooseMail(mail: string): void {
    this.user.mail = mail;
    this.currentTmpl = tmplts[1];
    this.step = 1;
  };
  
  keysChooseMail(event, index): void {
    let keycode = event.keyCode || event.which;
    switch (keycode) {
      case 13:
        let login = this.possibleLogins[index];
        this.chooseMail(login);
        break;
      case 38:
        if (index !== 0) {
          this.htmlElements[index - 1].focus();
        }
        break;
      case 40:
        if (index < (this.possibleLogins.length - 1)) {
          this.htmlElements[index + 1].focus();
        }
        break;
    }
  };
  
  /* методы, касающиеся Login password */
  preNext(event): void {
    let keycode = event.keyCode || event.which;
    if (keycode === 13) {
      if ((this.user.password !== undefined) && 
        (this.user.password !== null) && 
        (this.user.password.length >= this.passMinLength) &&
        (this.step === 1)) {
        this.next();
      }   
    }   
  };
  
  next(): void {
    this.step = 2;
    this.$timeout(() => {
      this.htmlElements = angular.element(document).find("input");
      this.htmlElements[1].focus();
    });
  };
  
  checkPassword(): void {
    let passwordPart = "";
    if (this.passwordConfirm.length < this.user.password.length) {
      passwordPart = this.user.password.substr(0,this.passwordConfirm.length);
      this.error.passwordConfirm = (this.passwordConfirm === passwordPart) ? false : true;
      this.passwordConfirmed = false;
    }
    if (this.passwordConfirm.length === this.user.password.length) {
      if (this.passwordConfirm === this.user.password) {
        this.error.passwordConfirm = false;
        this.passwordConfirmed = true;
      }
    }
    if (this.passwordConfirm.length > this.user.password.length) {
      this.error.passwordConfirm = true;
      this.passwordConfirmed = false;
    }
  };
  
  preGenerateLoginKey(event): void {
    let keycode = event.keyCode || event.which;
    if (keycode === 13) {
      if ((this.passwordConfirmed === true) && 
        (this.step === 2)) {
        this.generateLoginKey();
      }   
    }   
  };  
  
  generateLoginKey(): void {
    this.step = 3;
    let deferred = this.$q.defer<void>();
    this.signUp.createMailerIdParams(this.user.password, deferred.notify)
      .then(deferred.resolve, deferred.reject);
       
    deferred.promise
      .then((paramsAndKey) => {
        this.currentTmpl = tmplts[2];
        this.step = 1;
        this.generationProgress = null;
        this.passwordConfirm = "";
      }, (err) => {
        console.log(err);
      }, (progress: number) => {
        this.generationProgress = progress;
      });
  };
  
  /* методы, касающиеся Storage password */
  preStorNext(event): void {
    let keycode = event.keyCode || event.which;
    if (keycode === 13) {
      if ((this.user.storPassword !== undefined) && 
        (this.user.storPassword !== null) && 
        (this.user.storPassword.length >= this.passMinLength) &&
        (this.step === 1)) {
        this.storNext();
      }   
    }   
  };
  
  storNext(): void {
    this.step = 2;
    this.passwordConfirmed = false;
    this.$timeout(() => {
      this.htmlElements = angular.element(document).find("input");
      this.htmlElements[1].focus();
    });
  };
  
  checkStorPassword(): void {
    let passwordPart = "";
    if (this.passwordConfirm.length < this.user.storPassword.length) {
      passwordPart = this.user.storPassword.substr(0,this.passwordConfirm.length);
      this.error.passwordConfirm = (this.passwordConfirm === passwordPart) ? false : true;
      this.passwordConfirmed = false;
    }
    if (this.passwordConfirm.length === this.user.storPassword.length) {
      if (this.passwordConfirm === this.user.storPassword) {
        this.error.passwordConfirm = false;
        this.passwordConfirmed = true;
      }
    }
    if (this.passwordConfirm.length > this.user.storPassword.length) {
      this.error.passwordConfirm = true;
      this.passwordConfirmed = false;
    }
  };
  
  preGenerateSrorageKey(event): void {
    let keycode = event.keyCode || event.which;
    if (keycode === 13) {
      if ((this.passwordConfirmed === true) && 
        (this.step === 2)) {
        this.generateSrorageKey();
      }   
    }   
  }; 
  
  generateSrorageKey(): void {
    this.step = 3;
    let deferred = this.$q.defer<void>();
    this.signUp.createStorageParams(this.user.password, deferred.notify)
      .then(deferred.resolve, deferred.reject);
       
    deferred.promise
      .then((paramsAndKey) => {
        this.currentTmpl = tmplts[3];
        this.step = 1;
        this.generationProgress = null;
      }, (err) => {
        console.error(err);
      }, (progress: number) => {
        this.generationProgress = progress;
      });
  };   

  /* методы, касающиеся окончания процедуры Sign Up */
  createAccount(): void {
    this.isWait = true;
    this.$q.when(<any>this.signUp.addUser(this.user.mail))
      .then((created: boolean) => {
        if (!created) {
          this.created = false;
        }
        this.isWait = false;
      })
      .catch((err) => {
        console.error(err);
        this.isWait = false;
      });
  };
  
  reloadSignUp(): void {
    this.$state.reload();
  };
    
  /* возврат на страницу Sign In */
  goSignIn(): void {
    this.$state.go("login");
  };
     
}


let componentConfig: angular.IComponentOptions = {
  bindings: {},
  templateUrl: "./templates/sign-up/sign-up.html",
  controller: Controller.injectShim
}

export function addComponent(angular: angular.IAngularStatic): void {
  let mod = angular.module(ModuleName, []);
  mod.component("signUp", componentConfig);
}

Object.freeze(exports);
