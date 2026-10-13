const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const sender = process.env.EMAIL_FROM || 'FabLab <onboarding@resend.dev>';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function sendEmail({ to, subject, title, body, details }) {
  await resend.emails.send({
    from: sender,
    to,
    subject,
    html: `
      <div style="font-family: Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1E1E1E; color: #F4F4F4; border-radius: 12px;">
        <h1 style="color: #F58220;">${escapeHtml(title)}</h1>
        <p>${escapeHtml(body)}</p>
        
        <div style="background: #2A2A2A; padding: 16px; border-radius: 8px; margin: 20px 0;">
          ${details.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}
        </div>

        <a href="${process.env.FRONTEND_URL}/status" style="color: #2D9CDB;">Check request status</a>

        <p style="color: #BDBDBD; font-size: 0.85rem; margin-top: 30px;">School FabLab — 3D Print Lab Request System</p>
      </div>
    `,
  });
}

async function sendConfirmationEmail(studentEmail, request) {
  await Promise.all([
    sendEmail({
      to: studentEmail,
      subject: `Print request ${request.request_code} received`,
      title: 'Print Request Received',
      body: 'Your 3D print request has been submitted and is waiting for review.',
      details: [
        ['Request Code', request.request_code],
        ['Student', request.student_name],
        ['Type', request.request_type],
        ['Requested Date', request.requested_date],
        ['File', request.file_name],
      ],
    }),
    sendEmail({
      to: process.env.LAB_EMAIL,
      subject: `New Print Request #${request.id} from ${request.student_name}`,
      title: 'New Print Request',
      body: 'A new print request has been submitted and is waiting for review.',
      details: [
        ['Request ID', `#${request.id}`],
        ['Student', request.student_name],
        ['Student Email', studentEmail],
        ['Type', request.request_type],
        ['Requested Date', request.requested_date],
        ['File', request.file_name],
      ],
    }),
  ]);
}

async function sendStatusUpdateEmail(request) {
  await sendEmail({
    to: request.email,
    subject: `Print request ${request.request_code}: ${request.status}`,
    title: 'Print Request Updated',
    body: `Your print request status is now ${request.status}.`,
    details: [
      ['Request Code', request.request_code],
      ['Status', request.status],
      ['Requested Date', request.requested_date],
      ['File', request.file_name],
      ...(request.admin_notes ? [['Lab Note', request.admin_notes]] : []),
    ],
  });
}

module.exports = { sendConfirmationEmail, sendStatusUpdateEmail };