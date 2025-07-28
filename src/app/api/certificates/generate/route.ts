// src/app/api/certificates/generate/route.ts - Генерация сертификата на лету
import { NextRequest, NextResponse } from 'next/server'
import { PDFCertificateGenerator, CertificateData } from '@/lib/pdf-generator'
import { TicketService } from '@/lib/services/tickets'
import { nanoid } from 'nanoid'

// POST /api/certificates/generate - создание и отправка сертификата
export async function POST(request: NextRequest) {
    try {
        const { ticketId, action = 'download' } = await request.json()

        if (!ticketId) {
            return NextResponse.json({
                success: false,
                error: 'Необходимо указать ID тикета'
            }, { status: 400 })
        }

        // Получаем тикет с данными
        const ticket = await TicketService.findById(ticketId)
        if (!ticket) {
            return NextResponse.json({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        // Проверяем что тикет завершен и есть результат
        if (ticket.status !== 'COMPLETED' || !ticket.result) {
            return NextResponse.json({
                success: false,
                error: 'Тикет еще не завершен или нет результата проверки'
            }, { status: 400 })
        }

        // Подготавливаем данные для сертификата
        const certificateData: CertificateData = {
            ticketId: ticket.id,
            clientEmail: ticket.clientEmail,
            result: ticket.result,
            comment: ticket.comment || undefined,
            brandName: 'Designer Bag', // TODO: извлекать из метаданных тикета
            itemType: 'Сумка',
            checkDate: ticket.updatedAt,
            expertName: 'BagCheck Expert',
            qrCode: `CERT-${ticket.id}-${nanoid(8)}` // Простой QR без сохранения в БД
        }

        console.log('🔄 Генерируем сертификат для тикета:', ticketId)

        // Генерируем HTML сертификат
        const certificateBuffer = await PDFCertificateGenerator.generateCertificate(certificateData)

        console.log('✅ Сертификат сгенерирован, размер:', certificateBuffer.length, 'байт')

        // Возвращаем в зависимости от действия
        if (action === 'email') {
            // TODO: Отправить по email и вернуть статус
            return NextResponse.json({
                success: true,
                message: 'Сертификат отправлен на email',
                ticketId: ticket.id,
                clientEmail: ticket.clientEmail
            })
        }

        // По умолчанию - скачивание
        return new NextResponse(certificateBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `attachment; filename="certificate-${ticket.id}.html"`,
                'Cache-Control': 'no-store'
            }
        })

    } catch (error) {
        console.error('❌ Ошибка создания сертификата:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка создания сертификата',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }, { status: 500 })
    }
}