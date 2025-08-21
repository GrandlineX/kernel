import 'reflect-metadata';
import { ObjectLike } from '@grandlinex/core';
import { SSchemaEl } from '@grandlinex/swagger-mate';
import { ActionTypes } from '../lib/index.js';
import { ActionMode } from '../classes/index.js';

const routeKey = Symbol('route');

export type RouteMeta = {
  type: ActionTypes;
  path: string;
  mode?: ActionMode;
  schema?: SSchemaEl;
};

export const Route = (
  type: ActionTypes,
  path: string,
  mode?: ActionMode,
  schema?: SSchemaEl,
): ClassDecorator => {
  return (target) => {
    const metadata: RouteMeta = {
      type,
      path,
      mode,
      schema,
    };
    Reflect.defineMetadata(routeKey, metadata, target.prototype);
  };
};

export function getRouteMeta<T extends ObjectLike>(
  target: T,
): RouteMeta | undefined {
  return Reflect.getMetadata(routeKey, target.constructor.prototype);
}
