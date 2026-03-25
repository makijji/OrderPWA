import { format } from 'date-fns'

export function formatDateTime(value?: string): string {
  if (!value) return 'Never'
  return format(new Date(value), 'yyyy-MM-dd HH:mm')
}

export function formatDate(value: string): string {
  return format(new Date(value), 'yyyy-MM-dd')
}

export function pluralize(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`
}
