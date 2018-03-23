/*
 Copyright (C) 2016 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>. */

/// <reference path="../typings/tsd.d.ts" />

import * as ArrayFilterMod from "./services/to-array"
ArrayFilterMod.addFilter(angular)

import * as CacheSrvMod from "./services/cache-srv"
CacheSrvMod.addService(angular)

import * as LoginSrvMod from './services/login-srv'
LoginSrvMod.addService(angular)

import * as SigninCompMod from './signin/signin'
SigninCompMod.addComponent(angular)

import * as SignupCompMod from './signup/signup'
SignupCompMod.addComponent(angular)

const appModuleDependencies = [
  "ui.router",
  "ngMaterial",
  "ngMdIcons",
  "ngMessages",
  "hmTouchEvents",
  ArrayFilterMod.ModuleName,
  CacheSrvMod.ModuleName,
  LoginSrvMod.ModuleName,
  SigninCompMod.ModuleName,
  SignupCompMod.ModuleName
]

let app = angular.module("3nweb", appModuleDependencies)

configApp.$inject = ["$stateProvider", "$urlRouterProvider"]

function configApp(
  $stateProvider: angular.ui.IStateProvider, 
  $urlRouterProvider: angular.ui.IUrlRouterProvider
): void {
  
  $stateProvider
    .state('signin', {
      url: '/signin',
      template: `<sign-in users="$ctrl.users"></sign-in>`,
      resolve: {
        users: ['$q', LoginSrvMod.LoginSrvName, function($q: angular.IQService, loginSrv: LoginSrvMod.LoginSrv) {
          return $q.when(loginSrv.readRegisteredUser())
        }]
      },
      controller: function(users: string[]) {
        this.users = users
      },
      controllerAs: '$ctrl'
    })
    .state('signup', {
      url: '/signup',
      template: `<sign-up></sign-up>`
    })
  
  
  $urlRouterProvider.otherwise('signin')
  
}

app.config(configApp)
