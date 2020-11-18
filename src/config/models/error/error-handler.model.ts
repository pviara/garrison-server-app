/**
 * Custom error class.
 */
export default class ErrorHandler extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super();
  }
}