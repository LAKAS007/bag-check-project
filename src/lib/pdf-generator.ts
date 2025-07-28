// src/lib/pdf-generator.ts
// Используем только встроенные возможности Node.js
import QRCode from 'qrcode'

export interface CertificateData {
    ticketId: string
    clientEmail: string
    result: 'AUTHENTIC' | 'FAKE'
    comment?: string
    brandName?: string
    itemType?: string
    checkDate: Date
    expertName?: string
    qrCode: string
}

export class PDFCertificateGenerator {
    static async generateCertificate(data: CertificateData): Promise<Buffer> {
        try {
            console.log('🔄 Генерируем PDF сертификат для заявки:', data.ticketId)

            // Генерируем QR код
            let qrCodeImage = ''
            try {
                const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://bagcheck.vercel.app'}/verify/${data.qrCode}`
                qrCodeImage = await QRCode.toDataURL(verifyUrl, {
                    width: 200,
                    margin: 1,
                    color: { dark: '#000000', light: '#FFFFFF' }
                })
            } catch (error) {
                console.warn('⚠️ Не удалось сгенерировать QR код:', error)
            }

            // Создаем HTML контент
            const htmlContent = this.generateHTML(data, qrCodeImage)

            // Возвращаем HTML как "PDF" (временное решение для тестирования)
            // В реальности здесь будет использоваться Puppeteer или другая библиотека
            const htmlBuffer = Buffer.from(htmlContent, 'utf-8')

            console.log('✅ HTML сертификат сгенерирован, размер:', htmlBuffer.length, 'байт')

            return htmlBuffer

        } catch (error) {
            console.error('❌ Ошибка генерации сертификата:', error)
            throw new Error('Не удалось создать сертификат')
        }
    }

    private static generateHTML(data: CertificateData, qrCodeImage: string): string {
        const resultColor = data.result === 'AUTHENTIC' ? '#059669' : '#dc2626'
        const resultText = data.result === 'AUTHENTIC' ? '✓ ПОДЛИННАЯ' : '✗ ПОДДЕЛКА'

        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Сертификат подлинности - ${data.ticketId}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #334155;
                    line-height: 1.6;
                    background: #ffffff;
                    padding: 40px;
                }
                
                .certificate {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border: 3px solid #1e40af;
                    border-radius: 15px;
                    padding: 40px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .logo {
                    font-size: 32px;
                    color: #1e40af;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                
                .company-name {
                    font-size: 24px;
                    color: #1e40af;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                
                .company-subtitle {
                    font-size: 14px;
                    color: #64748b;
                }
                
                .certificate-title {
                    text-align: center;
                    margin-bottom: 40px;
                }
                
                .title-main {
                    font-size: 36px;
                    color: #1e40af;
                    font-weight: bold;
                    margin-bottom: 15px;
                    letter-spacing: 2px;
                }
                
                .certificate-number {
                    font-size: 16px;
                    color: #64748b;
                    background: #f8fafc;
                    padding: 10px 20px;
                    border-radius: 25px;
                    display: inline-block;
                }
                
                .main-content {
                    display: flex;
                    gap: 40px;
                    margin-bottom: 40px;
                }
                
                .content-left {
                    flex: 1;
                }
                
                .qr-section {
                    text-align: center;
                    min-width: 120px;
                }
                
                .result-section {
                    text-align: center;
                    margin-bottom: 40px;
                    padding: 20px;
                    background: ${data.result === 'AUTHENTIC' ? '#f0fdf4' : '#fef2f2'};
                    border-radius: 12px;
                    border: 2px solid ${resultColor};
                }
                
                .result-text {
                    font-size: 32px;
                    font-weight: bold;
                    color: ${resultColor};
                }
                
                .details-section {
                    background: #f8fafc;
                    padding: 30px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #64748b;
                    min-width: 150px;
                }
                
                .detail-value {
                    color: #334155;
                    font-weight: 500;
                }
                
                .comment-section {
                    background: #fffbeb;
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #f59e0b;
                }
                
                .comment-label {
                    font-weight: 600;
                    color: #92400e;
                    margin-bottom: 10px;
                }
                
                .comment-text {
                    color: #451a03;
                    line-height: 1.8;
                }
                
                .qr-code {
                    width: 100px;
                    height: 100px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                }
                
                .qr-label {
                    font-size: 12px;
                    color: #64748b;
                    font-weight: 500;
                }
                
                .footer {
                    text-align: center;
                    padding-top: 30px;
                    border-top: 2px solid #e2e8f0;
                    color: #64748b;
                    font-size: 12px;
                }
                
                .generation-date {
                    margin-top: 15px;
                    font-size: 10px;
                    color: #94a3b8;
                }
                
                @media print {
                    body { padding: 0; }
                    .certificate { 
                        box-shadow: none; 
                        border: 2px solid #000;
                    }
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <!-- Header -->
                <div class="header">
                    <div class="logo">🛡️</div>
                    <div class="company-name">BagCheck</div>
                    <div class="company-subtitle">Профессиональная аутентификация дизайнерских сумок</div>
                </div>
                
                <!-- Certificate Title -->
                <div class="certificate-title">
                    <div class="title-main">СЕРТИФИКАТ ПОДЛИННОСТИ</div>
                    <div class="certificate-number">Номер сертификата: ${data.ticketId}</div>
                </div>
                
                <!-- Result -->
                <div class="result-section">
                    <div class="result-text">${resultText}</div>
                </div>
                
                <!-- Main Content -->
                <div class="main-content">
                    <div class="content-left">
                        <!-- Details -->
                        <div class="details-section">
                            <div class="detail-row">
                                <div class="detail-label">Тип товара:</div>
                                <div class="detail-value">${data.itemType || 'Дизайнерская сумка'}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Бренд:</div>
                                <div class="detail-value">${data.brandName || 'Не указан'}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Email клиента:</div>
                                <div class="detail-value">${data.clientEmail}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Дата проверки:</div>
                                <div class="detail-value">${this.formatDate(data.checkDate)}</div>
                            </div>
                            <div class="detail-row" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
                                <div class="detail-label">Эксперт:</div>
                                <div class="detail-value">${data.expertName || 'BagCheck Expert Team'}</div>
                            </div>
                        </div>
                        
                        <!-- Comment -->
                        ${data.comment ? `
                            <div class="comment-section">
                                <div class="comment-label">Комментарий эксперта:</div>
                                <div class="comment-text">${data.comment}</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- QR Code -->
                    <div class="qr-section">
                        ${qrCodeImage ? `
                            <img src="${qrCodeImage}" alt="QR Code" class="qr-code">
                        ` : `
                            <div style="width: 100px; height: 100px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; text-align: center; border-radius: 8px; margin-bottom: 10px;">
                                QR код<br>${data.qrCode.slice(0, 8)}
                            </div>
                        `}
                        <div class="qr-label">
                            Сканируйте для<br>верификации
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    Этот сертификат выдан компанией BagCheck - сервисом профессиональной аутентификации.<br>
                    Для верификации подлинности сертификата отсканируйте QR код или посетите наш сайт.
                    <div class="generation-date">
                        Сертификат сгенерирован: ${this.formatDate(new Date())}
                    </div>
                </div>
            </div>
        </body>
        </html>
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