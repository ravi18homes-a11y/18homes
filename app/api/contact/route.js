// PUBLIC/api/contact/route.js
import nodemailer from "nodemailer";

// Declare Node.js runtime for Next.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { name, phone, website, discussion, email } = await req.json();

    if (!name || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Name and phone number are required!" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const safeEmail = (email && email.trim().length > 0) ? email.trim() : "";
    const safeDiscussion = (discussion && discussion.trim().length > 0) ? discussion.trim() : "General Property Inquiry via 18Homes Website";
    const safeWebsite = (website && website.trim().length > 0) ? website.trim() : "General";

    //  SMTP Transporter (PUBLIC password / server creds use karo)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "ravi18homes@gmail.com",
        pass: "hhlgajvfqumgiror",
      },
    });

    //  Admin ko notification
    const adminMailOptions = {
      from: '"18 Homes" <ravi18homes@gmail.com>',
      to: "ravi18homes@gmail.com",
      subject: `New Lead: ${name} (${safeWebsite})`,
      html: `
        <div style="font-family: Poppins, sans-serif; background:#f4f4f7; padding:30px; color:#333;">
          <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <tr>
              <td style="background:#1d4ed8; padding:20px; text-align:center; color:#fff;">
                <h2 style="margin:0; font-size:24px;">18 Homes</h2>
                <p style="margin:5px 0 0; font-size:14px; opacity:0.9;">New Customer Inquiry Received</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <p style="font-size:16px; margin-bottom:15px; font-weight:600; color:#1e293b;">You have received a new contact inquiry:</p>
                <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse; font-size:15px; border:1px solid #e2e8f0; border-radius:8px;">
                  <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;"><td style="font-weight:bold; width:130px; color:#475569;">👤 Full Name:</td><td style="color:#0f172a; font-weight:600;">${name}</td></tr>
                  <tr style="border-bottom:1px solid #e2e8f0;"><td style="font-weight:bold; color:#475569;">📧 Email:</td><td>${safeEmail ? `<a href="mailto:${safeEmail}" style="color:#2563eb; text-decoration:none;">${safeEmail}</a>` : `<span style="color:#64748b; font-style:italic;">Not Provided</span>`}</td></tr>
                  <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;"><td style="font-weight:bold; color:#475569;">📞 Phone:</td><td><a href="tel:${phone}" style="color:#2563eb; font-weight:600; text-decoration:none;">+91 ${phone}</a></td></tr>
                  <tr style="border-bottom:1px solid #e2e8f0;"><td style="font-weight:bold; color:#475569;">🏠 Requirement / Type:</td><td style="color:#0f172a; font-weight:500;">${safeWebsite}</td></tr>
                  <tr style="background:#f8fafc;"><td style="font-weight:bold; color:#475569;">💬 Message:</td><td style="color:#334155;">${safeDiscussion}</td></tr>
                </table>
                <div style="margin-top:20px; padding:12px; background:#eff6ff; border-radius:8px; border-left:4px solid #2563eb; font-size:13px; color:#1e40af;">
                  💡 <strong>Tip:</strong> Quick responses within 15 minutes convert 3x better into property visits!
                </div>
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

    // Send user email if email was provided
    if (safeEmail && safeEmail.includes("@")) {
      const userMailOptions = {
        from: '"18 Homes" <ravi18homes@gmail.com>',
        to: safeEmail,
        subject: "Thank You for Contacting 18 Homes!",
        html: `
          <div style="font-family: Poppins, sans-serif; background:#f4f4f7; padding:20px; color:#333;">
            <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
              <tr>
                <td style="background:#1d4ed8; padding:25px; text-align:center; color:#fff;">
                  <h1 style="margin:0; font-size:24px;">Thank You, ${name}!</h1>
                  <p style="margin:6px 0 0; font-size:14px; opacity:0.9;">We have received your requirement.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:30px; text-align:center;">
                  <p style="font-size:16px; margin-bottom:16px; color:#334155; line-height:1.6;">
                    Our dedicated property specialist at <strong>18 Homes</strong> has received your inquiry and will contact you shortly to help you find the best property in Delhi-NCR.
                  </p>
                  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin:20px 0; text-align:left;">
                    <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Summary of Inquiry</p>
                    <p style="margin:4px 0; font-size:14px; color:#1e293b;"><strong>Requirement:</strong> ${safeWebsite}</p>
                    <p style="margin:4px 0; font-size:14px; color:#1e293b;"><strong>Contact:</strong> ${phone}</p>
                  </div>
                  <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:20px auto;">
                    <tr>
                      <td align="center" bgcolor="#1d4ed8" style="border-radius:8px;">
                        <a href="https://18homes.in" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#fff; text-decoration:none; border-radius:8px;">Explore More Properties</a>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size:13px; color:#64748b; margin-top:25px;">Need immediate assistance? Call or WhatsApp us at <strong>+91 8796763688</strong>.</p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f9f9; padding:15px; text-align:center; font-size:12px; color:#64748b; border-top:1px solid #e2e8f0;">
                  © ${new Date().getFullYear()} 18 Homes. All rights reserved.
                </td>
              </tr>
            </table>
          </div>
        `,
      };

      try {
        await transporter.sendMail(userMailOptions);
        console.log(" User mail sent successfully");
        emailStatus.user = true;
      } catch (emailError) {
        console.error(" User email error:", emailError.message);
        errors.push({ type: 'user_email', error: emailError.message });
      }
    } else {
      // Email was not provided, which is valid
      emailStatus.user = true;
    }

    //  Determine response based on what succeeded
    if (emailStatus.admin) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Inquiry submitted successfully!",
          status: emailStatus,
          warnings: errors.length > 0 ? errors : undefined
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      // Critical failure - admin email not sent
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to send inquiry email. Please try calling directly.",
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
