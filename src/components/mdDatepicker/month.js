import moment from 'moment';
import 'moment-range';

export default class Month {
  constructor(month, year) {
    this.start = moment([year, month]);
    this.end = this.start.clone().endOf('month');
    this.month = month;
    this.year = year;
  }

  getWeekStart() {
    return this.start.weekday();
  }

  getDays() {
    return moment.range(this.start, this.end).toArray('days');
  }

  getFormatted() {
    return this.start.format('MMMM YYYY');
  }

  getWeeks() {
    return this.end.week() - this.start.week() + 1; // eslint-disable-line
  }

  getYears() {
    const start = moment([this.start.year() - 50, 0]),
      end = moment([this.start.year() + 50, 0]);

    return moment.range(start, end).toArray('years');
  }
}

export function getWeekDays(lang) {
  const days = [];

  moment.locale(lang);

  for (let i = 0; i < 7; i += 1) {
    days.push(moment().weekday(i).format('dd'));
  }

  return days;
}
