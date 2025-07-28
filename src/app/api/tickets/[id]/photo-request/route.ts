// src/app/api/tickets/[id]/request-photos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { EmailService } from '@/lib/services/email'
import { ApiResponse } from '@/types'

type RouteContext = {
    params: Promise<{ id: string }>
}

// POST /api/tickets/[id]/request-photos - запрос дополнительных фото
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params
        const { description } = await request.json()

        console.log('📸 Запрос дополнительных фото для тикета:', id)

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

        // Получаем тикет
        const ticket = await TicketService.findById(id)
        if (!ticket) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        // Проверка статуса
        if (ticket.status === 'COMPLETED') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Нельзя запросить дополнительные фото для завершенного тикета'
            }, { status: 400 })
        }

        console.log('📝 Создаем запрос дополнительных фото:', description.trim())

        // Создаем запрос на дополнительные фото (это также обновит статус на NEEDS_MORE_PHOTOS)
        const photoRequest = await TicketService.createPhotoRequest(id, description.trim())

        // Отправляем email с запросом дополнительных фото
        try {
            await EmailService.sendPhotoRequest({
                ticketId: ticket.id,
                clientEmail: ticket.clientEmail,
                description: description.trim(),
                uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/upload/additional/${ticket.id}`
            })

            console.log('✅ Email с запросом дополнительных фото отправлен:', ticket.clientEmail)

            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    ticket: {
                        ...ticket,
                        status: 'NEEDS_MORE_PHOTOS'
                    },
                    photoRequest
                },
                message: 'Запрос на дополнительные фото отправлен клиенту на email'
            })

        } catch (emailError) {
            console.error('❌ Ошибка отправки email:', emailError)

            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    ticket: {
                        ...ticket,
                        status: 'NEEDS_MORE_PHOTOS'
                    },
                    photoRequest
                },
                warning: 'Запрос создан, но не удалось отправить email клиенту'
            })
        }

    } catch (error) {
        console.error('❌ Ошибка создания запроса дополнительных фото:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка создания запроса',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }, { status: 500 })
    }
}