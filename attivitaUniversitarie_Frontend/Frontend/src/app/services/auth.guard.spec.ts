import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

class MockRouter {
  navigate(path: string[]) {}
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PLATFORM_ID, useValue: 'browser' } // Simula la piattaforma come 'browser'
      ]
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if token exists and platform is browser', () => {
    spyOn(localStorage, 'getItem').and.returnValue('some-token');
    spyOn(router, 'navigate');

    const result = guard.canActivate();

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect if token does not exist', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(router, 'navigate');

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('should deny access and redirect if platform is not browser', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    spyOn(localStorage, 'getItem').and.returnValue('some-token');
    spyOn(router, 'navigate');

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });
});
