//   Copyright 2020 Vircadia Contributors
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

'use strict';

// Initializes the `domains` service on path `/domains`
import { ServiceAddons } from '@feathersjs/feathers';
import type { RequestHandler } from 'express';
import multer from 'multer';
import { Application } from '../../../declarations';
import { AccountPublickey } from './account-publickey.class';
import hooks from './account-publickey.hooks';
const multipartMiddleware = multer({ limits: { fieldSize: Infinity } });
const multipartAny: RequestHandler = multipartMiddleware.any() as unknown as RequestHandler;

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'user/public_key': AccountPublickey & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
        id: 'id'
    };

	const multerAdapter: RequestHandler = (
            req: any,
            res: any,
            next: any
        ) => {
            if (req?.feathers) {
                req.feathers.files = (req as any).files?.media
                    ? (req as any).files?.media
                    : (req as any).files;
                req.feathers.body = req.body;
                req.feathers.args = (req as any).args;
            }
            next();
        };

    app.use(
        '/user/public_key',
        multipartAny,
		multerAdapter,
        new AccountPublickey(options, app)
    );

    app.use(
        'api/v1/user/public_key',
        multipartAny,
        multerAdapter,
        app.service('user/public_key') as unknown as RequestHandler
    );

    app.use(
        'api/v1/users/:accountId/public_key',
        app.service('user/public_key')
    );

    app.service('user/public_key').hooks(hooks);
}

