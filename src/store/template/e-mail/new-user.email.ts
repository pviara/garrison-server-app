import { IEmailTemplate } from '../../../config/models/template/e-mail.template.model';

class NewUserEmailTemplate implements IEmailTemplate {
  generateHTML(name: string, email: string, password: string) {
    return `
      <mjml>
        <mj-head>
          <mj-title>Welcome to Garrison</mj-title>
          <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto:300,500"></mj-font>
          <mj-attributes>
            <mj-all font-family="Roboto, Helvetica, sans-serif"></mj-all>
            <mj-text font-weight="300" font-size="16px" color="#616161" line-height="24px"></mj-text>
            <mj-section padding="0px"></mj-section>
          </mj-attributes>
        </mj-head>

        <mj-body>
          <mj-section padding-top="30px">
            <mj-column width="75%">
              <mj-image src="https://nsa40.casimages.com/img/2020/11/17/201117013529387691.png"></mj-image>
            </mj-column>
          </mj-section>
        
          <mj-section>
            <mj-column width="100%">
              <mj-divider border-width="1px" border-color="#E0E0E0" padding-bottom="25px" padding-top="25px"></mj-divider>
            </mj-column>
          </mj-section>

          <mj-section>
            <mj-column padding-top="0" width="100%">
              <mj-text>
                <p style="margin-bottom:35px">	
                  Hello <strong>${name}</strong>,
                </p>
                <p>We are pleased to announce you that your account has been created.</p>
                <p>Here are your credentials, keep them safe :
                  <ul>
                    <li>e-mail : <a href="" style="cursor:default; text-decoration:none; font-weight:bold; font-style:italic;">${email}</a></li>
                    <li>password : <a href="" style="cursor:default; text-decoration:none; font-weight:bold; font-style:italic;">${password}</a></li>
                  </ul>
                </p>
              </mj-text>
            </mj-column>
          </mj-section>
    
          <mj-section>
            <mj-column width="100%">
              <mj-text>
                <p>Cordially,</p>
              </mj-text>
            </mj-column>
          </mj-section>
        
          <mj-section>
            <mj-column width="100%">
              <mj-text color="#BDBDBD">
                <p>
                  <strong>fairyfingers</strong>
                  <br>Founder at Garrison
                </p>
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
  }
}

export = new NewUserEmailTemplate();