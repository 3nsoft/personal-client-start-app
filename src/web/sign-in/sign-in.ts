/*
 Copyright (C) 2016 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>. */

/// <reference path="../../typings/tsd.d.ts" />

export let ModuleName = "3nweb.components.sign-in";

export interface User {
  name: string;
  mail: string;
  password: string;
  storPassword: string;
}

class Controller {
  signIn: web3n.startup.SignInService;
  users: string[];
  user: User;
  step: number;
  isWait: boolean;
  isFound: boolean;
  loginError: string;
  generationProgress: number;
  inputElements: any;
  nameMinLength: number;
  passMinLength: number;
  
  static $inject = ["$scope", "$state", "$q", "$timeout"];
  static injectShim = (<any[]>Controller.$inject).concat(($scope, $state, $q, $timeout) => {
    return new Controller($scope, $state, $q, $timeout);
  });
  constructor(private $scope: angular.IScope, private $state: angular.ui.IStateService, private $q: angular.IQService, private $timeout: angular.ITimeoutService) {
    this.signIn = w3n.signIn;
    this.user = {
      name: null,
      mail: null,
      password: null,
      storPassword: null
    };
    this.step = 1;
    this.isWait = false;
    this.isFound = false;
    this.loginError = null;
    this.generationProgress = null;
    this.nameMinLength = 6;
    this.passMinLength = 1;
    
    $timeout(() => {
     (<HTMLInputElement>document.querySelector("input[name='username']")).focus(); 
    });
    
  }
  
  
  startSignIn(): void {
    this.step = 1;
    this.isWait = false;
    this.isFound = false;
    this.user = {
      name: null,
      mail: null,
      password: null,
      storPassword: null      
    };  
  };
  
  preCheckName(event): void {
    let keycode = event.keyCode || event.which;
    if (keycode === 13) {
      if ((this.user.mail !== undefined) && 
        (this.user.mail !== null) && 
        (this.user.mail.length > 6) && 
        (this.user.mail.indexOf("@") !== -1) && 
        (this.step === 1)) {
        this.checkName();
      } 
    }
  };
  
  checkName(): void {
    this.inputElements = angular.element(document).find("input");
    this.isWait = true;
    this.signIn.getUsersOnDisk()
      .then((users) => {
        console.log(JSON.stringify(users));
        for(let user of users) {
          if (this.user.mail === user) {
            this.isFound = true;
          }
        }
         if (this.isFound) {
           this.step = 3;
           this.isWait = false;
           this.$timeout(() => {
             this.inputElements[0].blur();
           });           
           this.$timeout(() => {
             this.inputElements[2].focus();
           });           
         } else {
           return this.$q.when(<any>this.signIn.startMidProvisioning(this.user.mail))
            .then((mailIsKnown: boolean) => {
              if (mailIsKnown) {
                this.isWait = false;
                this.loginError = null;
                this.step = 2;
                this.$timeout(() => {
                  this.inputElements[1].focus();
                });             
              } else {
                this.isWait = false;
                this.$timeout(() => {
                  this.inputElements[0].blur();
                });
                this.loginError = "Address " + this.user.mail + " is unknown!";
                this.$timeout(() => {
                  this.inputElements[0].focus();
                });
              }
            }, (err) => {
              this.isWait = false;
              this.$timeout(() => {
                this.inputElements[0].blur();
              });
              this.loginError = "XMLHttpRequest returned an error!";
              this.$timeout(() => {
                this.inputElements[0].focus();
              });
              console.error(err);
            });
         }
      });
  };
  
  
  preCheckPassword(event): void {
    let keycode = event.keyCode || event.which;
    if (keycode === 13) {
      if ((this.user.password !== undefined) && 
        (this.user.password !== null) && 
        (this.user.password.length > 0) && 
        (this.step === 2)) {
        this.checkPassword();
      } 
    }
  };
  
  checkPassword(): void {
    let deferred = this.$q.defer<boolean>();
    this.signIn.completeMidProvisioning(this.user.password, deferred.notify)
      .then(deferred.resolve, deferred.reject);
      
    deferred.promise
      .then((passOK) => {
        this.user.password = "";
        if (passOK) {
          this.step = 3;
          this.generationProgress = null;
          this.$timeout(() => {
            this.inputElements[2].focus();
          });
        } else {
          this.loginError = "Password is incorrect!";
          this.$timeout(() => {
            this.inputElements[1].focus();
          });
        }
      }, (err) => {
        console.error(err);
        this.loginError = "Unknown error!";
        this.$timeout(() => {
          this.inputElements[1].focus();
        });       
      }, (progress: number) => {
        this.generationProgress = progress;
      });
  };
  
  preCheckStorPassword(event): void {
    let keycode = event.keyCode || event.which;
    if (keycode === 13) {
      if ((this.user.storPassword !== undefined) && 
        (this.user.storPassword !== null) && 
        (this.user.storPassword.length > 0) && 
        (this.step === 3)) {
        this.checkStorPassword();
      } 
    }
  };
  
  checkStorPassword(): void {
    this.inputElements[2].blur();
    let deferred = this.$q.defer<boolean>();
    this.signIn.setupStorage(this.user.mail, this.user.storPassword, deferred.notify)
      .then(deferred.resolve, deferred.reject);
      
    deferred.promise
      .then((passOK) => {
        this.user.password = "";
        if (passOK) {
          this.step = 4;
          this.generationProgress = null;
        } else {
          this.loginError = "Password is incorrect!";
          this.$timeout(() => {
            this.inputElements[2].focus();
          });          
        }
      }, (err) => {
        console.error(err);
        this.loginError = "Unknown error!";
          this.$timeout(() => {
            this.inputElements[2].focus();
          });        
      }, (progress: number) => {
        this.generationProgress = progress;
      });
  };
  
  goSignUp(): void {
    this.$state.go("signup");
  };
     
}


let componentConfig: angular.IComponentOptions = {
  bindings: {
    users: "<"
  },
  templateUrl: "./templates/sign-in/sign-in.html",
  controller: Controller.injectShim
}

export function addComponent(angular: angular.IAngularStatic): void {
  let mod = angular.module(ModuleName, []);
  mod.component("signIn", componentConfig);
}

Object.freeze(exports);
