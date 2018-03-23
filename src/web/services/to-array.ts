/*
 Copyright (C) 2016 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>. */

/// <reference path="../../typings/tsd.d.ts" />

export let ModuleName = "3nweb.services.toArray";

export let ToArrayFilterName = "toArray";

export function addFilter(angular: angular.IAngularStatic): void {
  let mod = angular.module(ModuleName, []);
  mod.filter(ToArrayFilterName, ToArray);
}

class ToArray {
  
  constructor() {}
  
  toArray(): any {
    return function(obj, addKey): any {
      if (!angular.isObject(obj)) return obj;
      if ( addKey === false ) {
        return Object.keys(obj).map(function(key) {
				  return obj[key];
			  });
      } else {
        return Object.keys(obj).map(function (key) {
				  let value = obj[key];
				  return angular.isObject(value) ?
					  Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
				  { $key: key, $value: value };
			  });
      }
    };
  };

}