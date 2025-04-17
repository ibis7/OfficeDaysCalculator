// src/app/office-days/office-days.component.ts
import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Holiday {
  date: string;
  description: string;
}

@Component({
  selector: 'app-office-days',
  templateUrl: './office-days.component.html',
  styleUrls: ['./office-days.component.scss'],
  imports: [FormsModule, NgIf, NgFor], // Add any necessary imports here
})
export class OfficeDaysComponent implements OnInit {
  PTO: number = 0;
  holidays: Holiday[] = [];
  officeDays: number | null = null;
  holidayDescriptions: string[] = [];

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

  onSelectionChange() {
    this.calculateOfficeDays();
  }

  loadHolidays(): void {
    fetch('assets/holidays.json')
      .then((response) => response.json())
      .then((data: Holiday[]) => {
        this.holidays = data;
        this.calculateOfficeDays();
      })
      .catch((error) => {
        console.error('Error loading holidays:', error);
      });
  }

  calculateOfficeDays(): void {
    const holidaysThisMonth = this.holidays.filter((h) => {
      const date = new Date(h.date);
      return (
        date.getFullYear() === this.selectedYear &&
        date.getMonth() === this.selectedMonth
      );
    });

    const weekdayHolidays = new Set<string>();
    this.holidayDescriptions = [];

    holidaysThisMonth.forEach((h) => {
      const date = new Date(h.date);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6) {
        weekdayHolidays.add(h.date);
      }
      this.holidayDescriptions.push(`${h.date}: ${h.description}`);
    });

    const daysInMonth = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();
    let businessDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      const dow = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      if (dow === 0 || dow === 6) continue;
      if (weekdayHolidays.has(dateStr)) continue;

      businessDays++;
    }

    const effectiveDays = Math.max(0, businessDays - this.PTO);
    this.officeDays = Math.floor(effectiveDays * this.OFFICE_PERCENTAGE);
  }
}
