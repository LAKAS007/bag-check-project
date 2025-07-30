// src/lib/services/certificates.ts
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export class CertificateService {
    // Создание сертификата (только для сохранения QR кода в БД)
    static async create(ticketId: string, pdfUrl: string = 'not_stored') {
        // Генерируем уникальный QR код
        const qrCode = ticketId

        console.log('🔗 Создаем запись сертификата с QR кодом:', qrCode)

        return await prisma.certificate.create({
            data: {
                ticketId,
                pdfUrl, // В нашем случае не используется, так как сертификаты не сохраняются
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

    // Поиск сертификата по QR коду (для верификации)
    static async findByQrCode(qrCode: string) {
        console.log('🔍 Ищем сертификат по QR коду:', qrCode)

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

    // Получение статистики сертификатов
    static async getStats() {
        const [total, authentic, fake] = await Promise.all([
            prisma.certificate.count(),
            prisma.certificate.count({
                where: {
                    ticket: {
                        result: 'AUTHENTIC'
                    }
                }
            }),
            prisma.certificate.count({
                where: {
                    ticket: {
                        result: 'FAKE'
                    }
                }
            })
        ])

        return {
            total,
            authentic,
            fake
        }
    }
}