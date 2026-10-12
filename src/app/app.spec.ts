import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [provideRouter([])],
  }).compileComponents();
});

describe('App', () => {
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
