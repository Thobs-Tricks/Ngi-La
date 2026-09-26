namespace Ngila.Api.Common;

// HTML shared by every outbound email. Colors match the customer app's light theme
// (frontend/mobile/customer/constants/theme.ts) so the email looks like it came from the same
// product as the app, not a generic transactional template.
public static class EmailTemplates
{
    public static string BuildActionEmail(string logoUrl, string heading, string bodyHtml, string ctaLabel, string ctaUrl)
    {
        return $$"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{{heading}}</title>
        </head>
        <body style="margin:0; padding:0; background-color:#F9F6EF; font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F6EF; padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#FFFEF9; border:1px solid #E6DFD1; border-radius:16px; overflow:hidden;">
                  <tr>
                    <td align="center" style="padding:32px 32px 8px 32px;">
                      <img src="{{logoUrl}}" alt="Ngila" width="88" style="display:block; margin:0 auto;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:8px 32px 0 32px;">
                      <p style="margin:0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#5A9B7A; font-weight:600;">Discover your local economy</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 32px 0 32px;">
                      <h1 style="margin:0 0 16px 0; font-size:22px; line-height:28px; color:#263D32; font-weight:700;">{{heading}}</h1>
                      <div style="font-size:15px; line-height:24px; color:#294238;">
                        {{bodyHtml}}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:28px 32px;">
                      <a href="{{ctaUrl}}" style="display:inline-block; background-color:#C86F3F; color:#FBF8F0; font-size:15px; font-weight:600; text-decoration:none; padding:14px 32px; border-radius:10px;">{{ctaLabel}}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 32px 8px 32px;">
                      <p style="margin:0; font-size:12px; line-height:18px; color:#747968;">
                        If the button doesn't work, copy and paste this link into your browser:<br />
                        <a href="{{ctaUrl}}" style="color:#C86F3F; word-break:break-all;">{{ctaUrl}}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 32px 32px 32px; border-top:1px solid #E6DFD1;">
                      <p style="margin:16px 0 0 0; font-size:12px; color:#747968;">Ngila &mdash; a community-powered street-economy directory.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;
    }
}
