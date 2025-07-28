// src/lib/pdf-generator.ts - УПРОЩЕННАЯ ВЕРСИЯ
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

interface CertificateData {
    ticketId: string
    qrCode: string
    result: 'AUTHENTIC' | 'FAKE'
    comment: string
    clientEmail: string
    images: Array<{
        id: string
        url: string
        type: 'INITIAL' | 'ADDITIONAL'
    }>
    expertName?: string
    issuedAt: Date
}

export class PDFCertificateGenerator {

    // Основная функция генерации сертификата (возвращает только Buffer)
    static async generateCertificate(data: CertificateData): Promise<Buffer> {
        try {
            console.log('🔄 Генерируем PDF сертификат для заявки:', data.ticketId)

            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 40, bottom: 40, left: 40, right: 40 },
                info: {
                    Title: `Сертификат подлинности BagCheck - ${data.ticketId}`,
                    Author: 'BagCheck',
                    Subject: 'Сертификат подлинности дизайнерской сумки',
                    CreationDate: new Date()
                }
            })

            // Собираем PDF в буфер
            const chunks: Buffer[] = []
            doc.on('data', chunk => chunks.push(chunk))

            const pdfPromise = new Promise<Buffer>((resolve) => {
                doc.on('end', () => {
                    const buffer = Buffer.concat(chunks)
                    resolve(buffer)
                })
            })

            // Генерируем содержимое сертификата
            await this.generateCertificateContent(doc, data)

            // Завершаем документ
            doc.end()

            // Ждем завершения генерации
            const buffer = await pdfPromise

            console.log('✅ PDF сертификат успешно создан, размер:', buffer.length, 'байт')

            return buffer
        } catch (error) {
            console.error('❌ Ошибка генерации PDF:', error)
            throw new Error('Не удалось создать PDF сертификат')
        }
    }

    // Генерация содержимого сертификата
    private static async generateCertificateContent(doc: PDFKit.PDFDocument, data: CertificateData) {
        const pageWidth = doc.page.width
        const pageHeight = doc.page.height
        const margin = 40

        // Цвета
        const primaryColor = '#1e40af' // blue-700
        const secondaryColor = '#64748b' // slate-500
        const successColor = '#16a34a' // green-600
        const textColor = '#1e293b' // slate-800

        // === HEADER ===
        await this.drawHeader(doc, pageWidth, margin, primaryColor)

        // === СТАТУС И ЗАГОЛОВОК ===
        const currentY = await this.drawStatusSection(doc, data, pageWidth, margin, 140, primaryColor, successColor)

        // === QR КОД ===
        const qrY = await this.drawQRCode(doc, data.qrCode, pageWidth, margin, currentY + 30)

        // === ИНФОРМАЦИЯ О ПРОВЕРКЕ ===
        const infoY = await this.drawTicketInfo(doc, data, margin, qrY + 20, secondaryColor, textColor)

        // === ЭКСПЕРТНОЕ ЗАКЛЮЧЕНИЕ ===
        const commentY = await this.drawExpertComment(doc, data.comment, margin, pageWidth, infoY + 30, textColor)

        // === ФОТОГРАФИИ ===
        if (data.images.length > 0) {
            await this.drawImages(doc, data.images, margin, pageWidth, commentY + 30)
        }

        // === FOOTER ===
        await this.drawFooter(doc, pageWidth, pageHeight, margin, secondaryColor)
    }

    // Рисуем заголовок
    private static async drawHeader(doc: PDFKit.PDFDocument, pageWidth: number, margin: number, primaryColor: string) {
        // Фон заголовка
        doc.rect(0, 0, pageWidth, 100)
            .fill(primaryColor)

        // Логотип (текстовый)
        doc.fontSize(28)
            .fillColor('white')
            .font('Helvetica-Bold')
            .text('🛡️ BagCheck', margin, 30)

        // Подзаголовок
        doc.fontSize(14)
            .fillColor('white')
            .font('Helvetica')
            .text('Профессиональная аутентификация дизайнерских сумок', margin, 65)
    }

    // Рисуем секцию статуса
    private static async drawStatusSection(
        doc: PDFKit.PDFDocument,
        data: CertificateData,
        pageWidth: number,
        margin: number,
        y: number,
        primaryColor: string,
        successColor: string
    ): Promise<number> {

        // Заголовок сертификата
        doc.fontSize(24)
            .fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text('СЕРТИФИКАТ ПОДЛИННОСТИ', margin, y, { align: 'center' })

        // Статус результата
        const statusY = y + 40
        const statusText = '✓ ПОДЛИННЫЙ ТОВАР'

        // Фон для статуса
        const textWidth = doc.widthOfString(statusText, { fontSize: 18, font: 'Helvetica-Bold' })
        const bgX = (pageWidth - textWidth - 40) / 2

        doc.rect(bgX, statusY - 5, textWidth + 40, 35)
            .fill(successColor)
            .fillColor('white')
            .fontSize(18)
            .font('Helvetica-Bold')
            .text(statusText, bgX + 20, statusY + 5)

        return statusY + 50
    }

    // Рисуем QR код
    private static async drawQRCode(
        doc: PDFKit.PDFDocument,
        qrCode: string,
        pageWidth: number,
        margin: number,
        y: number
    ): Promise<number> {

        try {
            // Генерируем QR код как изображение
            const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://bagcheck.vercel.app'}/verify/${qrCode}`
            const qrImageBuffer = await QRCode.toBuffer(verifyUrl, {
                width: 120,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })

            // Размещаем QR код справа
            const qrSize = 120
            const qrX = pageWidth - margin - qrSize

            doc.image(qrImageBuffer, qrX, y, { width: qrSize, height: qrSize })

            // Текст рядом с QR кодом
            doc.fontSize(12)
                .fillColor('#64748b')
                .font('Helvetica')
                .text('Сканируйте QR-код\nдля верификации\nподлинности сертификата', margin, y + 20)

            doc.fontSize(10)
                .fillColor('#94a3b8')
                .text(`Код: ${qrCode}`, margin, y + 80)

            return y + qrSize + 20
        } catch (error) {
            console.error('Ошибка генерации QR кода:', error)
            return y + 140
        }
    }

    // Рисуем информацию о заявке
    private static async drawTicketInfo(
        doc: PDFKit.PDFDocument,
        data: CertificateData,
        margin: number,
        y: number,
        secondaryColor: string,
        textColor: string
    ): Promise<number> {

        const lineHeight = 20
        let currentY = y

        // Заголовок секции
        doc.fontSize(14)
            .fillColor(textColor)
            .font('Helvetica-Bold')
            .text('Информация о проверке:', margin, currentY)

        currentY += 25

        // Информация
        const info = [
            ['ID заявки:', data.ticketId],
            ['Дата выдачи:', data.issuedAt.toLocaleDateString('ru-RU', {
                day: '2-digit', month: 'long', year: 'numeric'
            })],
            ['Время выдачи:', data.issuedAt.toLocaleTimeString('ru-RU', {
                hour: '2-digit', minute: '2-digit'
            })],
            ['Эксперт:', data.expertName || 'Certified Expert']
        ]

        doc.fontSize(11)
            .font('Helvetica')

        info.forEach(([label, value]) => {
            doc.fillColor(secondaryColor)
                .text(label, margin, currentY, { continued: true })
                .fillColor(textColor)
                .text(` ${value}`)
            currentY += lineHeight
        })

        return currentY
    }

    // Рисуем экспертное заключение
    private static async drawExpertComment(
        doc: PDFKit.PDFDocument,
        comment: string,
        margin: number,
        pageWidth: number,
        y: number,
        textColor: string
    ): Promise<number> {

        let currentY = y

        // Заголовок
        doc.fontSize(14)
            .fillColor(textColor)
            .font('Helvetica-Bold')
            .text('Экспертное заключение:', margin, currentY)

        currentY += 25

        // Фон для комментария
        const commentHeight = doc.heightOfString(comment, {
            width: pageWidth - margin * 2 - 20,
            fontSize: 11
        }) + 20

        doc.rect(margin - 10, currentY - 5, pageWidth - margin * 2 + 20, commentHeight)
            .fill('#f8fafc') // slate-50
            .stroke('#e2e8f0') // slate-200

        // Текст комментария
        doc.fontSize(11)
            .fillColor(textColor)
            .font('Helvetica')
            .text(comment, margin, currentY + 10, {
                width: pageWidth - margin * 2,
                align: 'justify'
            })

        return currentY + commentHeight + 20
    }

    // Рисуем фотографии (список без загрузки изображений)
    private static async drawImages(
        doc: PDFKit.PDFDocument,
        images: Array<{ id: string, url: string, type: string }>,
        margin: number,
        pageWidth: number,
        y: number
    ): Promise<number> {

        let currentY = y

        // Заголовок
        doc.fontSize(14)
            .fillColor('#1e293b')
            .font('Helvetica-Bold')
            .text(`Проверенные фотографии (${images.length}):`, margin, currentY)

        currentY += 25

        // Примечание о фотографиях
        doc.fontSize(10)
            .fillColor('#64748b')
            .font('Helvetica')
            .text('Все фотографии были проанализированы экспертом в процессе проверки подлинности.', margin, currentY)

        const imageList = images.map((img, index) =>
            `${index + 1}. ${img.type === 'INITIAL' ? 'Основное фото' : 'Дополнительное фото'} (ID: ${img.id.slice(0, 8)}...)`
        ).join('\n')

        currentY += 20
        doc.text(imageList, margin, currentY)

        return currentY + (images.length * 15) + 20
    }

    // Рисуем футер
    private static async drawFooter(
        doc: PDFKit.PDFDocument,
        pageWidth: number,
        pageHeight: number,
        margin: number,
        secondaryColor: string
    ) {

        const footerY = pageHeight - 60

        // Линия
        doc.moveTo(margin, footerY)
            .lineTo(pageWidth - margin, footerY)
            .stroke(secondaryColor)

        // Текст футера
        doc.fontSize(9)
            .fillColor(secondaryColor)
            .font('Helvetica')
            .text('Данный сертификат выдан BagCheck - профессиональным сервисом аутентификации дизайнерских изделий.',
                margin, footerY + 10, { align: 'center' })
            .text('Для верификации подлинности сертификата используйте QR-код или посетите сайт BagCheck.',
                margin, footerY + 25, { align: 'center' })
    }

    // Вспомогательная функция для создания имени файла
    static generateFileName(ticketId: string): string {
        const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
        return `BagCheck-Certificate-${ticketId}-${timestamp}.pdf`
    }
}