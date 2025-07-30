// src/app/api/debug-pdf/route.ts - Для отладки PDF генерации
import { NextRequest, NextResponse } from 'next/server'
import { PDFCertificateGenerator, CertificateData } from '@/lib/pdf-generator'

export async function GET() {
    try {
        console.log('🧪 Отладочный тест PDF генератора...')

        const testData: CertificateData = {
            ticketId: 'DEBUG-TEST-001',
            clientEmail: 'debug@test.com',
            result: 'AUTHENTIC',
            comment: 'Тест генерации PDF с QR кодом. Все элементы должны быть видны.',
            brandName: 'Test Brand',
            itemType: 'Test Item',
            checkDate: new Date(),
            expertName: 'Debug Expert',
            qrCode: 'DEBUG-QR-123456789'
        }

        console.log('📄 Тестовые данные:', testData)

        // Генерируем PDF
        const pdfBuffer = await PDFCertificateGenerator.generateCertificate(testData)

        console.log('✅ PDF успешно сгенерирован')
        console.log('📏 Размер PDF:', pdfBuffer.length, 'байт')

        // Проверяем, что это действительно PDF
        const pdfHeader = pdfBuffer.slice(0, 4).toString()
        console.log('📋 Заголовок файла:', pdfHeader)

        if (pdfHeader === '%PDF') {
            console.log('✅ Это настоящий PDF файл')
        } else if (pdfHeader.includes('<!DO')) {
            console.log('❌ Это HTML файл, а не PDF!')
        } else {
            console.log('⚠️ Неизвестный тип файла')
        }

        // Возвращаем PDF для проверки
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="debug-certificate.pdf"'
            }
        })

    } catch (error) {
        console.error('❌ Ошибка отладочного теста:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}