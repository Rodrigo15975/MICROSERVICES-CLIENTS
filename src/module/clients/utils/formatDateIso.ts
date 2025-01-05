import { addMonths, parseISO } from 'date-fns'

export function convertedDateISO(date?: string): {
  startDate: string
  endDate: string
} {
  const startDate = date ? parseISO(date) : new Date()
  const parsedStartDate = startDate.toISOString()
  const parsedEndDate = addMonths(startDate, 1).toISOString()

  return {
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  }
}
