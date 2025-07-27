import { prisma } from '@/lib/prisma'
import {
    CreateTicketData,
    UpdateTicketStatusData,
    TicketWithRelations,
    TicketWithImages
} from '@/types'

export class TicketService {
    // Создание нового тикета
    static async create(data: CreateTicketData) {
        return await prisma.ticket.create({
            data: {
                clientEmail: data.clientEmail,
                images: {
                    create: data.images.map(img => ({
                        url: img.url,
                        publicId: img.publicId,
                        type: img.type || 'INITIAL'
                    }))
                }
            },
            include: {
                images: true,
                requests: true,
                certificate: true,
                user: true
            }
        })
    }

    // Получение тикета по ID
    static async findById(id: string): Promise<TicketWithRelations | null> {
        return await prisma.ticket.findUnique({
            where: { id },
            include: {
                images: true,
                requests: true,
                certificate: true,
                user: true
            }
        })
    }

    // Получение тикетов с фильтрацией
    static async findMany(filters: {
        status?: string
        clientEmail?: string
        limit?: number
        offset?: number
    } = {}) {
        const { status, clientEmail, limit = 10, offset = 0 } = filters

        return await prisma.ticket.findMany({
            where: {
                ...(status && { status: status as any }),
                ...(clientEmail && { clientEmail })
            },
            include: {
                images: true,
                requests: true,
                certificate: true,
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        })
    }

    // Обновление статуса тикета
    static async updateStatus(id: string, data: UpdateTicketStatusData) {
        return await prisma.ticket.update({
            where: { id },
            data: {
                status: data.status,
                result: data.result,
                comment: data.comment,
                updatedAt: new Date()
            },
            include: {
                images: true,
                requests: true,
                certificate: true,
                user: true
            }
        })
    }

    // Добавление дополнительных изображений
    static async addImages(ticketId: string, images: { url: string; publicId: string }[]) {
        return await prisma.image.createMany({
            data: images.map(img => ({
                ticketId,
                url: img.url,
                publicId: img.publicId,
                type: 'ADDITIONAL'
            }))
        })
    }

    // Создание запроса на дополнительные фото
    static async createPhotoRequest(ticketId: string, description: string) {
        // Обновляем статус тикета
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'NEEDS_MORE_PHOTOS' }
        })

        // Создаем запрос
        return await prisma.photoRequest.create({
            data: {
                ticketId,
                description
            }
        })
    }

    // Получение статистики
    static async getStats() {
        const [pending, inReview, completed, total] = await Promise.all([
            prisma.ticket.count({ where: { status: 'PENDING' } }),
            prisma.ticket.count({ where: { status: 'IN_REVIEW' } }),
            prisma.ticket.count({ where: { status: 'COMPLETED' } }),
            prisma.ticket.count()
        ])

        return {
            pending,
            inReview,
            completed,
            total
        }
    }

    // Поиск тикетов по email клиента
    static async findByClientEmail(email: string): Promise<TicketWithImages[]> {
        return await prisma.ticket.findMany({
            where: { clientEmail: email },
            include: {
                images: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }
}