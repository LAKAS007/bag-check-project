// src/lib/pdf-generator.ts - Правильная версия с Puppeteer
import QRCode from 'qrcode'
import puppeteer from 'puppeteer'

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
        let browser: puppeteer.Browser | null = null

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
                console.log('✅ QR код сгенерирован')
            } catch (error) {
                console.warn('⚠️ Не удалось сгенерировать QR код:', error)
            }

            // Создаем HTML контент
            const htmlContent = this.generateHTML(data, qrCodeImage)

            // Запускаем Puppeteer
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-gpu'
                ]
            })

            const page = await browser.newPage()

            // Устанавливаем содержимое страницы
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            })

            // Генерируем PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                }
            })

            console.log('✅ PDF сертификат сгенерирован, размер:', pdfBuffer.length, 'байт')

            return pdfBuffer

        } catch (error) {
            console.error('❌ Ошибка генерации PDF сертификата:', error)
            throw new Error('Не удалось создать PDF сертификат')
        } finally {
            // Закрываем браузер
            if (browser) {
                await browser.close()
            }
        }
    }

    private static generateHTML(data: CertificateData, qrCodeImage: string): string {
        const resultColor = data.result === 'AUTHENTIC' ? '#059669' : '#dc2626'
        const resultBgColor = data.result === 'AUTHENTIC' ? '#f0fdf4' : '#fef2f2'
        const resultText = data.result === 'AUTHENTIC' ? 'ПОДЛИННАЯ' : 'ПОДДЕЛКА'

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Сертификат ${data.ticketId}</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                
                * {
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                    margin: 0;
                    padding: 20mm;
                    color: #334155;
                    line-height: 1.5;
                    background: white;
                    font-size: 14px;
                }
                
                .certificate {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 20px;
                }
                
                .title {
                    font-size: 32px;
                    font-weight: bold;
                    color: #1e293b;
                    margin: 0 0 15px 0;
                    letter-spacing: 3px;
                }
                
                .subtitle {
                    font-size: 18px;
                    color: #64748b;
                    margin: 0 0 20px 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                
                .certificate-number {
                    font-size: 16px;
                    color: #64748b;
                    background: #f8fafc;
                    padding: 12px 25px;
                    border-radius: 25px;
                    display: inline-block;
                    border: 1px solid #e2e8f0;
                }
                
                .main-content {
                    display: flex;
                    gap: 40px;
                    margin-bottom: 40px;
                    flex: 1;
                }
                
                .content-left {
                    flex: 1;
                }
                
                .qr-section {
                    text-align: center;
                    min-width: 160px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .result-section {
                    text-align: center;
                    margin-bottom: 35px;
                    padding: 25px;
                    background: ${resultBgColor};
                    border-radius: 15px;
                    border: 3px solid ${resultColor};
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .result-text {
                    font-size: 28px;
                    font-weight: bold;
                    color: ${resultColor};
                    margin: 0;
                    letter-spacing: 2px;
                }
                
                .details-section {
                    background: #f8fafc;
                    padding: 30px;
                    border-radius: 15px;
                    margin-bottom: 25px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .detail-row:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #64748b;
                    min-width: 150px;
                    font-size: 14px;
                }
                
                .detail-value {
                    color: #334155;
                    flex: 1;
                    text-align: right;
                    font-weight: 500;
                    font-size: 14px;
                }
                
                .comment-section {
                    background: #fffbeb;
                    padding: 25px;
                    border-radius: 15px;
                    border-left: 5px solid #f59e0b;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                
                .comment-label {
                    font-weight: 600;
                    color: #92400e;
                    margin-bottom: 12px;
                    font-size: 15px;
                }
                
                .comment-text {
                    color: #451a03;
                    line-height: 1.7;
                    margin: 0;
                    font-size: 13px;
                }
                
                .qr-code {
                    width: 130px;
                    height: 130px;
                    margin-bottom: 15px;
                    border-radius: 10px;
                    border: 2px solid #e2e8f0;
                    padding: 5px;
                    background: white;
                }
                
                .qr-label {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                    text-align: center;
                }
                
                .footer {
                    margin-top: auto;
                    padding-top: 25px;
                    border-top: 2px solid #e2e8f0;
                    text-align: center;
                }
                
                .footer-text {
                    font-size: 12px;
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 10px;
                }
                
                .generation-date {
                    font-size: 11px;
                    color: #94a3b8;
                    font-style: italic;
                }
                
                .qr-placeholder {
                    width: 130px;
                    height: 130px;
                    border: 2px dashed #cbd5e1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    color: #64748b;
                    text-align: center;
                    border-radius: 10px;
                    background: #f8fafc;
                    margin-bottom: 15px;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <!-- Header -->
                <div class="header">
                    <h1 class="title">СЕРТИФИКАТ АУТЕНТИФИКАЦИИ</h1>
                    <p class="subtitle">BagCheck Professional Service</p>
                    <div class="certificate-number">
                        Сертификат № ${data.ticketId}
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="main-content">
                    <div class="content-left">
                        <!-- Result -->
                        <div class="result-section">
                            <div class="result-text">${resultText}</div>
                        </div>
                        
                        <!-- Details -->
                        <div class="details-section">
                            ${data.brandName ? `
                            <div class="detail-row">
                                <span class="detail-label">Бренд:</span>
                                <span class="detail-value">${data.brandName}</span>
                            </div>
                            ` : ''}
                            ${data.itemType ? `
                            <div class="detail-row">
                                <span class="detail-label">Изделие:</span>
                                <span class="detail-value">${data.itemType}</span>
                            </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Дата проверки:</span>
                                <span class="detail-value">${this.formatDate(data.checkDate)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Заявка:</span>
                                <span class="detail-value">${data.ticketId}</span>
                            </div>
                            ${data.expertName ? `
                            <div class="detail-row">
                                <span class="detail-label">Эксперт:</span>
                                <span class="detail-value">${data.expertName}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- Comment -->
                        ${data.comment ? `
                        <div class="comment-section">
                            <div class="comment-label">Комментарий эксперта:</div>
                            <p class="comment-text">${data.comment}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- QR Code -->
                    <div class="qr-section">
                        ${qrCodeImage ? `
                            <img src="${qrCodeImage}" alt="QR Code" class="qr-code">
                        ` : `
                            <div class="qr-placeholder">
                                QR код<br>${data.qrCode.slice(0, 8)}
                            </div>
                        `}
                        <p class="qr-label">
                            Сканируйте для<br>верификации
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <div class="footer-text">
                        Этот сертификат выдан компанией BagCheck - сервисом профессиональной аутентификации.<br>
                        Для верификации подлинности сертификата отсканируйте QR код или посетите наш сайт.
                    </div>
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