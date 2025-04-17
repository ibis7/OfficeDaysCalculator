// src/app/office-days/office-days.component.ts
import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Holiday {
  date: string;
  description: string;
}

interface DayInfo {
  date: string;
  description: string;
  type: 'holiday' | 'pto';
}

@Component({
  selector: 'app-office-days',
  templateUrl: './office-days.component.html',
  styleUrls: ['./office-days.component.scss'],
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
})
export class OfficeDaysComponent implements OnInit {
  PTO: number = 0;
  holidays: Holiday[] = [];

  selectedMonth: number;
  selectedYear: number;

  readonly OFFICE_PERCENTAGE = 0.4;

  years: number[];
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  officeDaysRounded: number | null = null;
  exactOfficeDays: number = 0;
  totalBusinessDays: number = 0;
  totalWeekendDays: number = 0;
  totalWeekdayHolidays: number = 0;

  visibleDays: DayInfo[] = [];
  holidaysOnWeekends: DayInfo[] = [];

  constructor() {
    const today = new Date();
    this.selectedMonth = today.getMonth();
    this.selectedYear = today.getFullYear();
    this.years = [
      this.selectedYear - 1,
      this.selectedYear,
      this.selectedYear + 1,
    ];
  }

  ngOnInit(): void {
    this.loadHolidays();
  }

  onSelectionChange(): void {
    this.calculateOfficeDays();
  }

  loadHolidays(): void {
    fetch('assets/holidays.json')
      .then((response) => response.json())
      .then((data: Holiday[]) => {
        this.holidays = data.map((h) => {
          const [year, month, day] = h.date.split('-').map(Number);
          const date = new Date(Date.UTC(year, month - 1, day));
          const formattedDate = date.toISOString().split('T')[0];
          return {
            date: formattedDate,
            description: h.description,
          };
        });

        this.calculateOfficeDays();
      })
      .catch((error) => {
        console.error('Error loading holidays:', error);
      });
  }

  calculateOfficeDays(): void {
    const holidaysThisMonth = this.holidays.filter((h) => {
      const [year, month, day] = h.date.split('-').map(Number);
      return year === this.selectedYear && month - 1 == this.selectedMonth;
    });

    const weekdayHolidays = new Set<string>();
    this.totalWeekdayHolidays = 0;
    this.visibleDays = [];
    this.holidaysOnWeekends = [];

    holidaysThisMonth.forEach((h) => {
      const date = new Date(h.date);
      const dow = date.getDay();
      if (!this.isWeekend(dow)) {
        weekdayHolidays.add(h.date);
        this.totalWeekdayHolidays++;
        this.visibleDays.push({
          date: h.date,
          description: h.description,
          type: 'holiday',
        });
      } else {
        this.holidaysOnWeekends.push({
          date: h.date,
          description: h.description,
          type: 'holiday',
        });
      }
    });

    const daysInMonth = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();
    this.totalWeekendDays = 0;
    this.totalBusinessDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      const dow = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      if (this.isWeekend(dow)) {
        this.totalWeekendDays++;
        continue;
      }
      if (weekdayHolidays.has(dateStr)) continue;

      this.totalBusinessDays++;
    }

    const effectiveDays = Math.max(0, this.totalBusinessDays - this.PTO);
    this.exactOfficeDays = effectiveDays * this.OFFICE_PERCENTAGE;
    this.officeDaysRounded = Math.round(this.exactOfficeDays);
  }

  private isWeekend(dow: number): boolean {
    return dow === 0 || dow === 6;
  }
}
