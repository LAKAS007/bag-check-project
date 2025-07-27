import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { ApiResponse } from '@/types'

// GET /api/client/tickets?email=client@example.com - получение тикетов клиента
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        // Валидация email
        if (!email) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Необходимо указать email'
            }, { status: 400 })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Некорректный формат email'
            }, { status: 400 })
        }

        // Получение тикетов клиента
        const tickets = await TicketService.findByClientEmail(email)

        // Подсчет статистики для клиента
        const stats = {
            total: tickets.length,
            pending: tickets.filter(t => t.status === 'PENDING').length,
            inReview: tickets.filter(t => t.status === 'IN_REVIEW').length,
            needsMorePhotos: tickets.filter(t => t.status === 'NEEDS_MORE_PHOTOS').length,
            completed: tickets.filter(t => t.status === 'COMPLETED').length
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                tickets,
                stats,
                clientEmail: email
            }
        })

    } catch (error) {
        console.error('Ошибка получения тикетов клиента:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка получения данных'
        }, { status: 500 })
    }
}