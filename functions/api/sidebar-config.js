import { onRequest as routeHandler } from './[[route]].js';

export async function onRequest(context) {
  context.params = { ...(context.params || {}), route: ['sidebar-config'] };
  return routeHandler(context);
}
