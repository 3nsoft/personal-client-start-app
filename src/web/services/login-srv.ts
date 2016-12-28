/*
 Copyright (C) 2016 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>. */

/// <reference path="../../typings/tsd.d.ts" />

export let ModulName = "3nweb.services.login-srv";

export let LoginSrvName = "loginService";

export function addService(angular: angular.IAngularStatic): void {
  let mod = angular.module(ModulName, []);
  mod.service(LoginSrvName, LoginSrv);
}

export class LoginSrv {
  
  constructor() {}

  // TO DO функция только для тестирования
  // позже функцию "чтения" ранее зарегистрированных пользователей
  // необходимо будет переделать
  readRegisteredUser(): string[] {
    return ["vitaly@3nweb.com"];
  }

}