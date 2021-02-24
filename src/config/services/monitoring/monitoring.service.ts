import { ELogType } from '../../models/log/log.model';

/**
 * Application global monitoring service. Handle processes and results.
 */
export default class MonitoringService {
  // https://github.com/mochajs/mocha/blob/9e95d36e4b715380cef573014dec852bded3f8e1/lib/reporters/base.js#L48
  private _colors: Record<ELogType, string> = {
    "0": '36',
    "1": '90',
    "2": '31'
  };

  constructor(private _context: string) {}
  
  /**
   * Log a message to the console.
   * @param type Log type.
   * @param message Message to display.
   * @param context The name of the monitored class.
   */
  log(type: ELogType, message: string, context = this._context) {
    const color = this._colors[type];
    console.log(`> ${context ? `${context} ` : ''}\u001b[${color}m${message}\u001b[0m`);
  }
}