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

        return NextResponse.json<ApiResponse>({
            success: true,
            data: updatedTicket,
            message: `Статус тикета обновлен на: ${status}`
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