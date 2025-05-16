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

  finalOfficeDays: number | null = null;
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

  public onSelectionChange(): void {
    this.calculateOfficeDays();
  }

  private loadHolidays(): void {
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

  public calculateOfficeDays(): void {
    const holidaysThisMonth = this.getHolidaysThisMonth();
    const weekdayHolidayDates = this.categorizeHolidays(holidaysThisMonth);
    this.countBusinessAndWeekendDays(weekdayHolidayDates);
    this.calculateFinalOfficeDays();
  }

  private getHolidaysThisMonth(): Holiday[] {
    return this.holidays.filter(({ date }) => {
      const [year, month] = date.split('-').map(Number);
      return (
        Number(year) === Number(this.selectedYear) &&
        Number(month) - 1 === Number(this.selectedMonth)
      );
    });
  }

  private categorizeHolidays(holidays: Holiday[]): string[] {
    this.visibleDays = [];
    this.holidaysOnWeekends = [];
    this.totalWeekdayHolidays = 0;

    const weekdayDates: string[] = [];

    for (const holiday of holidays) {
      const date = new Date(holiday.date);
      const dow = date.getDay();
      const holidayInfo: DayInfo = {
        date: holiday.date,
        description: holiday.description,
        type: 'holiday',
      };

      if (this.isWeekend(dow)) {
        this.holidaysOnWeekends.push(holidayInfo);
      } else {
        this.visibleDays.push(holidayInfo);
        weekdayDates.push(holiday.date);
        this.totalWeekdayHolidays++;
      }
    }

    return weekdayDates;
  }

  private countBusinessAndWeekendDays(weekdayHolidayDates: string[]): void {
    this.totalWeekendDays = 0;
    this.totalBusinessDays = 0;

    const daysInMonth = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      const dow = date.getDay();
      const isoDate = date.toISOString().split('T')[0];

      if (this.isWeekend(dow)) {
        this.totalWeekendDays++;
        continue;
      }

      if (weekdayHolidayDates.includes(isoDate)) continue;

      this.totalBusinessDays++;
    }
  }

  private calculateFinalOfficeDays(): void {
    const effectiveDays = Math.max(0, this.totalBusinessDays - this.PTO);
    this.exactOfficeDays = effectiveDays * this.OFFICE_PERCENTAGE;
    this.finalOfficeDays = Math.min(8, Math.round(this.exactOfficeDays));
  }

  private isWeekend(dow: number): boolean {
    return dow === 0 || dow === 6;
  }
}
