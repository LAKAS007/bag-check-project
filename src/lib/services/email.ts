// src/lib/services/email.ts - Упрощенная версия (только клиентам)
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

    // === СЦЕНАРИЙ 1: Отправка сертификата для подлинной сумки ===
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
            console.log('📧 Отправляем сертификат подлинности:')
            console.log('   - От:', process.env.SMTP_USER)
            console.log('   - Клиенту:', params.clientEmail)
            console.log('   - Тикет:', params.ticketId)

            // Генерируем HTML сертификат
            const certificateData: CertificateData = {
                ticketId: params.ticketId,
                clientEmail: params.clientEmail,
                result: 'AUTHENTIC',
                comment: params.comment,
                brandName: params.brandName,
                itemType: params.itemType,
                checkDate: params.checkDate,
                expertName: params.expertName,
                qrCode: params.qrCode
            }

            const certificateBuffer = await PDFCertificateGenerator.generateCertificate(certificateData)

            const mailOptions = {
                from: `"BagCheck - Аутентификация сумок" <${process.env.SMTP_USER}>`,
                to: params.clientEmail,
                subject: `✅ Ваша сумка подлинная! Сертификат готов - ${params.ticketId}`,
                html: this.generateAuthenticEmailHTML(params),
                attachments: [
                    {
                        filename: `certificate-${params.ticketId}.html`,
                        content: certificateBuffer,
                        contentType: 'text/html'
                    }
                ]
            }

            const info = await this.transporter.sendMail(mailOptions)
            console.log('✅ Сертификат подлинности отправлен:', info.messageId)

        } catch (error) {
            console.error('❌ Ошибка отправки сертификата:', error)
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
                html: this.generatePhotoRequestEmailHTML(params)
            }

            const info = await this.transporter.sendMail(mailOptions)
            console.log('✅ Запрос дополнительных фото отправлен:', info.messageId)

        } catch (error) {
            console.error('❌ Ошибка отправки запроса фото:', error)
            throw new Error(`Не удалось отправить запрос на email ${params.clientEmail}`)
        }
    }

    // === HTML ШАБЛОНЫ ===

    private static generateAuthenticEmailHTML(params: {
        ticketId: string
        comment: string
        brandName: string
        itemType: string
        checkDate: Date
        expertName: string
        qrCode: string
    }): string {
        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Сертификат подлинности BagCheck</title>
            ${this.getEmailStyles()}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛡️ BagCheck</div>
                    <div>Профессиональная аутентификация</div>
                </div>
                
                <div class="content">
                    <h2>Отличная новость! 🎉</h2>
                    
                    <div class="result-box authentic">
                        <div class="result-text">✅ Ваша сумка подлинная!</div>
                        <div class="result-subtext">${params.brandName} • ${params.itemType}</div>
                    </div>
                    
                    <p>Наши эксперты завершили проверку и подтвердили подлинность вашего товара.</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Номер заявки:</span>
                            <span class="detail-value">${params.ticketId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Дата проверки:</span>
                            <span class="detail-value">${this.formatDate(params.checkDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Эксперт:</span>
                            <span class="detail-value">${params.expertName}</span>
                        </div>
                    </div>
                    
                    ${params.comment ? `
                        <div class="comment-section">
                            <strong>Комментарий эксперта:</strong><br>
                            ${params.comment}
                        </div>
                    ` : ''}
                    
                    <div class="certificate-info">
                        <h3>📜 Ваш сертификат подлинности</h3>
                        <p>К этому письму прикреплен официальный сертификат подлинности. Вы можете:</p>
                        <ul>
                            <li>Открыть сертификат в любом браузере</li>
                            <li>Распечатать для ваших записей</li>
                            <li>Использовать QR код для верификации</li>
                        </ul>
                        <p><strong>Ссылка для верификации:</strong> 
                           <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify/${params.qrCode}">
                               ${process.env.NEXT_PUBLIC_APP_URL}/verify/${params.qrCode}
                           </a>
                        </p>
                    </div>
                    
                    <p>Спасибо за использование BagCheck! 💙</p>
                </div>
                
                ${this.getEmailFooter()}
            </div>
        </body>
        </html>
        `
    }

    private static generateFakeEmailHTML(params: {
        ticketId: string
        comment: string
        brandName: string
        itemType: string
        checkDate: Date
        expertName: string
    }): string {
        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Результат проверки BagCheck</title>
            ${this.getEmailStyles()}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛡️ BagCheck</div>
                    <div>Профессиональная аутентификация</div>
                </div>
                
                <div class="content">
                    <h2>Результат проверки</h2>
                    
                    <div class="result-box fake">
                        <div class="result-text">❌ Товар не является подлинным</div>
                        <div class="result-subtext">${params.brandName} • ${params.itemType}</div>
                    </div>
                    
                    <p>К сожалению, наши эксперты определили, что данный товар является подделкой.</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Номер заявки:</span>
                            <span class="detail-value">${params.ticketId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Дата проверки:</span>
                            <span class="detail-value">${this.formatDate(params.checkDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Эксперт:</span>
                            <span class="detail-value">${params.expertName}</span>
                        </div>
                    </div>
                    
                    <div class="comment-section">
                        <strong>Комментарий эксперта:</strong><br>
                        ${params.comment}
                    </div>
                    
                    <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                        <h3 style="color: #92400e; margin-bottom: 10px;">ℹ️ Что делать дальше?</h3>
                        <p style="color: #451a03; margin: 0;">
                            Если у вас есть вопросы по результатам проверки или вы хотите получить консультацию, 
                            пожалуйста, свяжитесь с нами по email.
                        </p>
                    </div>
                    
                    <p>Спасибо за использование BagCheck.</p>
                </div>
                
                ${this.getEmailFooter()}
            </div>
        </body>
        </html>
        `
    }

    private static generatePhotoRequestEmailHTML(params: {
        ticketId: string
        description: string
        uploadUrl: string
    }): string {
        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Запрос дополнительных фото BagCheck</title>
            ${this.getEmailStyles()}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛡️ BagCheck</div>
                    <div>Профессиональная аутентификация</div>
                </div>
                
                <div class="content">
                    <h2>Нужны дополнительные фотографии 📸</h2>
                    
                    <p>Для завершения проверки подлинности вашего товара нашему эксперту требуются дополнительные фотографии.</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Номер заявки:</span>
                            <span class="detail-value">${params.ticketId}</span>
                        </div>
                    </div>
                    
                    <div class="comment-section">
                        <strong>Что нужно сфотографировать:</strong><br>
                        ${params.description}
                    </div>
                    
                    <div class="upload-section">
                        <h3>📤 Загрузите дополнительные фото</h3>
                        <p>Нажмите на кнопку ниже, чтобы перейти на страницу загрузки:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${params.uploadUrl}" class="upload-button">
                                Загрузить фотографии
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">
                            Или скопируйте ссылку в браузер: <br>
                            <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${params.uploadUrl}</code>
                        </p>
                    </div>
                    
                    <p>После загрузки дополнительных фотографий наш эксперт продолжит проверку и вы получите финальный результат.</p>
                    
                    <p>Спасибо за сотрудничество! 💙</p>
                </div>
                
                ${this.getEmailFooter()}
            </div>
        </body>
        </html>
        `
    }

    // Общие стили и утилиты
    private static getEmailStyles(): string {
        return `
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 20px; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px; }
            .result-box { text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .result-box.authentic { background-color: #f0fdf4; border: 2px solid #059669; }
            .result-box.fake { background-color: #fef2f2; border: 2px solid #dc2626; }
            .result-text { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .result-box.authentic .result-text { color: #059669; }
            .result-box.fake .result-text { color: #dc2626; }
            .result-subtext { font-size: 14px; color: #64748b; }
            .details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .detail-label { font-weight: 600; color: #64748b; }
            .detail-value { color: #334155; }
            .comment-section { background: #fffbeb; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .comment-section strong { color: #92400e; }
            .upload-button { display: inline-block; background: #1e40af; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
            .upload-section { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        </style>
        `
    }

    private static getEmailFooter(): string {
        return `
        <div class="footer">
            <p><strong>BagCheck</strong> - профессиональная аутентификация дизайнерских сумок</p>
            <p>Это автоматическое письмо, отвечать на него не нужно.</p>
        </div>
        `
    }

    private static formatDate(date: Date): string {
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}