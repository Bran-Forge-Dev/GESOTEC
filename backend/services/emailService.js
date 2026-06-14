const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter de Nodemailer para Mailtrap
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
    port: process.env.MAILTRAP_PORT || 2525,
    auth: {
        user: process.env.MAILTRAP_USER || '',
        pass: process.env.MAILTRAP_PASS || ''
    }
});

/**
 * Enviar email de notificación de ticket asignado
 * @param {string} toEmail - Email del destinatario
 * @param {string} toName - Nombre del destinatario
 * @param {Object} ticket - Datos del ticket
 */
async function enviarEmailTicketAsignado(toEmail, toName, ticket) {
    try {
        const mailOptions = {
            from: '"GESOTEC - Soporte Técnico" <noreply@gesotec.com>',
            to: toEmail,
            subject: `Nuevo Ticket Asignado #${ticket.id} - ${ticket.asunto}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1976d2, #1565c0); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                        <h2 style="margin: 0;">🎫 Nuevo Ticket Asignado</h2>
                    </div>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
                        <p style="margin: 0 0 10px 0;">Hola <strong>${toName}</strong>,</p>
                        <p style="margin: 0 0 10px 0;">Se te ha asignado un nuevo ticket en el sistema GESOTEC:</p>
                        
                        <div style="background: white; padding: 15px; border-left: 4px solid #1976d2; margin: 15px 0;">
                            <p style="margin: 5px 0;"><strong>ID:</strong> #${ticket.id}</p>
                            <p style="margin: 5px 0;"><strong>Asunto:</strong> ${ticket.asunto}</p>
                            <p style="margin: 5px 0;"><strong>Prioridad:</strong> ${ticket.prioridad}</p>
                            <p style="margin: 5px 0;"><strong>Estado:</strong> ${ticket.estado}</p>
                            <p style="margin: 5px 0;"><strong>Descripción:</strong></p>
                            <p style="margin: 5px 0; color: #666;">${ticket.descripcion}</p>
                        </div>
                        
                        <p style="margin: 15px 0 10px 0;">Por favor, revisa el ticket y actualiza su estado según corresponda.</p>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://gesotec.onrender.com/html/TecMisTickets.html" 
                               style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Ver Ticket en GESOTEC
                            </a>
                        </div>
                        
                        <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
                            Este es un mensaje automático de GESOTEC. Por favor no respondas a este email.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Enviar email de actualización de ticket
 * @param {string} toEmail - Email del destinatario
 * @param {string} toName - Nombre del destinatario
 * @param {Object} ticket - Datos del ticket
 */
async function enviarEmailTicketActualizado(toEmail, toName, ticket) {
    try {
        const mailOptions = {
            from: '"GESOTEC - Soporte Técnico" <noreply@gesotec.com>',
            to: toEmail,
            subject: `Actualización de Ticket #${ticket.id} - ${ticket.asunto}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #ff9800, #f57c00); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                        <h2 style="margin: 0;">📝 Actualización de Ticket</h2>
                    </div>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
                        <p style="margin: 0 0 10px 0;">Hola <strong>${toName}</strong>,</p>
                        <p style="margin: 0 0 10px 0;">El ticket #${ticket.id} ha sido actualizado:</p>
                        
                        <div style="background: white; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0;">
                            <p style="margin: 5px 0;"><strong>Nuevo Estado:</strong> ${ticket.estado}</p>
                            <p style="margin: 5px 0;"><strong>Asunto:</strong> ${ticket.asunto}</p>
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://gesotec.onrender.com/html/UserHistorialTickets.html" 
                               style="background: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Ver Ticket en GESOTEC
                            </a>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    enviarEmailTicketAsignado,
    enviarEmailTicketActualizado
};
