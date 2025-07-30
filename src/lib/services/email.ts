// src/lib/services/email.ts - Обновленная версия для PDF
import * as nodemailer from 'nodemailer'
import { PDFCertificateGenerator, CertificateData } from '@/lib/pdf-generator'

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER, // Твоя Gmail
            pass: process.env.SMTP_PASS  // App Password
        }
    })

    // === СЦЕНАРИЙ 1: Отправка PDF сертификата для подлинной сумки ===
    static async sendAuthenticCertificate(params: {
        ticketId: string
        clientEmail: string    // 👈 Email клиента из БД
        comment: string
        brandName: string
        itemType: string
        checkDate: Date
        expertName: string
        qrCode: string
    }): Promise<void> {
        try {
            console.log('📧 Отправляем PDF сертификат подлинности:')
            console.log('   - От:', process.env.SMTP_USER)
            console.log('   - Клиенту:', params.clientEmail)
            console.log('   - Тикет:', params.ticketId)
            console.log('   - QR код:', params.qrCode)

            // Генерируем PDF сертификат с правильными данными
            const certificateData: CertificateData = {
                ticketId: params.ticketId,
                clientEmail: params.clientEmail,
                result: 'AUTHENTIC',
                comment: params.comment,
                brandName: params.brandName,
                itemType: params.itemType,
                checkDate: params.checkDate,
                expertName: params.expertName,
                qrCode: params.qrCode  // ✅ Передаем QR код
            }

            console.log('🔄 Генерируем PDF сертификат...')
            const certificateBuffer = await PDFCertificateGenerator.generateCertificate(certificateData)
            console.log('✅ PDF сертификат сгенерирован, размер:', certificateBuffer.length, 'байт')

            const mailOptions = {
                from: `"BagCheck - Аутентификация сумок" <${process.env.SMTP_USER}>`,
                to: params.clientEmail,
                subject: `✅ Ваша сумка подлинная! Сертификат готов - ${params.ticketId}`,
                html: this.generateAuthenticEmailHTML(params),
                attachments: [
                    {
                        filename: `certificate-${params.ticketId}.pdf`,
                        content: certificateBuffer,
                        contentType: 'application/pdf'  // ✅ Правильный MIME тип
                    }
                ]
            }

            const info = await this.transporter.sendMail(mailOptions)
            console.log('✅ PDF сертификат отправлен:', info.messageId)

        } catch (error) {
            console.error('❌ Ошибка отправки PDF сертификата:', error)
            throw new Error(`Не удалось отправить сертификат на email ${params.clientEmail}`)
        }
    }

    // === СЦЕНАРИЙ 2: Уведомление о подделке ===
    static async sendFakeNotification(params: {
        ticketId: string
        clientEmail: string    // 👈 Email клиента из БД
        comment: string
        brandName: string
        itemType: string
        checkDate: Date
        expertName: string
    }): Promise<void> {
        try {
            console.log('📧 Отправляем уведомление о подделке:')
            console.log('   - От:', process.env.SMTP_USER)
            console.log('   - Клиенту:', params.clientEmail)

            const mailOptions = {
                from: `"BagCheck - Аутентификация сумок" <${process.env.SMTP_USER}>`,
                to: params.clientEmail,
                subject: `❌ Результат проверки: товар не является подлинным - ${params.ticketId}`,
                html: this.generateFakeEmailHTML(params)
            }

            const info = await this.transporter.sendMail(mailOptions)
            console.log('✅ Уведомление о подделке отправлено:', info.messageId)

        } catch (error) {
            console.error('❌ Ошибка отправки уведомления:', error)
            throw new Error(`Не удалось отправить уведомление на email ${params.clientEmail}`)
        }
    }

    // === СЦЕНАРИЙ 3: Запрос дополнительных фото ===
    static async sendPhotoRequest(params: {
        ticketId: string
        clientEmail: string    // 👈 Email клиента из БД
        description: string
        uploadUrl: string
    }): Promise<void> {
        try {
            console.log('📧 Отправляем запрос дополнительных фото:')
            console.log('   - От:', process.env.SMTP_USER)
            console.log('   - Клиенту:', params.clientEmail)

            const mailOptions = {
                from: `"BagCheck - Аутентификация сумок" <${process.env.SMTP_USER}>`,
                to: params.clientEmail,
                subject: `📸 Нужны дополнительные фотографии - ${params.ticketId}`,
                html: this.generatePhotoRequestHTML(params)
            }

            const info = await this.transporter.sendMail(mailOptions)
            console.log('✅ Запрос дополнительных фото отправлен:', info.messageId)

        } catch (error) {
            console.error('❌ Ошибка отправки запроса фото:', error)
            throw new Error(`Не удалось отправить запрос на email ${params.clientEmail}`)
        }
    }

    // === HTML ШАБЛОНЫ ===

    private static generateAuthenticEmailHTML(params: any): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ваша сумка подлинная!</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
                .content { padding: 40px 30px; }
                .success-badge { background: #f0fdf4; border: 2px solid #059669; color: #059669; padding: 15px 20px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 30px; }
                .details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
                .detail-row:last-child { border-bottom: none; margin-bottom: 0; }
                .detail-label { font-weight: 600; color: #64748b; }
                .detail-value { color: #334155; }
                .comment { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
                .comment h3 { margin: 0 0 10px; color: #92400e; font-size: 16px; }
                .comment p { margin: 0; color: #451a03; line-height: 1.6; }
                .attachment-info { background: #f0f9ff; border: 1px solid #0ea5e9; color: #0c4a6e; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
                .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Поздравляем!</h1>
                    <p>Ваша сумка прошла проверку и является подлинной</p>
                </div>
                
                <div class="content">
                    <div class="success-badge">
                        ✅ ТОВАР ПОДЛИННЫЙ
                    </div>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Заявка:</span>
                            <span class="detail-value">${params.ticketId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Бренд:</span>
                            <span class="detail-value">${params.brandName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Изделие:</span>
                            <span class="detail-value">${params.itemType}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Дата проверки:</span>
                            <span class="detail-value">${params.checkDate.toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Эксперт:</span>
                            <span class="detail-value">${params.expertName}</span>
                        </div>
                    </div>
                    
                    ${params.comment ? `
                    <div class="comment">
                        <h3>Комментарий эксперта:</h3>
                        <p>${params.comment}</p>
                    </div>
                    ` : ''}
                    
                    <div class="attachment-info">
                        📎 <strong>К письму прикреплен официальный PDF сертификат</strong><br>
                        Вы можете сохранить его и использовать для подтверждения подлинности товара
                    </div>
                </div>
                
                <div class="footer">
                    <p>Спасибо за использование BagCheck!</p>
                    <p>Если у вас есть вопросы, свяжитесь с нами: support@bagcheck.ru</p>
                </div>
            </div>
        </body>
        </html>
        `
    }

    private static generateFakeEmailHTML(params: any): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Результат проверки</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
                .content { padding: 40px 30px; }
                .fake-badge { background: #fef2f2; border: 2px solid #dc2626; color: #dc2626; padding: 15px 20px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 30px; }
                .details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
                .detail-row:last-child { border-bottom: none; margin-bottom: 0; }
                .detail-label { font-weight: 600; color: #64748b; }
                .detail-value { color: #334155; }
                .comment { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
                .comment h3 { margin: 0 0 10px; color: #991b1b; font-size: 16px; }
                .comment p { margin: 0; color: #7f1d1d; line-height: 1.6; }
                .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Результат проверки</h1>
                    <p>К сожалению, товар не прошел проверку на подлинность</p>
                </div>
                
                <div class="content">
                    <div class="fake-badge">
                        ❌ ТОВАР НЕ ЯВЛЯЕТСЯ ПОДЛИННЫМ
                    </div>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Заявка:</span>
                            <span class="detail-value">${params.ticketId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Бренд:</span>
                            <span class="detail-value">${params.brandName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Изделие:</span>
                            <span class="detail-value">${params.itemType}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Дата проверки:</span>
                            <span class="detail-value">${params.checkDate.toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Эксперт:</span>
                            <span class="detail-value">${params.expertName}</span>
                        </div>
                    </div>
                    
                    <div class="comment">
                        <h3>Причины отклонения:</h3>
                        <p>${params.comment}</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Если у вас есть вопросы по результату проверки, свяжитесь с нами: support@bagcheck.ru</p>
                </div>
            </div>
        </body>
        </html>
        `
    }

    private static generatePhotoRequestHTML(params: any): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Нужны дополнительные фотографии</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
                .content { padding: 40px 30px; }
                .request-badge { background: #fffbeb; border: 2px solid #f59e0b; color: #f59e0b; padding: 15px 20px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 30px; }
                .request-details { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
                .request-details h3 { margin: 0 0 10px; color: #92400e; font-size: 16px; }
                .request-details p { margin: 0; color: #451a03; line-height: 1.6; }
                .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
                .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📸 Дополнительные фото</h1>
                    <p>Для завершения проверки нам нужны дополнительные фотографии</p>
                </div>
                
                <div class="content">
                    <div class="request-badge">
                        ⏳ НУЖНЫ ДОПОЛНИТЕЛЬНЫЕ ФОТО
                    </div>
                    
                    <p>Здравствуйте!</p>
                    <p>Для проведения более тщательной проверки подлинности вашего товара (заявка <strong>${params.ticketId}</strong>) нашему эксперту требуются дополнительные фотографии.</p>
                    
                    <div class="request-details">
                        <h3>Что нужно сфотографировать:</h3>
                        <p>${params.description}</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${params.uploadUrl}" class="button">
                            📷 Загрузить дополнительные фото
                        </a>
                    </div>
                    
                    <p><strong>После загрузки дополнительных фотографий наш эксперт завершит проверку в течение 24-48 часов.</strong></p>
                </div>
                
                <div class="footer">
                    <p>Если у вас есть вопросы, свяжитесь с нами: support@bagcheck.ru</p>
                </div>
            </div>
        </body>
        </html>
        `
    }
}