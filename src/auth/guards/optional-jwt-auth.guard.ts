import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  // Override canActivate to not throw error when token is missing
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Try to activate, but catch errors and allow request to proceed
    const result = super.canActivate(context);
    if (result instanceof Promise) {
      return result.catch(() => true);
    }
    if (result instanceof Observable) {
      return result.pipe(catchError(() => of(true)));
    }
    return result;
  }

  // Override handleRequest to not throw when user is not found
  handleRequest(err: any, user: any, _info: any) {
    // Return user if authenticated, otherwise return undefined
    // Don't throw error if user is not authenticated
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
