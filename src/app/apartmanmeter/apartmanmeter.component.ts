import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-apartmanmeter',
  styleUrl: './apartmanmeter.component.css',
  templateUrl: './apartmanmeter.component.html',
})
export class ApartmanmeterComponent {}
