// src/app/api/tickets/[id]/complete/route.ts - Полное завершение с 3 сценариями
import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { EmailService } from '@/lib/services/email'
import { CertificateService } from '@/lib/services/certificates'
import { ApiResponse } from '@/types'

type RouteContext = {
    params: Promise<{ id: string }>
}

// POST /api/tickets/[id]/complete - завершение проверки
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params
        const { result, comment, expertName } = await request.json()

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
                console.log('✅ Сценарий 1: Сумка подлинная - создаем сертификат')

                // Создаем сертификат в БД (для QR кода)
                const certificateData = await CertificateService.create(
                    updatedTicket.id,
                    'temporary_url' // Временный URL, сертификат не сохраняется
                )

                // Отправляем email с сертификатом
                await EmailService.sendAuthenticCertificate({
                    ticketId: updatedTicket.id,
                    clientEmail: updatedTicket.clientEmail,
                    comment: comment || '',
                    brandName: 'Designer Bag',
                    itemType: 'Сумка',
                    checkDate: updatedTicket.updatedAt,
                    expertName: expertName || 'BagCheck Expert',
                    qrCode: certificateData.qrCode
                })

                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: {
                        ticket: updatedTicket,
                        certificate: {
                            qrCode: certificateData.qrCode,
                            verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificateData.qrCode}`
                        }
                    },
                    message: 'Сумка подтверждена как подлинная. Сертификат отправлен на email.'
                })

            } catch (emailError) {
                console.error('❌ Ошибка отправки сертификата:', emailError)

                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: updatedTicket,
                    warning: 'Тикет завершен, но не удалось отправить сертификат на email'
                })
            }
        }

        // === СЦЕНАРИЙ 2: СУМКА ПОДДЕЛКА ===
        if (result === 'FAKE') {
            try {
                console.log('❌ Сценарий 2: Сумка подделка - отправляем уведомление')

                // Отправляем email с уведомлением о подделке (БЕЗ сертификата)
                await EmailService.sendFakeNotification({
                    ticketId: updatedTicket.id,
                    clientEmail: updatedTicket.clientEmail,
                    comment: comment || 'К сожалению, наши эксперты определили, что товар является подделкой.',
                    brandName: 'Designer Bag',
                    itemType: 'Сумка',
                    checkDate: updatedTicket.updatedAt,
                    expertName: expertName || 'BagCheck Expert'
                })

                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: updatedTicket,
                    message: 'Товар определен как подделка. Уведомление отправлено на email.'
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

// src/app/api/tickets/[id]/request-photos/route.ts - Сценарий 3: Запрос дополнительных фото
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params
        const { description } = await request.json()

        if (!description || description.trim().length === 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Необходимо указать описание запроса'
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

        console.log(`📸 Сценарий 3: Запрашиваем дополнительные фото для тикета ${id}`)

        // Создаем запрос на дополнительные фото
        const photoRequest = await TicketService.createPhotoRequest(id, description.trim())

        // Отправляем email с запросом дополнительных фото
        try {
            await EmailService.sendPhotoRequest({
                ticketId: ticket.id,
                clientEmail: ticket.clientEmail,
                description: description.trim(),
                uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/upload/additional/${ticket.id}`
            })

            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    ticket: {
                        ...ticket,
                        status: 'NEEDS_MORE_PHOTOS'
                    },
                    photoRequest
                },
                message: 'Запрос на дополнительные фото отправлен клиенту'
            })

        } catch (emailError) {
            console.error('❌ Ошибка отправки запроса фото:', emailError)

            return NextResponse.json<ApiResponse>({
                success: true,
                data: { ticket, photoRequest },
                warning: 'Запрос создан, но не удалось отправить email'
            })
        }

    } catch (error) {
        console.error('❌ Ошибка создания запроса фото:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка создания запроса'
        }, { status: 500 })
    }
}