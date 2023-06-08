export type Event = {
  kind: string
  id: string
  created: Date
  eventType: string
  status: 'confirmed' | 'deleted' | 'accepted'
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  summary: string
}
