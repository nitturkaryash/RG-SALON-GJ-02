export const generateTimeOptions = (intervalMinutes: number = 15) => {
  const options = [];
  const totalMinutesInDay = 24 * 60;

  for (
    let minutes = 0;
    minutes < totalMinutesInDay;
    minutes += intervalMinutes
  ) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const time = `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    options.push({
      value: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
      label: time,
    });
  }

  return options;
};

export const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const parseTime = (timeString: string): Date => {
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const subtractMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() - minutes * 60000);
};

export const getTimeSlots = (
  startTime: Date,
  endTime: Date,
  intervalMinutes: number = 15
): Date[] => {
  const slots: Date[] = [];
  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    slots.push(new Date(currentTime));
    currentTime = addMinutes(currentTime, intervalMinutes);
  }

  return slots;
};

export const isTimeInRange = (
  time: Date,
  startTime: Date,
  endTime: Date
): boolean => {
  return time >= startTime && time <= endTime;
};

export const roundToNearestMinutes = (
  date: Date,
  minutes: number = 15
): Date => {
  const ms = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
};

export const getBusinessHours = () => {
  return {
    start: 9, // 9 AM
    end: 21, // 9 PM
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Sunday to Saturday
  };
};
