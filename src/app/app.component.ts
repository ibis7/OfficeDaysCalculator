import { Component } from '@angular/core';
import { OfficeDaysComponent } from './office-days/office-days.component';

@Component({
  selector: 'app-root',
  imports: [OfficeDaysComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'office-days-app';
}
