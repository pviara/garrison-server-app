import MonitoringService from '../services/monitoring/monitoring.service';

/**
 * Contract to observe to be monitored.
 */
export default interface IMonitored {
  /** Monitor getter property. */
  readonly monitor: MonitoringService;
}