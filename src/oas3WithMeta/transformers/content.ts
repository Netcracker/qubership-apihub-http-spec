import { isPlainObject } from '@stoplight/json';
import { HttpParamStyles, IHttpEncoding, IMediaTypeContent, Optional } from '@stoplight/types';
import pickBy from 'lodash.pickby';

import { withContext } from '../../context';
import { isBoolean, isNonNullable, isString } from '../../guards';
import { ArrayCallbackParameters, Fragment } from '../../types';
import { entries, pickKeptProperties } from '../../utils';
import type { Oas3WithMetaTranslateFunction } from '../types';
import { translateHeaderObject } from './headers';

const ACCEPTABLE_STYLES: (string | undefined)[] = [
  HttpParamStyles.Form,
  HttpParamStyles.SpaceDelimited,
  HttpParamStyles.PipeDelimited,
  HttpParamStyles.DeepObject,
];

function hasAcceptableStyle<T extends Fragment = Fragment>(
  encodingPropertyObject: T,
): encodingPropertyObject is T & {
  style:
    | HttpParamStyles.Form
    | HttpParamStyles.SpaceDelimited
    | HttpParamStyles.PipeDelimited
    | HttpParamStyles.DeepObject;
} {
  return typeof encodingPropertyObject.style === 'string' && ACCEPTABLE_STYLES.includes(encodingPropertyObject.style);
}

const translateEncodingPropertyObject = withContext<
  Oas3WithMetaTranslateFunction<
    ArrayCallbackParameters<[property: string, encodingPropertyObject: unknown]>,
    Optional<IHttpEncoding<true>>
  >
>(function ([property, encodingPropertyObject]) {
  if (!isPlainObject(encodingPropertyObject)) return;
  if (!hasAcceptableStyle(encodingPropertyObject)) return;

  return {
    property,
    style: encodingPropertyObject.style,
    headers: entries(encodingPropertyObject.headers).map(translateHeaderObject, this).filter(isNonNullable),

    ...pickBy(
      {
        allowReserved: encodingPropertyObject.allowReserved,
        explode: encodingPropertyObject.explode,
      },
      isBoolean,
    ),

    ...pickBy(
      {
        mediaType: encodingPropertyObject.contentType,
      },
      isString,
    ),
  };
});

export const translateMediaTypeObject = withContext<
  Oas3WithMetaTranslateFunction<
    ArrayCallbackParameters<[mediaType: string, mediaObject: unknown]>,
    Optional<IMediaTypeContent<true>>
  >
>(function ([mediaType, mediaObject]) {
  if (!isPlainObject(mediaObject)) return;

  const id = this.generateId.httpMedia({ mediaType });
  const { schema, encoding } = mediaObject;

  return {
    id,
    mediaType,
    // Note that I'm assuming all references are resolved

    /* For comparison, API spec examples aren't needed, because they aren't displayed in operation,
     * but diffs of them are aggregated and displayed in some places, e.g.
     * Response Codes. Also "Examples" panel isn't available for Doc View mode with diffs, only for Doc View mode. */
    // examples:
    encodings: entries(encoding).map(translateEncodingPropertyObject, this).filter(isNonNullable),

    ...pickBy(
      {
        schema: schema,
      },
      isNonNullable,
    ),

    ...pickKeptProperties(mediaObject, this.keepProperties),
  };
});
