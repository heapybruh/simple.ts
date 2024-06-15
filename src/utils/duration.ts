export function secondsToDuration(seconds: number): string {
  var duration = ""

  const durationHours = Math.floor(seconds / 3600)
  if (durationHours)
    duration =
      durationHours == 1 ? `${durationHours} hour ` : `${durationHours} hours `

  const durationMinutes = Math.floor((seconds - durationHours * 3600) / 60)
  if (durationMinutes)
    duration =
      duration +
      (durationMinutes == 1
        ? `${durationMinutes} minute `
        : `${durationMinutes} minutes `)

  const durationSeconds = seconds - durationHours * 3600 - durationMinutes * 60
  if (durationSeconds)
    duration =
      duration +
      (durationSeconds == 1
        ? `${durationSeconds} second `
        : `${durationSeconds} seconds `)

  return duration
}
