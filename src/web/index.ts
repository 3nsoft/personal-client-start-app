/*
 Copyright (C) 2016 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>. */

/// <reference path="../typings/tsd.d.ts" />

import * as ArrayFilterMod from "./services/to-array";
ArrayFilterMod.addFilter(angular);

import * as CacheSrvMod from "./services/cache-srv";
CacheSrvMod.addService(angular);

import * as LoginSrvMod from './services/login-srv';
LoginSrvMod.addService(angular);

import * as SignInCompMod from "./sign-in/sign-in";
SignInCompMod.addComponent(angular);

import * as SignUpCompMod from "./sign-up/sign-up";
SignUpCompMod.addComponent(angular);

let appModuleDependencies = [
  "ui.router",
  "ngMaterial",
  "ngMdIcons",
  "ngMessages",
  "hmTouchEvents",
  ArrayFilterMod.ModulName,
  CacheSrvMod.ModulName,
  LoginSrvMod.ModulName,
  SignInCompMod.ModuleName,
  SignUpCompMod.ModuleName
];

let app = angular.module("3nweb", appModuleDependencies);


let APP_DEFAULT_PALETTE = {
	"background": "grey",
	"primary": "indigo",
	"accent": "amber",
	"warn": "red"
};

configApp.$inject = [
  "$mdThemingProvider",
  "$stateProvider",
  "$urlRouterProvider"
];

function configApp($mdThemingProvider: angular.material.IThemingProvider, $stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider): void {
  
  /* add user theme */  
  $mdThemingProvider.theme("myTheme")
    .primaryPalette(APP_DEFAULT_PALETTE.primary)
    .accentPalette(APP_DEFAULT_PALETTE.accent)
    .backgroundPalette(APP_DEFAULT_PALETTE.background)
    .warnPalette(APP_DEFAULT_PALETTE.warn);
    
  $mdThemingProvider.setDefaultTheme("myTheme");
	(<any>window).mdT = $mdThemingProvider;
  
  $stateProvider
    .state("login", {
      url: "/login",
      template: "<sign-in users='$ctrl.users'></sign-in>",
      resolve: {
        users: [LoginSrvMod.LoginSrvName, function(loginSrv: LoginSrvMod.LoginSrv) {
          return loginSrv.readRegisteredUser();
        }]
      },
      controller: function(users) {
        this.users = users;
      },
      controllerAs: "$ctrl"
    })
    .state("signup", {
      url: "/sign-up",
      template: "<sign-up></sign-up>"
    });
  
  
  $urlRouterProvider.otherwise("login");  
  
}

app.config(configApp);
