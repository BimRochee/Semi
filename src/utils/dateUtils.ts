export function getNowIsoString() {
  return new Date().toISOString();
}

export function formatShortDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate));
}
