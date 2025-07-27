import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { ApiResponse } from '@/types'

type RouteContext = {
    params: Promise<{ id: string }>
}

// POST /api/tickets/[id]/photo-request - создание запроса на дополнительные фото
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params
        const body = await request.json()

        const { description } = body as { description: string }

        // Валидация
        if (!description || description.trim().length === 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Необходимо указать описание запроса'
            }, { status: 400 })
        }

        if (description.length > 500) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Описание не должно превышать 500 символов'
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

        // Проверка что тикет можно переводить в статус "нужны доп фото"
        if (existingTicket.status === 'COMPLETED') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Нельзя запросить дополнительные фото для завершенного тикета'
            }, { status: 400 })
        }

        // Создание запроса на дополнительные фото
        const photoRequest = await TicketService.createPhotoRequest(id, description.trim())

        // TODO: Здесь будет отправка email клиенту с уведомлением

        return NextResponse.json<ApiResponse>({
            success: true,
            data: photoRequest,
            message: 'Запрос на дополнительные фото создан. Клиент получит уведомление на email.'
        })

    } catch (error) {
        console.error('Ошибка создания запроса на фото:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка создания запроса'
        }, { status: 500 })
    }
}