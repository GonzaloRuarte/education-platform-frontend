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

export default hoursOptions
