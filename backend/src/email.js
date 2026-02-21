const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendConfirmationEmail(studentEmail, request) {
  await resend.emails.send({
    from: 'FabLab <onboarding@resend.dev>',
    to: process.env.LAB_EMAIL,
    subject: `New Print Request #${request.id} from ${request.student_name}`,
    html: `
      <div style="font-family: Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1E1E1E; color: #F4F4F4; border-radius: 12px;">
        <h1 style="color: #F58220;">New Print Request!</h1>
        <p>A new print request has been submitted and is waiting for your review.</p>
        
        <div style="background: #2A2A2A; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Request ID:</strong> #${request.id}</p>
          <p><strong>Student:</strong> ${request.student_name}</p>
          <p><strong>Student Email:</strong> ${studentEmail}</p>
          <p><strong>Type:</strong> ${request.request_type}</p>
          <p><strong>Requested Date:</strong> ${request.requested_date}</p>
          <p><strong>File:</strong> ${request.file_name}</p>
        </div>

        <a href="${process.env.FRONTEND_URL}/admin" style="color: #2D9CDB;">Go to Admin Dashboard</a>

        <p style="color: #BDBDBD; font-size: 0.85rem; margin-top: 30px;">School FabLab — 3D Print Lab Request System</p>
      </div>
    `,
  });
}

module.exports = { sendConfirmationEmail };