// src/app/api/tickets/[id]/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

type RouteContext = {
    params: Promise<{ id: string }>
}

// GET /api/tickets/[id] - получение конкретного тикета
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params

        const ticket = await TicketService.findById(id)

        if (!ticket) {
            return NextResponse.json({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: ticket
        })

    } catch (error) {
        console.error('Ошибка получения тикета:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка получения данных'
        }, { status: 500 })
    }
}

// PATCH /api/tickets/[id] - обновление статуса тикета (для экспертов)
export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params
        const body = await request.json()

        const { status, result, comment } = body

        // Валидация статуса
        const validStatuses = ['PENDING', 'NEEDS_MORE_PHOTOS', 'IN_REVIEW', 'COMPLETED']
        if (!validStatuses.includes(status)) {
            return NextResponse.json({
                success: false,
                error: 'Некорректный статус'
            }, { status: 400 })
        }

        // Если статус COMPLETED, результат обязателен
        if (status === 'COMPLETED' && !result) {
            return NextResponse.json({
                success: false,
                error: 'Для завершенного тикета необходимо указать результат'
            }, { status: 400 })
        }

        // Проверка существования тикета
        const existingTicket = await TicketService.findById(id)
        if (!existingTicket) {
            return NextResponse.json({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        // Обновление тикета
        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                status,
                result,
                comment,
                updatedAt: new Date()
            },
            include: {
                images: true,
                requests: true,
                certificate: true
            }
        })

        // 🔥 ГЛАВНОЕ ИСПРАВЛЕНИЕ: Создаем сертификат для подлинных сумок
        if (status === 'COMPLETED' && result === 'AUTHENTIC') {
            // Проверяем, что сертификат еще не создан
            const existingCertificate = await prisma.certificate.findUnique({
                where: { ticketId: id }
            })

            if (!existingCertificate) {
                // Генерируем уникальный QR код
                const qrCode = nanoid(12)

                // Временный PDF URL (в будущем здесь будет реальный PDF)
                const pdfUrl = `https://example.com/certificates/${id}.pdf`

                // Создаем сертификат
                const certificate = await prisma.certificate.create({
                    data: {
                        ticketId: id,
                        qrCode: qrCode,
                        pdfUrl: pdfUrl
                    }
                })

                console.log(`✅ Сертификат создан для заявки ${id}, QR код: ${qrCode}`)

                // TODO: Здесь добавить отправку email клиенту
                // await sendCertificateEmail(updatedTicket.clientEmail, certificate)
            }
        }

        // Получаем обновленный тикет с сертификатом
        const finalTicket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                images: true,
                requests: true,
                certificate: true
            }
        })

        return NextResponse.json({
            success: true,
            data: finalTicket,
            message: `Статус тикета обновлен на: ${status}`
        })

    } catch (error) {
        console.error('Ошибка обновления тикета:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка обновления данных'
        }, { status: 500 })
    }
}

// POST /api/tickets/[id] - добавление дополнительных изображений
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params
        const body = await request.json()

        const { images } = body as { images: { url: string; publicId: string }[] }

        // Валидация
        if (!images || images.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Необходимо загрузить минимум одно изображение'
            }, { status: 400 })
        }

        // Проверка существования тикета
        const existingTicket = await TicketService.findById(id)
        if (!existingTicket) {
            return NextResponse.json({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        // Добавление изображений
        await TicketService.addImages(id, images)

        // Обновление статуса тикета на IN_REVIEW (если были запросы на доп фото)
        if (existingTicket.status === 'NEEDS_MORE_PHOTOS') {
            await TicketService.updateStatus(id, {
                status: 'IN_REVIEW'
            })
        }

        // Получение обновленного тикета
        const updatedTicket = await TicketService.findById(id)

        return NextResponse.json({
            success: true,
            data: updatedTicket,
            message: 'Дополнительные изображения добавлены'
        })

    } catch (error) {
        console.error('Ошибка добавления изображений:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка добавления изображений'
        }, { status: 500 })
    }
}