import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { nanoid } from 'nanoid'

export class CertificateService {
    // Создание сертификата
    static async create(ticketId: string, pdfUrl: string) {
        // Генерируем уникальный QR код
        const qrCode = nanoid(12)
        const qrCodeUrl = `${process.env.APP_URL}/verify/${qrCode}`

        // Генерируем QR код изображение
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })

        return await prisma.certificate.create({
            data: {
                ticketId,
                pdfUrl,
                qrCode
            },
            include: {
                ticket: {
                    include: {
                        images: true
                    }
                }
            }
        })
    }

    // Поиск сертификата по QR коду
    static async findByQrCode(qrCode: string) {
        return await prisma.certificate.findUnique({
            where: { qrCode },
            include: {
                ticket: {
                    include: {
                        images: true
                    }
                }
            }
        })
    }

    // Поиск сертификата по ID тикета
    static async findByTicketId(ticketId: string) {
        return await prisma.certificate.findUnique({
            where: { ticketId },
            include: {
                ticket: {
                    include: {
                        images: true
                    }
                }
            }
        })
    }

    // Проверка существования сертификата
    static async exists(ticketId: string): Promise<boolean> {
        const certificate = await prisma.certificate.findUnique({
            where: { ticketId }
        })
        return !!certificate
    }

    // Удаление сертификата (если нужно пересоздать)
    static async delete(ticketId: string) {
        return await prisma.certificate.delete({
            where: { ticketId }
        })
    }

    // Генерация QR кода для верификации
    static async generateQrCodeImage(qrCode: string): Promise<string> {
        const verifyUrl = `${process.env.APP_URL}/verify/${qrCode}`

        return await QRCode.toDataURL(verifyUrl, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
    }
}