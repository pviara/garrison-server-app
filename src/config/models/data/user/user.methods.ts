import { IUserDocument } from './user.types';

import bcrypt from 'bcrypt';
import pswGen from 'generate-password';

import mjml2html from 'mjml';

import mailingService from '../../../services/mailing.service';

import newUserEmail from '../../../../store/template/e-mail/new-user.email';

/**
 * Generate a new random, hashed password for the current user.
 * @param this Current user.
 */
export async function generatePassword(this: IUserDocument) {
  // generate the random password
  const password = pswGen.generate({
    length: 8,
    numbers: true,
    symbols: true,
    exclude: '|~^¨<\\'
  });

  // generate both salt and hash
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // store them both in database
  this.password = { hash, salt };
  
  // prepare the e-mail to send
  let emailContent = newUserEmail.generateHTML(this.username, this.email, password);
  emailContent = mjml2html(emailContent).html;

  // send the foresaid e-mail
  await mailingService.send(this.email, 'Your credentials', emailContent);

  // finally save the user in database
  this.save();
}