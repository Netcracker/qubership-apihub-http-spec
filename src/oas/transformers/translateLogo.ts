import type { DeepPartial, Dictionary, IHttpService } from '@stoplight/types';
import type { InfoObject } from 'openapi3-ts/src/model/OpenApi';
import type { Info } from 'swagger-schema-official';
import pickBy = require('lodash.pickby');

export function translateLogo({
  'x-logo': logo,
  contact,
}: DeepPartial<Info | InfoObject> & { 'x-logo': Dictionary<unknown> }): IHttpService['logo'] {
  return {
    altText: 'logo',
    href: contact?.url,
    ...pickBy(
      logo,
      (val: unknown, key: string) =>
        typeof val === 'string' && ['altText', 'href', 'backgroundColor', 'url'].includes(key),
    ),
  };
}
