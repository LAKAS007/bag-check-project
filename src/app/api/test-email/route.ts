// src/app/api/test-email/route.ts - Версия с защитой от дублирования
import { NextResponse } from 'next/server'
import * as nodemailer from 'nodemailer'

// Простая защита от двойных запросов в development
const recentRequests = new Set<string>()

export async function GET() {
    try {
        console.log('🧪 Тестируем email настройки...')

        // Создаем уникальный ключ для этого запроса
        const requestKey = `test-email-${Date.now()}`
        const timeWindow = 5000 // 5 секунд

        // Проверяем, не было ли недавно похожего запроса
        const recentKey = Array.from(recentRequests).find(key =>
            parseInt(key.split('-')[2]) > Date.now() - timeWindow
        )

        if (recentKey) {
            console.log('⚠️ Пропускаем дублированный запрос')
            return NextResponse.json({
                success: true,
                message: 'Запрос уже обработан (защита от дублирования)',
                skipped: true
            })
        }

        // Добавляем текущий запрос в список
        recentRequests.add(requestKey)

        // Очищаем старые запросы
        setTimeout(() => {
            recentRequests.delete(requestKey)
        }, timeWindow)

        console.log('SMTP_USER:', process.env.SMTP_USER)
        console.log('SMTP_HOST:', process.env.SMTP_HOST)

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        console.log('📡 Проверяем SMTP подключение...')
        await transporter.verify()
        console.log('✅ SMTP подключение работает')

        console.log('📧 Отправляем тестовое письмо...')

        const info = await transporter.sendMail({
            from: `"BagCheck Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: '🧪 Тест BagCheck Email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <h2 style="margin: 0;">🎉 Email настройки работают!</h2>
                    </div>
                    <div style="padding: 20px; background: #f8fafc; border-radius: 0 0 8px 8px;">
                        <p><strong>Время отправки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
                        <p><strong>Уникальный ID:</strong> ${requestKey}</p>
                        <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
                        <p style="color: #059669;">✅ Настройки работают - можно тестировать полный флоу!</p>
                    </div>
                </div>
            `
        })

        console.log('✅ Тестовое письмо отправлено:', info.messageId)

        return NextResponse.json({
            success: true,
            message: 'Email отправлен успешно!',
            messageId: info.messageId,
            requestKey
        })

    } catch (error) {
        console.error('❌ Ошибка email:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }, { status: 500 })
    }
}