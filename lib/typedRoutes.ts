import type {Route} from 'next';

export function asRoute(p: string): Route {
  return p as Route;
}
