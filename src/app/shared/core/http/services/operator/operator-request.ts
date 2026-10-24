import { HttpHeaders, type HttpParams } from '@angular/common/http';
import type { SessionService } from '../../../base/services/accounts/session.service';
import type { RouteDelayService } from '../../../base/services/platform/route-delay.service';

const DEMO_OPERATOR_USER_HEADER = 'X-Demo-User-Id';

export function operatorRequestOptions(session: ReturnType<SessionService['currentSession']>, params?: HttpParams): { headers?: HttpHeaders; params?: HttpParams } {
  const options: { headers?: HttpHeaders; params?: HttpParams } = {};
  if (session?.kind === 'demo') {
    options.headers = new HttpHeaders({
      [DEMO_OPERATOR_USER_HEADER]: session.userId.trim()
    });
  }
  if (params) {
    options.params = params;
  }
  return options;
}

export async function requireOperatorResponse<T>(routeDelay: RouteDelayService, route: string, task: Promise<T | undefined>): Promise<T> {
  const response = await routeDelay.withRequestTimeout(
    route,
    task,
    'operator.request.timeout'
  );
  if (!response) {
    throw new Error('operator.registration.error.response.unavailable');
  }
  return response;
}
