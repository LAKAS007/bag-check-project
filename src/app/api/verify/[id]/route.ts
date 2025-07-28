// src/app/api/verify-certificate/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
    params: Promise<{ id: string }>
}

// GET /api/verify-certificate/[id] - верификация сертификата по QR коду
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id: qrCode } = await context.params

        // Специальная обработка для демо данных
        if (qrCode === 'demo' || qrCode === 'test') {
            return NextResponse.json({
                success: true,
                certificate: {
                    id: 'cert-demo-001',
                    qrCode: 'demo',
                    pdfUrl: 'https://example.com/demo-certificate.pdf',
                    createdAt: new Date().toISOString(),
                    ticket: {
                        id: 'ticket-demo-001',
                        result: 'AUTHENTIC',
                        comment: 'После тщательного анализа всех предоставленных фотографий, включая проверку логотипа, швов, фурнитуры и серийного номера, эксперт подтверждает подлинность данного изделия. Все элементы соответствуют оригинальным стандартам качества бренда.',
                        clientEmail: 'demo@example.com',
                        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 дня назад
                        updatedAt: new Date().toISOString(),
                        images: [
                            {
                                id: 'img-1',
                                url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
                                type: 'INITIAL',
                                uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString()
                            },
                            {
                                id: 'img-2',
                                url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop',
                                type: 'INITIAL',
                                uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString()
                            },
                            {
                                id: 'img-3',
                                url: 'https://images.unsplash.com/photo-1590874315851-8c8cd8b48590?w=400&h=300&fit=crop',
                                type: 'INITIAL',
                                uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString()
                            }
                        ]
                    }
                }
            })
        }

        // Обработка для демо подделки
        if (qrCode === 'fake' || qrCode === 'fake-demo') {
            return NextResponse.json({
                success: true,
                certificate: {
                    id: 'cert-fake-001',
                    qrCode: 'fake',
                    pdfUrl: null, // Для подделок нет PDF
                    createdAt: new Date().toISOString(),
                    ticket: {
                        id: 'ticket-fake-001',
                        result: 'FAKE',
                        comment: 'В ходе экспертизы выявлены существенные несоответствия оригинальным стандартам: неправильная форма логотипа, некачественные швы, фурнитура не соответствует заводским стандартам. Серийный номер не найден в официальной базе производителя.',
                        clientEmail: 'demo@example.com',
                        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 день назад
                        updatedAt: new Date().toISOString(),
                        images: [
                            {
                                id: 'img-fake-1',
                                url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
                                type: 'INITIAL',
                                uploadedAt: new Date(Date.now() - 86400000).toISOString()
                            },
                            {
                                id: 'img-fake-2',
                                url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop',
                                type: 'ADDITIONAL',
                                uploadedAt: new Date(Date.now() - 43200000).toISOString() // 12 часов назад
                            }
                        ]
                    }
                }
            })
        }

        // Реальная логика поиска в БД
        const certificate = await prisma.certificate.findUnique({
            where: { qrCode },
            include: {
                ticket: {
                    include: {
                        images: {
                            orderBy: { uploadedAt: 'asc' }
                        }
                    }
                }
            }
        })

        if (!certificate) {
            return NextResponse.json({
                success: false,
                error: 'Сертификат не найден или QR-код недействителен'
            }, { status: 404 })
        }

        // Проверяем, что заявка завершена
        if (certificate.ticket.status !== 'COMPLETED') {
            return NextResponse.json({
                success: false,
                error: 'Заявка еще находится на рассмотрении'
            }, { status: 400 })
        }

        // Для подделок сертификат не должен существовать в реальной системе
        // Но если он есть в демо целях, возвращаем данные
        if (certificate.ticket.result === 'FAKE') {
            return NextResponse.json({
                success: true,
                certificate: {
                    id: certificate.id,
                    qrCode: certificate.qrCode,
                    pdfUrl: null, // Для подделок PDF нет
                    createdAt: certificate.createdAt,
                    ticket: {
                        id: certificate.ticket.id,
                        result: certificate.ticket.result,
                        comment: certificate.ticket.comment,
                        clientEmail: certificate.ticket.clientEmail,
                        createdAt: certificate.ticket.createdAt,
                        updatedAt: certificate.ticket.updatedAt,
                        images: certificate.ticket.images
                    }
                }
            })
        }

        // Возвращаем данные подлинного сертификата
        return NextResponse.json({
            success: true,
            certificate: {
                id: certificate.id,
                qrCode: certificate.qrCode,
                pdfUrl: certificate.pdfUrl,
                createdAt: certificate.createdAt,
                ticket: {
                    id: certificate.ticket.id,
                    result: certificate.ticket.result,
                    comment: certificate.ticket.comment,
                    clientEmail: certificate.ticket.clientEmail,
                    createdAt: certificate.ticket.createdAt,
                    updatedAt: certificate.ticket.updatedAt,
                    images: certificate.ticket.images
                }
            }
        })

    } catch (error) {
        console.error('Ошибка верификации сертификата:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка сервера при проверке сертификата'
        }, { status: 500 })
    }
}