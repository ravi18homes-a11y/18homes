// PUBLIC/api/contact/route.js
import nodemailer from "nodemailer";

// Declare Node.js runtime for Next.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { name, phone, website, discussion, email } = await req.json();

    if (!name || !phone || !discussion || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "All fields are required!" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    //  SMTP Transporter (PUBLIC password / server creds use karo)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "ravi18homes@gmail.com",
        pass: "evcceopqlgqmvosi",
      },
    });

    //  Admin ko notification
    const adminMailOptions = {

      from: '"18 Homes" <ravi18homes@gmail.com>',
      to: "ravi18homes@gmail.com",

      subject: "New Contact Form Submission",
      html: `
        <div style="font-family: Poppins, sans-serif; background:#f4f4f7; padding:30px; color:#333;">
          <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <tr>
              <td style="background:#4f46e5; padding:20px; text-align:center; color:#fff;">
                <h2 style="margin:0;">18 Homes</h2>
                <p style="margin:5px 0 0; font-size:14px;">New Contact Request</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <p style="font-size:16px; margin-bottom:15px;">You have received a new message:</p>
                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; font-size:15px;">
                  <tr style="background:#f9f9f9;"><td style="font-weight:bold; width:120px;">👤 Name:</td><td>${name}</td></tr>
                  <tr><td style="font-weight:bold;">📧 Email:</td><td>${email}</td></tr>
                  <tr style="background:#f9f9f9;"><td style="font-weight:bold;">📞 Phone:</td><td>${phone}</td></tr>
                  <tr><td style="font-weight:bold;">🌐Flat type:</td><td>${website || "N/A"}</td></tr>
                  <tr style="background:#f9f9f9;"><td style="font-weight:bold;">💬 Message:</td><td>${discussion}</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    //  User ko Thank You email
    const userMailOptions = {
      from: '"18 Homes" <ravi18homes@gmail.com>',
      to: email,
      subject: "Thank You for Contacting Us!",
      html: `
        <div style="font-family: Poppins, sans-serif; background:#f4f4f7; padding:20px; color:#333;">
          <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <tr>
              <td style="background:#4f46e5; padding:25px; text-align:center; color:#fff;">
                <h1 style="margin:0; font-size:24px;">Thank You, ${name}!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px; text-align:center;">
                <p style="font-size:16px; margin-bottom:20px;">We have received your request and our team will get back to you shortly.</p>
                <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:20px auto;">
                  <tr>
                    <td align="center" bgcolor="#4f46e5" style="border-radius:8px;">
                      <a href="https://DJharmony" style="display:inline-block; padding:12px 24px; font-size:16px; color:#fff; text-decoration:none; border-radius:8px;">Visit Our Website</a>
                    </td>
                  </tr>
                </table>
                <p style="font-size:14px; color:#777; margin-top:25px;">If you didn't make this request, you can ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9f9f9; padding:15px; text-align:center; font-size:13px; color:#666;">
                © ${new Date().getFullYear()} Kushel Digi Solutions. All rights reserved.
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    //  Better error handling - Execute all operations with proper error catching
    let emailStatus = { admin: false, user: false, lead: false };
    let errors = [];

    // Send admin email
    try {
      await transporter.sendMail(adminMailOptions);
      console.log("Admin mail sent successfully");
      emailStatus.admin = true;
    } catch (emailError) {
      console.error(" Admin email error:", emailError.message);
      errors.push({ type: 'admin_email', error: emailError.message });
    }

    // Send user email
    try {
      await transporter.sendMail(userMailOptions);
      console.log(" User mail sent successfully");
      emailStatus.user = true;
    } catch (emailError) {
      console.error(" User email error:", emailError.message);
      errors.push({ type: 'user_email', error: emailError.message });
    }


    

    //  Determine response based on what succeeded
    const allSuccess = emailStatus.admin && emailStatus.user && emailStatus.lead;
    const criticalSuccess = emailStatus.admin || emailStatus.user; // At least one email sent

    if (allSuccess) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Emails sent and lead created successfully!",
          status: emailStatus
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else if (criticalSuccess) {
      // Partial success - emails sent but lead might have failed
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Emails sent successfully!",
          status: emailStatus,
          warnings: errors.length > 0 ? errors : undefined
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      // Critical failure - no emails sent
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to send emails",
          details: errors
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error("Critical error in contact route:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
