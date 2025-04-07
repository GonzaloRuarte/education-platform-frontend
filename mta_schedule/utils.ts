import dayjs, { Dayjs } from 'dayjs'

const hoursOptions = (args: { startHour: number; endHour: number; stepMinutes: number }) => {
  const options: Array<{ value: string; label: string }> = []
  for (let hour = args.startHour; hour <= args.endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += args.stepMinutes) {
      const timeLabel = `${hour}:${minutes.toString().padStart(2, '0')} hs`
      options.push({ value: `${hour}:${minutes.toString().padStart(2, '0')}`, label: timeLabel })
    }
  }
  return options
}

const combinedDateAndTime = (args: { date: Dayjs; time: string }) =>
  dayjs(args.date.format('YYYY-MM-DD'))
    .hour(parseInt(args.time.split(':')[0]))
    .minute(parseInt(args.time.split(':')[1]))
    .toISOString()

export { hoursOptions, combinedDateAndTime }
