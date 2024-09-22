import { TestBed } from '@angular/core/testing';

import { AttivitaService } from './attivita.service';

describe('AttivitaService', () => {
  let service: AttivitaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttivitaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
