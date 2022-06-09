// if we want to log events differently depending on their type, we can use the following:

const loggerEvent = [
  'STEP_REACHED',
  'SILENT_SIGNIN',
  'SIGNIN',
  'SWITCH_TENANT',
  'SIGNOUT',
  'ERROR',
  'UNKNOWN',
  'TOUR_STARTED',
] as const;

type LoggerEventsType = typeof loggerEvent[number];

/**
 * The value coming from the api could be different depending on the type of event (my best guess)
 */
type LoggerValue<T extends string | number | Array<any> | Record<any, any>> =
  T extends number
    ? number
    : T extends Array<any>
    ? Array<any>
    : T extends Record<any, any>
    ? Record<any, any>
    : string;

/**
 * An example of how we could log events based on their type. In this example, output is colored differently
 * @param event a string that represents the event type
 * @returns a string to be logged with color applied to it
 */
const reportEvent = (event: LoggerEventsType) => {
  switch (event) {
    case 'STEP_REACHED':
      return '\x1b[32m' + 'Step reached' + '\x1b[0m';
    case 'SILENT_SIGNIN':
      return '\x1b[32m' + 'Single Sign in' + '\x1b[0m';
    case 'ERROR':
      return '\x1b[31m' + 'Error' + '\x1b[0m';
    case 'TOUR_STARTED':
      return '\x1b[32m' + 'Tour started' + '\x1b[0m';
    default:
      return '\x1b[33m' + event + '\x1b[0m';
  }
};

/**
 * The rudimentary logger helper function to log events from the extension.
 * @param event event type as a string.
 * @param value value to be logged.
 * @returns `void` (logs to console).
 */
export const logger = (
  event: LoggerEventsType,
  value: LoggerValue<string | number | Record<any, any>>
): void => {
  // check if the event is an object. If it is, we want to log it as a tour = step number + 1 (steps are 0 indexed)
  if (typeof value !== 'string' && typeof value !== 'number') {
    // lol. Observed when going back from the first step of the second tour in the Lab.
    if (value.stepNumber === -1) {
      return console.log(`[${reportEvent('ERROR')}]`, 'This is awkward 😳');
    }

    return console.log(
      `[${reportEvent(event)}] Tour: "${value.tour.title}", \x1b[37mstep #${
        value.stepNumber + 1
      }\x1b[0m`
    );
  }

  return console.log(`[${reportEvent(event)}] ${value}`);
};
