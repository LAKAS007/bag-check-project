// src/app/api/test-pdf/route.ts - ДЛЯ ТЕСТИРОВАНИЯ
import { NextRequest, NextResponse } from 'next/server'
import { PDFCertificateGenerator } from '@/lib/pdf-generator'

export async function GET() {
    try {
        console.log('🧪 Тестируем генерацию PDF сертификата...')

        // Тестовые данные
        const testData = {
            ticketId: 'test-ticket-001',
            qrCode: 'test-qr-123456',
            result: 'AUTHENTIC' as const,
            comment: 'После детального анализа всех предоставленных фотографий, включая проверку логотипа, швов, фурнитуры и серийного номера, эксперт подтверждает подлинность данного изделия Louis Vuitton. Все элементы полностью соответствуют оригинальным стандартам качества бренда.',
            clientEmail: 'test@example.com',
            images: [
                {
                    id: 'img-1',
                    url: 'https://example.com/image1.jpg',
                    type: 'INITIAL'
                },
                {
                    id: 'img-2',
                    url: 'https://example.com/image2.jpg',
                    type: 'INITIAL'
                },
                {
                    id: 'img-3',
                    url: 'https://example.com/image3.jpg',
                    type: 'ADDITIONAL'
                }
            ],
            expertName: 'Test Expert',
            issuedAt: new Date()
        }

        // Генерируем PDF
        const pdfBuffer = await PDFCertificateGenerator.generateCertificate(testData)
        const fileName = PDFCertificateGenerator.generateFileName(testData.ticketId)

        console.log('✅ PDF успешно создан!')
        console.log('📄 Размер файла:', pdfBuffer.length, 'байт')
        console.log('📁 Имя файла:', fileName)

        // Возвращаем PDF как download
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': pdfBuffer.length.toString()
            }
        })

    } catch (error) {
        console.error('❌ Ошибка тестирования PDF:', error)

        return NextResponse.json({
            error: 'Не удалось создать тестовый PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}