/*
 Copyright (C) 2017 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import * as angular from 'angular';
import { appsModules, dependencies } from './modules';
import { StateProvider, UrlRouterProvider } from '@uirouter/angularjs';
import * as LoginSrvMod from './services/login-srv';

let app = angular.module("3nweb", dependencies);

appsModules.forEach(item => {
    switch (item.type) {
        case 'filter':
            item.module.addFilter(angular);
            break;
        case 'component':
            item.module.addComponent(angular);
            break;
        case 'directive':
            item.module.addDirective(angular);
            break;
        case 'service':
            item.module.addService(angular);
            break;
        case 'provider':
            item.module.addProvider(angular);
            break;
    }
});

function configApp(
  $stateProvider: StateProvider,
  $urlRouterProvider: UrlRouterProvider,
  $sceProvider: angular.ISCEProvider,
): void {
    $stateProvider
        .state('signin', {
            url: '/signin',
            template: `<sign-in users="$ctrl.users"></sign-in>`,
            resolve: {
                users: [
                    '$q',
                    LoginSrvMod.LoginSrvName,
                    function($q: angular.IQService, loginSrv: LoginSrvMod.LoginSrv) {
                        return $q.when(loginSrv.readRegisteredUser());
                    },
                ],
            },
            controller: ['users', function(users: string[]) {
                this.users = users;
            }],
            controllerAs: '$ctrl',
        })
        .state('signup', {
            url: '/signup',
            template: `<sign-up></sign-up>`,
        });
    $urlRouterProvider.otherwise('signin');
    $sceProvider.enabled(false);
}

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$sceProvider',
    configApp,
]);
