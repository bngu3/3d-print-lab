const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendConfirmationEmail(to, request) {
  await resend.emails.send({
    from: 'FabLab <onboarding@resend.dev>',
    to,
    subject: `Print Request Confirmed — Request #${request.id}`,
    html: `
      <div style="font-family: Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1E1E1E; color: #F4F4F4; border-radius: 12px;">
        <h1 style="color: #F58220;"> Print Request Received!</h1>
        <p>Your 3D print request has been submitted and is <strong>pending review</strong> by the lab assistant.</p>
        
        <div style="background: #2A2A2A; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Request ID:</strong> #${request.id}</p>
          <p><strong>Name:</strong> ${request.student_name}</p>
          <p><strong>Type:</strong> ${request.request_type}</p>
          <p><strong>Requested Date:</strong> ${request.requested_date}</p>
          <p><strong>File:</strong> ${request.file_name}</p>
        </div>

        <p>Use your Request ID to check your status at:</p>
        <a href="${process.env.FRONTEND_URL}/status" style="color: #2D9CDB;">${process.env.FRONTEND_URL}/status</a>

        <p style="color: #BDBDBD; font-size: 0.85rem; margin-top: 30px;">School FabLab — 3D Print Lab Request System</p>
      </div>
    `,
  });
}

module.exports = { sendConfirmationEmail };