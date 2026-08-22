import { onRequest as routeHandler } from '../[[route]].js';

export async function onRequest(context) {
  context.params = { ...(context.params || {}), route: ['questions', 'free'] };
  return routeHandler(context);
}
