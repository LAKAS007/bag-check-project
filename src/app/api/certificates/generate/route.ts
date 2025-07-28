// src/app/api/certificates/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PDFCertificateGenerator } from '@/lib/pdf-generator'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
    try {
        const { ticketId } = await req.json()

        if (!ticketId) {
            return NextResponse.json(
                { error: 'ID заявки обязателен' },
                { status: 400 }
            )
        }

        console.log('🔄 Генерируем сертификат для заявки:', ticketId)

        // Получаем данные заявки
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                images: true,
                certificate: true
            }
        })

        if (!ticket) {
            return NextResponse.json(
                { error: 'Заявка не найдена' },
                { status: 404 }
            )
        }

        // Проверяем, что заявка завершена и результат положительный
        if (ticket.status !== 'COMPLETED') {
            return NextResponse.json(
                { error: 'Заявка еще не завершена' },
                { status: 400 }
            )
        }

        if (ticket.result !== 'AUTHENTIC') {
            return NextResponse.json(
                { error: 'Сертификат выдается только для подлинных товаров' },
                { status: 400 }
            )
        }

        // Проверяем, не создан ли уже сертификат
        if (ticket.certificate) {
            return NextResponse.json({
                success: true,
                certificate: ticket.certificate,
                message: 'Сертификат уже существует'
            })
        }

        // Генерируем уникальный QR код
        const qrCode = nanoid(12)

        // Подготавливаем данные для PDF
        const certificateData = {
            ticketId: ticket.id,
            qrCode: qrCode,
            result: ticket.result as 'AUTHENTIC',
            comment: ticket.comment || 'Товар прошел экспертную проверку и признан подлинным.',
            clientEmail: ticket.clientEmail,
            images: ticket.images,
            expertName: 'Certified Expert',
            issuedAt: new Date()
        }

        // Генерируем PDF
        const { pdfUrl } = await PDFCertificateGenerator.generateCertificate(certificateData)

        // Сохраняем сертификат в БД
        const certificate = await prisma.certificate.create({
            data: {
                ticketId: ticket.id,
                qrCode: qrCode,
                pdfUrl: pdfUrl
            }
        })

        console.log('✅ Сертификат успешно создан:', certificate.id)

        return NextResponse.json({
            success: true,
            certificate: certificate,
            message: 'Сертификат успешно создан'
        })

    } catch (error) {
        console.error('❌ Ошибка генерации сертификата:', error)

        return NextResponse.json(
            { error: 'Не удалось создать сертификат' },
            { status: 500 }
        )
    }
}

// src/app/api/certificates/[id]/route.ts - Получение сертификата

type RouteContext = {
    params: Promise<{ id: string }>
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params

        const certificate = await prisma.certificate.findUnique({
            where: { id },
            include: {
                ticket: {
                    include: {
                        images: true
                    }
                }
            }
        })

        if (!certificate) {
            return NextResponse.json(
                { error: 'Сертификат не найден' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            certificate: certificate
        })

    } catch (error) {
        console.error('Ошибка получения сертификата:', error)

        return NextResponse.json(
            { error: 'Ошибка получения сертификата' },
            { status: 500 }
        )
    }
}