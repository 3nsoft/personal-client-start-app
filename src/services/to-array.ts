/*
 Copyright (C) 2016 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under
 the terms of the GNU General Public License as published by the Free Software
 Foundation, either version 3 of the License, or (at your option) any later
 version.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with
 this program. If not, see <http://www.gnu.org/licenses/>.
*/
import { IAngularStatic, isObject } from 'angular';

export let ModuleName = '3nweb.filter.toArray';
export let ToArrayFilterName = 'toArray';

export function addFilter(ng: IAngularStatic): void {
    const mod = ng.module(ModuleName, []);
    mod.filter(ToArrayFilterName, toArray);
}

function toArray() {
    return (obj, addKey) => {
        if (!isObject(obj)) { return obj; }
        if ( addKey === false ) {
            return Object.keys(obj).map(key => obj[key]);
        } else {
            return Object.keys(obj).map(key => {
                const value = obj[key];
                return isObject(value)
                    ? Object.defineProperty(value, '$key', { enumerable: false, value: key})
                    : { $key: key, $value: value };
            });
        }
    };
}
