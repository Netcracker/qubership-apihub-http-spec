import { isPlainObject } from '@stoplight/json';
import type {
  BaseParameterObject,
  CustomHeadersObject,
  CustomRequestBodyObject, 
  CustomResponseObject,
  OAuthFlowObject,
  SecuritySchemeObject,
  ServerObject,
  ServerVariableObject,
} from 'openapi3-ts';

export function isObject(maybeObject?: unknown): maybeObject is Record<PropertyKey, unknown> {
  return !!maybeObject && typeof maybeObject === 'object'
}

export const isSecurityScheme = (maybeSecurityScheme: unknown): maybeSecurityScheme is SecuritySchemeObject =>
  isPlainObject(maybeSecurityScheme) && typeof maybeSecurityScheme.type === 'string';

export const isBaseParameterObject = (
  maybeBaseParameterObject: unknown,
): maybeBaseParameterObject is BaseParameterObject =>
  isPlainObject(maybeBaseParameterObject) &&
  ('description' in maybeBaseParameterObject ||
    'required' in maybeBaseParameterObject ||
    'content' in maybeBaseParameterObject ||
    'style' in maybeBaseParameterObject ||
    'examples' in maybeBaseParameterObject ||
    'example' in maybeBaseParameterObject ||
    'schema' in maybeBaseParameterObject ||
    'name' in maybeBaseParameterObject);

export const isHeaderObject = (maybeHeaderObject: unknown): maybeHeaderObject is CustomHeadersObject =>
  isBaseParameterObject(maybeHeaderObject);

export const isServerObject = (maybeServerObject: unknown): maybeServerObject is ServerObject =>
  isPlainObject(maybeServerObject) && typeof maybeServerObject.url === 'string';

export const isServerVariableObject = (
  maybeServerVariableObject: unknown,
): maybeServerVariableObject is ServerVariableObject => {
  if (!isPlainObject(maybeServerVariableObject)) return false;
  const typeofDefault = typeof maybeServerVariableObject.default;
  return typeofDefault === 'string' || typeofDefault === 'boolean' || typeofDefault === 'number';
};

export const isResponseObject = (maybeResponseObject: unknown): maybeResponseObject is CustomResponseObject =>
  isPlainObject(maybeResponseObject) &&
  ('description' in maybeResponseObject ||
    'headers' in maybeResponseObject ||
    'content' in maybeResponseObject ||
    'links' in maybeResponseObject);

export const isOAuthFlowObject = (maybeOAuthFlowObject: unknown): maybeOAuthFlowObject is OAuthFlowObject =>
  isPlainObject(maybeOAuthFlowObject) && isPlainObject(maybeOAuthFlowObject.scopes);

export const isRequestBodyObject = (maybeRequestBodyObject: unknown): maybeRequestBodyObject is CustomRequestBodyObject =>
  isPlainObject(maybeRequestBodyObject) && isPlainObject(maybeRequestBodyObject.content);
