// src/app/api/verify-certificate/[qrCode]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { CertificateService } from '@/lib/services/certificates'

type RouteContext = {
    params: Promise<{ qrCode: string }>
}

// GET /api/verify-certificate/[qrCode] - верификация сертификата по QR коду
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { qrCode } = await context.params

        console.log('🔍 Верификация сертификата по QR коду:', qrCode)

        // Ищем сертификат по QR коду
        const certificate = await CertificateService.findByQrCode(qrCode)

        if (!certificate) {
            console.log('❌ Сертификат не найден для QR кода:', qrCode)

            return NextResponse.json({
                success: false,
                error: 'Сертификат не найден',
                verified: false
            }, { status: 404 })
        }

        console.log('✅ Сертификат найден:', certificate.id, 'для тикета:', certificate.ticketId)

        // Возвращаем данные сертификата
        return NextResponse.json({
            success: true,
            verified: true,
            certificate: {
                id: certificate.id,
                ticketId: certificate.ticketId,
                result: certificate.ticket.result,
                brandName: 'Designer Bag', // TODO: извлекать из метаданных
                itemType: 'Сумка',
                checkDate: certificate.ticket.updatedAt,
                issuedAt: certificate.issuedAt,
                clientEmail: certificate.ticket.clientEmail,
                comment: certificate.ticket.comment,
                qrCode: certificate.qrCode
            }
        })

    } catch (error) {
        console.error('❌ Ошибка верификации сертификата:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка верификации сертификата',
            verified: false,
            details: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }, { status: 500 })
    }
}