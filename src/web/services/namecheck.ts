/*
 Copyright (C) 2016 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>. */

/// <reference path="../../typings/tsd.d.ts" />

export let ModulName = "3nweb.directive.namecheck";

export let NameCheckDirectiveName = "namecheck";

function nameCheck() {
  return {
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl) {
      
    }
  }
}

export function addDirective(angular: angular.IAngularStatic): void {
  let mod = angular.module(ModulName, []);
  mod.directive(NameCheckDirectiveName, nameCheck);
}


Object.freeze(exports);
