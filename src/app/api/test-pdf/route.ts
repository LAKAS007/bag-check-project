// src/app/api/test-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PDFCertificateGenerator, CertificateData } from '@/lib/pdf-generator'

export async function GET(request: NextRequest) {
    try {
        console.log('🧪 Тестируем генерацию сертификата...')

        // Тестовые данные
        const testData: CertificateData = {
            ticketId: 'TEST-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
            clientEmail: 'test@example.com',
            result: 'AUTHENTIC',
            comment: 'Все элементы аутентификации соответствуют оригиналу. Качество материалов и фурнитуры на высоком уровне. Проверены: серийный номер, фурнитура, строчки, материал, голограммы и маркировка.',
            brandName: 'Louis Vuitton',
            itemType: 'Сумка Neverfull MM',
            checkDate: new Date(),
            expertName: 'Анна Петрова',
            qrCode: 'TEST-QR-' + Math.random().toString(36).substr(2, 8)
        }

        console.log('📄 Данные для сертификата:', {
            ticketId: testData.ticketId,
            result: testData.result,
            brand: testData.brandName
        })

        // Генерируем сертификат
        const certificateBuffer = await PDFCertificateGenerator.generateCertificate(testData)

        console.log('✅ Сертификат сгенерирован успешно, размер:', certificateBuffer.length, 'байт')

        // Возвращаем HTML файл (пока что)
        // Позже можно будет добавить настоящий PDF через Puppeteer
        return new NextResponse(certificateBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="certificate-${testData.ticketId}.html"`,
                'Cache-Control': 'no-store'
            }
        })

    } catch (error) {
        console.error('❌ Ошибка тестирования сертификата:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка генерации сертификата',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}

// POST для тестирования с кастомными данными
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const testData: CertificateData = {
            ticketId: body.ticketId || 'TEST-' + Date.now(),
            clientEmail: body.clientEmail || 'test@example.com',
            result: body.result || 'AUTHENTIC',
            comment: body.comment || 'Тестовый комментарий эксперта. Все проверки пройдены успешно.',
            brandName: body.brandName || 'Test Brand',
            itemType: body.itemType || 'Сумка',
            checkDate: new Date(),
            expertName: body.expertName || 'Test Expert',
            qrCode: body.qrCode || 'TEST-QR-' + Date.now()
        }

        console.log('📄 Генерируем сертификат с пользовательскими данными:', testData)

        const certificateBuffer = await PDFCertificateGenerator.generateCertificate(testData)

        return new NextResponse(certificateBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="certificate-${testData.ticketId}.html"`,
                'Cache-Control': 'no-store'
            }
        })

    } catch (error) {
        console.error('❌ Ошибка генерации сертификата:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка генерации сертификата',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }, { status: 500 })
    }
}