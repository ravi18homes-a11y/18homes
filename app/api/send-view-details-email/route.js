import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { user, property } = await request.json();

    if (!user || !property) {
      return NextResponse.json({ error: 'Missing user or property details' }, { status: 400 });
    }

    const host = request.headers.get("host") || "www.18homes.in";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    const propertyId = property._id || property.id;
    const propertyUrl = propertyId ? `${baseUrl}/buy/property-details?id=${propertyId}` : null;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "ravi18homes@gmail.com",
        pass: "hhlgajvfqumgiror",
      },
    });

    const mailOptions = {
      from: '"18Homes Notification" <ravi18homes@gmail.com>',
      to: "ravi18homes@gmail.com", // Sending to admin
      subject: `New Lead: User viewed details for property "${property.title || 'Untitled'}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #e53e3e; margin: 0;">New Property Lead!</h2>
            <p style="color: #718096; margin-top: 5px;">A user has unlocked the contact details for a property.</p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3182ce;">
            <h3 style="margin-top: 0; color: #2d3748; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">User Details (The Lead)</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${user.name || 'N/A'}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${user.email}" style="color: #3182ce;">${user.email || 'N/A'}</a></p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${user.phone}" style="color: #3182ce;">${user.phone || 'N/A'}</a></p>
          </div>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #e53e3e;">
            <h3 style="margin-top: 0; color: #2d3748; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Property Details</h3>
            <p style="margin: 8px 0;"><strong>Title:</strong> ${property.title || 'N/A'}</p>
            <p style="margin: 8px 0;"><strong>Price:</strong> ${property.formattedPrice || (property.price ? `₹${property.price}` : 'N/A')}</p>
            <p style="margin: 8px 0;"><strong>Status:</strong> ${property.status || 'N/A'}</p>
            <p style="margin: 8px 0;"><strong>Owner:</strong> ${property.owner?.name || 'N/A'}</p>
            ${propertyUrl ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0;">
              <a href="${propertyUrl}" style="display: inline-block; background-color: #e53e3e; color: #ffffff; padding: 10px 15px; border-radius: 5px; text-decoration: none; font-weight: bold;">View Property Details</a>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #718096;">Link: <a href="${propertyUrl}" style="color: #3182ce; text-decoration: underline;">${propertyUrl}</a></p>
            </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <p style="font-size: 12px; color: #a0aec0; margin: 0;">This is an automated message from your 18Homes Platform.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
