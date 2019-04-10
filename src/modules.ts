/* tslint:disable:max-line-length */
/*
 Copyright (C) 2019 3NSoft Inc.

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

export interface AppsModule {
    module: any;
    type: 'filter'|'component'|'directive'|'service'|'provider';
}

import '@uirouter/angularjs';
import 'angular-aria';
import 'angular-animate';
import 'angular-messages';
import 'angular-sanitize';
import 'angular-material';

import * as ArrayFilterMod from "./services/to-array";
import * as LoginSrvMod from './services/login-srv';
import * as SigninCompMod from './signin/signin';
import * as SignupCompMod from './signup/signup';

export const dependencies = [
    'ui.router',
    'ngAnimate',
    'ngSanitize',
    'ngMaterial',
    ArrayFilterMod.ModuleName,
    LoginSrvMod.ModuleName,
    SigninCompMod.ModuleName,
    SignupCompMod.ModuleName,
];

export const appsModules: AppsModule[] = [
    { module: ArrayFilterMod, type: 'filter' },
    { module: LoginSrvMod, type: 'service' },
    { module: SigninCompMod, type: 'component' },
    { module: SignupCompMod, type: 'component' },
];
