export type Event = {
  kind: string;
  id: string;
  created: Date;
  eventType: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  summary: string;
};
