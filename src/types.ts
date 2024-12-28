import type { IBundledHttpService, IHttpOperation, IHttpService } from '@stoplight/types';

import { IAsyncOperation } from './asyncapi';
import type { idGenerators } from './generators';

export type Fragment = Record<string, unknown>;

export type IdGenerator = (value: string, skipHashing?: boolean) => string;

export type RefResolver<T extends Fragment = Fragment> = (
  this: TransformerContext<T>,
  input: Fragment & { $ref: string },
) => unknown;

export interface ITransformServiceOpts<T extends Fragment> {
  document: T;
  ctx?: TransformerContext<T>;
  keepProperties?: string[];
}

export type ServiceTransformer<T, R> = (opts: T) => R;
export type HttpServiceTransformer<T> = ServiceTransformer<T, IHttpService>;
// TODO: Change the type when any differences with IHttpService are found
export type AsyncServiceTransformer<T> = ServiceTransformer<T, IHttpService>;

export type HttpServiceBundle<T> = (opts: T) => IBundledHttpService;

export interface ITransformOperationOpts<T extends Fragment> {
  document: T;
  path: string;
  method: string;
  ctx?: TransformerContext<T>;
  keepProperties?: string[];
}

export type OperationTransformer<T, R> = (opts: T) => R;
export type HttpOperationTransformer<T> = OperationTransformer<T, IHttpOperation>;
export type AsyncOperationTransformer<T> = OperationTransformer<T, IAsyncOperation>;

export type ArrayCallbackParameters<T> = [T, number, T[]];

export type AvailableContext = 'service' | 'path' | 'operation';

export type References = Record<string, { resolved: boolean; value: string }>;

export type TransformerContext<T extends Fragment = Fragment> = {
  document: T;
  context: AvailableContext;
  parentId: string;
  readonly ids: Record<AvailableContext, string>;
  readonly references: References;
  generateId: ((template: string) => string) & {
    [key in keyof typeof idGenerators]: (
      props: Omit<Parameters<typeof idGenerators[key]>[0], 'parentId'> & { parentId?: string },
    ) => string;
  };
  maybeResolveLocalRef(target: unknown): unknown;
  keepProperties?: string[];
};

export type TranslateFunction<T extends Fragment, P extends unknown[], R extends unknown = unknown> = (
  this: TransformerContext<T>,
  ...params: P
) => R;
