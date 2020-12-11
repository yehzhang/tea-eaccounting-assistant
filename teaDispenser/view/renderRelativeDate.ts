function renderRelativeDate(date: Date): string {
  const elapsedMs = date.getTime() - Date.now();
  for (const [unit, timeMs] of timeUnitsMs) {
    if (timeMs < Math.abs(elapsedMs)) {
      return relativeTimeFormat.format(Math.round(elapsedMs / timeMs), unit)
    }
  }
  return relativeTimeFormat.format(Math.round(elapsedMs / 1000), 'second')
}

const timeUnitsMs = [
  ['year', 24 * 60 * 60 * 1000 * 365],
  ['month', 24 * 60 * 60 * 1000 * 30],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
] as const;

const relativeTimeFormat = new Intl.RelativeTimeFormat('zh', {
  numeric: 'auto',
  style: 'narrow',
});

export default renderRelativeDate;
