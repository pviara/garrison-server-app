/**
 * The representation of an e-mail template.
 */
export interface IEmailTemplate {
  /**
   * Generate the HTML content of the e-mail.
   * @param placeholders Placeholders to put in the content.
   */
  generateHTML(...placeholders: string[]): string;
}