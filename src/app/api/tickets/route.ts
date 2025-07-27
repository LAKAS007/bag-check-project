import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { ApiResponse, CreateTicketData } from '@/types'

// POST /api/tickets - создание нового тикета
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { clientEmail, images } = body as CreateTicketData

        // Валидация данных
        if (!clientEmail || !images || images.length === 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Необходимо указать email и загрузить минимум одно изображение'
            }, { status: 400 })
        }

        // Проверка email формата
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(clientEmail)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Некорректный формат email'
            }, { status: 400 })
        }

        // Создание тикета
        const ticket = await TicketService.create({
            clientEmail,
            images
        })

        return NextResponse.json<ApiResponse>({
            success: true,
            data: ticket,
            message: 'Тикет успешно создан. Мы отправим результат проверки на указанный email.'
        }, { status: 201 })

    } catch (error) {
        console.error('Ошибка создания тикета:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Внутренняя ошибка сервера'
        }, { status: 500 })
    }
}

// GET /api/tickets - получение списка тикетов (для админки)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Параметры фильтрации
        const status = searchParams.get('status') || undefined
        const clientEmail = searchParams.get('email') || undefined
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Получение тикетов с фильтрацией
        const tickets = await TicketService.findMany({
            status,
            clientEmail,
            limit,
            offset
        })

        // Получение общей статистики
        const stats = await TicketService.getStats()

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                tickets,
                stats,
                pagination: {
                    limit,
                    offset,
                    total: stats.total
                }
            }
        })

    } catch (error) {
        console.error('Ошибка получения тикетов:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка получения данных'
        }, { status: 500 })
    }
}