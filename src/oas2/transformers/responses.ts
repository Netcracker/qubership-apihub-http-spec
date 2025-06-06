import type { DeepPartial, IHttpOperationResponse, IMediaTypeContent, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import type { Operation, Reference } from 'swagger-schema-official';

import { withContext } from '../../context';
import { isNonNullable } from '../../guards';
import { isReferenceObject } from '../../oas/guards';
import { getSharedKey } from '../../oas/resolver';
import { translateToDefaultExample } from '../../oas/transformers/examples';
import { entries } from '../../utils';
import { getExamplesFromSchema, getProduces } from '../accessors';
import { isResponseObject } from '../guards';
import { Oas2TranslateFunction } from '../types';
import { translateToHeaderParams } from './params';

export const translateToResponse = withContext<
  Oas2TranslateFunction<
    [produces: string[], statusCode: string, response: unknown],
    Optional<IHttpOperationResponse<true> | (Pick<IHttpOperationResponse<true>, 'code'> & Reference)>
  >
>(function (produces, statusCode, response) {
  const maybeResponseObject = this.maybeResolveLocalRef(response);

  if (isReferenceObject(maybeResponseObject)) {
    (maybeResponseObject as Pick<IHttpOperationResponse, 'code'> & Reference).code = statusCode;
    return maybeResponseObject as Pick<IHttpOperationResponse, 'code'> & Reference;
  }

  if (!isResponseObject(maybeResponseObject)) return;

  const codeOrKey = this.context === 'service' ? getSharedKey(maybeResponseObject) : statusCode;
  const id = this.generateId.httpResponse({ codeOrKey, produces });

  const headers = translateToHeaderParams.call(this, maybeResponseObject.headers);
  const objectifiedExamples = entries(
    maybeResponseObject.examples || getExamplesFromSchema(maybeResponseObject.schema),
  ).map(([key, value]) => translateToDefaultExample.call(this, key, value));

  const contents = produces
    .map<IMediaTypeContent<true> & { examples: NonNullable<IMediaTypeContent<true>['examples']> }>(
      withContext(produceElement => {
        return {
          id: this.generateId.httpMedia({ mediaType: produceElement }),
          mediaType: produceElement,
          examples: objectifiedExamples.filter(example => example.key === produceElement),
          ...pickBy(
            {
              schema: maybeResponseObject.schema,
            },
            isNonNullable,
          ),
        };
      }),
      this,
    )
    .filter(({ schema, examples }) => !!schema || examples.length > 0);

  const translatedResponse = {
    id,
    code: statusCode,
    description: maybeResponseObject.description,
    headers,
    contents,
  };

  const foreignExamples = objectifiedExamples.filter(example => !produces.includes(example.key));
  if (foreignExamples.length > 0) {
    if (translatedResponse.contents.length === 0)
      translatedResponse.contents[0] = {
        id: this.generateId.httpMedia({ mediaType: '' }),
        mediaType: '',
        schema: {},
        examples: [],
      };

    translatedResponse.contents[0].examples!.push(...foreignExamples);
  }

  return translatedResponse;
});

export const translateToResponses: Oas2TranslateFunction<
  [operation: DeepPartial<Operation>],
  NonNullable<ReturnType<typeof translateToResponse>>[]
> = function (operation) {
  const produces = getProduces(this.document, operation);
  return entries(operation.responses)
    .map(([statusCode, response]) => translateToResponse.call(this, produces, statusCode, response))
    .filter(isNonNullable);
};
