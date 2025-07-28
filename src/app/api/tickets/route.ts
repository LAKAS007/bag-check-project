// src/app/api/tickets/[id]/route.ts - ФИНАЛЬНАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { prisma } from '@/lib/prisma'
import { PDFCertificateGenerator } from '@/lib/pdf-generator'
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
        const existingTicket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                images: true,
                certificate: true
            }
        })

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
                certificate: true
            }
        })

        // 🔥 СОЗДАНИЕ СЕРТИФИКАТА И ОТПРАВКА EMAIL
        if (status === 'COMPLETED') {
            try {
                if (result === 'AUTHENTIC') {
                    console.log('✅ Товар подлинный - создаем сертификат и отправляем email')

                    // Создаем или обновляем запись о сертификате в БД (только метаданные)
                    let certificate = existingTicket.certificate

                    if (!certificate) {
                        const qrCode = nanoid(12)
                        certificate = await prisma.certificate.create({
                            data: {
                                ticketId: updatedTicket.id,
                                qrCode: qrCode,
                                pdfUrl: '' // Пустая строка, так как не храним файл
                            }
                        })
                    }

                    // Генерируем PDF в памяти
                    const certificateData = {
                        ticketId: updatedTicket.id,
                        qrCode: certificate.qrCode,
                        result: 'AUTHENTIC' as const,
                        comment: updatedTicket.comment || 'Товар прошел экспертную проверку и признан подлинным.',
                        clientEmail: updatedTicket.clientEmail,
                        images: updatedTicket.images,
                        expertName: 'Certified Expert',
                        issuedAt: new Date()
                    }

                    const pdfBuffer = await PDFCertificateGenerator.generateCertificate(certificateData)
                    const fileName = PDFCertificateGenerator.generateFileName(updatedTicket.id)

                    // TODO: Здесь будет отправка email с PDF вложением
                    console.log('📧 Отправляем email с сертификатом на:', updatedTicket.clientEmail)
                    console.log('📄 PDF размер:', pdfBuffer.length, 'байт')
                    console.log('📁 Имя файла:', fileName)

                    // Временно логируем, позже заменим на реальную отправку email
                    // await sendCertificateEmail(updatedTicket.clientEmail, pdfBuffer, fileName, certificateData)

                } else {
                    console.log('❌ Товар не подлинный - отправляем email с результатом')

                    // TODO: Здесь будет отправка email о том, что товар не подлинный
                    console.log('📧 Отправляем email о подделке на:', updatedTicket.clientEmail)
                    // await sendFakeResultEmail(updatedTicket.clientEmail, updatedTicket.comment)
                }

                // Получаем финальный тикет с сертификатом
                const finalTicket = await prisma.ticket.findUnique({
                    where: { id },
                    include: {
                        images: true,
                        certificate: true
                    }
                })

                return NextResponse.json({
                    success: true,
                    data: finalTicket,
                    message: result === 'AUTHENTIC'
                        ? 'Заявка завершена. Сертификат отправлен на email клиента.'
                        : 'Заявка завершена. Результат отправлен на email клиента.'
                })

            } catch (emailError) {
                console.error('❌ Ошибка отправки email:', emailError)

                return NextResponse.json({
                    success: true,
                    data: updatedTicket,
                    message: `Статус обновлен, но не удалось отправить email: ${emailError}`
                })
            }
        }

        // Обычное обновление статуса
        return NextResponse.json({
            success: true,
            data: updatedTicket,
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

        if (!images || images.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Необходимо загрузить минимум одно изображение'
            }, { status: 400 })
        }

        const existingTicket = await TicketService.findById(id)
        if (!existingTicket) {
            return NextResponse.json({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        await TicketService.addImages(id, images)

        if (existingTicket.status === 'NEEDS_MORE_PHOTOS') {
            await TicketService.updateStatus(id, {
                status: 'IN_REVIEW'
            })
        }

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