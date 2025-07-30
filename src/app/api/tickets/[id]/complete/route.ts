// src/app/api/tickets/[id]/complete/route.ts - Упрощенная версия (только email)
import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { EmailService } from '@/lib/services/email'
import { CertificateService } from '@/lib/services/certificates'
import { ApiResponse } from '@/types'

type RouteContext = {
    params: Promise<{ id: string }>
}

// POST /api/tickets/[id]/complete - завершение проверки с отправкой PDF на email
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params
        const { result, comment, expertName, brandName, itemType } = await request.json()

        // Валидация
        if (!result || !['AUTHENTIC', 'FAKE'].includes(result)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Необходимо указать результат проверки (AUTHENTIC или FAKE)'
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

        console.log(`🏁 Завершаем тикет ${id} с результатом: ${result}`)

        // Обновляем тикет
        const updatedTicket = await TicketService.updateStatus(id, {
            status: 'COMPLETED',
            result,
            comment: comment || null
        })

        // === СЦЕНАРИЙ 1: СУМКА ПОДЛИННАЯ ===
        if (result === 'AUTHENTIC') {
            try {
                console.log('✅ Сценарий 1: Сумка подлинная - отправляем PDF сертификат')

                // Создаем запись сертификата в БД (для QR кода и верификации)
                const certificateData = await CertificateService.create(
                    updatedTicket.id,
                    'email_sent' // Помечаем что сертификат отправлен на email
                )

                // Отправляем PDF сертификат на email
                await EmailService.sendAuthenticCertificate({
                    ticketId: updatedTicket.id,
                    clientEmail: updatedTicket.clientEmail,
                    comment: comment || 'Все элементы сумки соответствуют оригинальным стандартам качества бренда.',
                    brandName: brandName || 'Designer Bag',
                    itemType: itemType || 'Сумка',
                    checkDate: updatedTicket.updatedAt,
                    expertName: expertName || 'BagCheck Expert',
                    qrCode: certificateData.qrCode
                })

                console.log('✅ PDF сертификат отправлен на email:', updatedTicket.clientEmail)

                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: updatedTicket,
                    message: `Сумка подтверждена как подлинная. PDF сертификат отправлен на email ${updatedTicket.clientEmail}`
                })

            } catch (emailError) {
                console.error('❌ Ошибка отправки PDF сертификата:', emailError)

                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: updatedTicket,
                    warning: 'Тикет завершен, но не удалось отправить PDF сертификат на email'
                })
            }
        }

        // === СЦЕНАРИЙ 2: СУМКА ПОДДЕЛКА ===
        if (result === 'FAKE') {
            try {
                console.log('❌ Сценарий 2: Сумка подделка - отправляем уведомление')

                // Отправляем уведомление о подделке (БЕЗ сертификата)
                await EmailService.sendFakeNotification({
                    ticketId: updatedTicket.id,
                    clientEmail: updatedTicket.clientEmail,
                    comment: comment || 'К сожалению, наши эксперты определили, что товар является подделкой.',
                    brandName: brandName || 'Designer Bag',
                    itemType: itemType || 'Сумка',
                    checkDate: updatedTicket.updatedAt,
                    expertName: expertName || 'BagCheck Expert'
                })

                console.log('✅ Уведомление о подделке отправлено на email:', updatedTicket.clientEmail)

                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: updatedTicket,
                    message: `Товар определен как подделка. Уведомление отправлено на email ${updatedTicket.clientEmail}`
                })

            } catch (emailError) {
                console.error('❌ Ошибка отправки уведомления:', emailError)

                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: updatedTicket,
                    warning: 'Тикет завершен, но не удалось отправить уведомление на email'
                })
            }
        }

    } catch (error) {
        console.error('❌ Ошибка завершения тикета:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка завершения тикета',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }, { status: 500 })
    }
}