import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { ApiResponse, UpdateTicketStatusData } from '@/types'

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
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: ticket
        })

    } catch (error) {
        console.error('Ошибка получения тикета:', error)

        return NextResponse.json<ApiResponse>({
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

        const { status, result, comment } = body as UpdateTicketStatusData

        // Валидация статуса
        const validStatuses = ['PENDING', 'NEEDS_MORE_PHOTOS', 'IN_REVIEW', 'COMPLETED']
        if (!validStatuses.includes(status)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Некорректный статус'
            }, { status: 400 })
        }

        // Если статус COMPLETED, результат обязателен
        if (status === 'COMPLETED' && !result) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Для завершенного тикета необходимо указать результат'
            }, { status: 400 })
        }

        // Проверка существования тикета
        const existingTicket = await TicketService.findById(id)
        if (!existingTicket) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        // Обновление тикета
        const updatedTicket = await TicketService.updateStatus(id, {
            status,
            result,
            comment
        })

        // ✨ НОВАЯ ЛОГИКА: Если статус COMPLETED - отправляем email с результатом
        if (status === 'COMPLETED' && result) {
            try {
                console.log(`📧 Sending authentication result email for ticket: ${id}`)

                // Импортируем EmailService динамически
                const { EmailService } = await import('@/lib/services/email')

                // Данные для email
                const emailParams = {
                    ticketId: id,
                    clientEmail: updatedTicket.clientEmail,
                    comment: comment || 'Проверка завершена',
                    brandName: 'Designer Brand', // TODO: можно добавить в форму загрузки
                    itemType: 'Сумка', // TODO: можно добавить в форму загрузки
                    checkDate: new Date(),
                    expertName: 'BagCheck Expert', // TODO: можно добавить систему экспертов
                    qrCode: `verify-${id}` // Уникальный код для верификации
                }

                if (result === 'AUTHENTIC') {
                    console.log(`🏆 Sending authentic certificate for: ${id}`)

                    // Отправляем сертификат подлинности
                    await EmailService.sendAuthenticCertificate(emailParams)

                } else if (result === 'FAKE') {
                    console.log(`❌ Sending fake notification for: ${id}`)

                    // Отправляем уведомление о подделке
                    await EmailService.sendFakeNotification(emailParams)
                }

                console.log(`✅ Email sent successfully to: ${updatedTicket.clientEmail}`)

            } catch (emailError) {
                console.error('❌ Error sending email:', emailError)

                // Не прерываем процесс, просто логируем ошибку
                // Тикет уже обновлен, email можно отправить позже
            }
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: updatedTicket,
            message: status === 'COMPLETED'
                ? `Экспертиза завершена. Результат "${result === 'AUTHENTIC' ? 'Подлинная' : 'Подделка'}" отправлен на email клиента.`
                : `Статус тикета обновлен на: ${status}`
        })

    } catch (error) {
        console.error('Ошибка обновления тикета:', error)

        return NextResponse.json<ApiResponse>({
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
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Необходимо загрузить минимум одно изображение'
            }, { status: 400 })
        }

        // Проверка существования тикета
        const existingTicket = await TicketService.findById(id)
        if (!existingTicket) {
            return NextResponse.json<ApiResponse>({
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

        return NextResponse.json<ApiResponse>({
            success: true,
            data: updatedTicket,
            message: 'Дополнительные изображения добавлены'
        })

    } catch (error) {
        console.error('Ошибка добавления изображений:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка добавления изображений'
        }, { status: 500 })
    }
}