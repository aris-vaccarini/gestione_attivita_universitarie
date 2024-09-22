import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttivitaComponent } from './attivita.component';

describe('AuthComponent', () => {
  let component: AttivitaComponent;
  let fixture: ComponentFixture<AttivitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttivitaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttivitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
