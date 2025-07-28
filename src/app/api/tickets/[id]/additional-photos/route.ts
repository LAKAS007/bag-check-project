// src/app/api/tickets/[id]/additional-photos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { TicketService } from '@/lib/services/tickets'
import { uploadToSupabase } from '@/lib/supabase'
import { ApiResponse } from '@/types'
import { prisma } from '@/lib/prisma'

type RouteContext = {
    params: Promise<{ id: string }>
}

// POST /api/tickets/[id]/additional-photos - загрузка дополнительных фото
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params

        console.log('📸 Получен запрос на загрузку дополнительных фото для тикета:', id)

        // Проверяем существование тикета
        const ticket = await TicketService.findById(id)
        if (!ticket) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        // Проверяем статус тикета
        if (ticket.status !== 'NEEDS_MORE_PHOTOS') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Этот тикет не ожидает дополнительных фотографий'
            }, { status: 400 })
        }

        // Парсим FormData
        const formData = await request.formData()
        const files: File[] = []

        // Извлекаем все файлы из FormData
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file_') && value instanceof File) {
                files.push(value)
            }
        }

        console.log(`📤 Найдено файлов для загрузки: ${files.length}`)

        if (files.length === 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Не найдено файлов для загрузки'
            }, { status: 400 })
        }

        if (files.length > 10) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Можно загрузить максимум 10 файлов'
            }, { status: 400 })
        }

        // Загружаем файлы в Supabase
        const imagePromises = files.map(async (file, index) => {
            try {
                // Валидация файла
                if (!file.type.startsWith('image/')) {
                    throw new Error(`Файл ${file.name} не является изображением`)
                }

                if (file.size > 5 * 1024 * 1024) { // 5MB
                    throw new Error(`Файл ${file.name} слишком большой (максимум 5MB)`)
                }

                console.log(`📤 Загружаем дополнительное фото ${index + 1}/${files.length}: ${file.name}`)

                // Конвертируем в Buffer
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                // Генерируем имя файла
                const extension = file.name.split('.').pop() || 'jpg'
                const fileName = `${id}_additional_${Date.now()}_${index + 1}.${extension}`

                // Загружаем в Supabase
                const { url, path } = await uploadToSupabase(buffer, fileName)

                console.log(`✅ Дополнительное фото загружено: ${url}`)

                // Сохраняем в БД
                const image = await prisma.image.create({
                    data: {
                        ticketId: id,
                        url: url,
                        publicId: path,
                        type: 'ADDITIONAL', // Помечаем как дополнительное фото
                    },
                })

                console.log(`💾 Дополнительное фото сохранено в БД: ${image.id}`)
                return image

            } catch (uploadError) {
                console.error(`❌ Ошибка загрузки файла ${file.name}:`, uploadError)
                throw uploadError
            }
        })

        // Ждем загрузки всех файлов
        const images = await Promise.all(imagePromises)

        // Обновляем статус тикета обратно на IN_REVIEW
        const updatedTicket = await TicketService.updateStatus(id, {
            status: 'IN_REVIEW',
            result: undefined,
            comment: undefined
        })

        // Помечаем последний запрос фото как выполненный
        await prisma.photoRequest.updateMany({
            where: {
                ticketId: id,
                status: 'PENDING'
            },
            data: {
                status: 'FULFILLED'
            }
        })

        console.log(`🎉 Дополнительные фото загружены успешно: ${images.length} файлов`)

        // TODO: Уведомить эксперта о загрузке дополнительных фото

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                ticket: updatedTicket,
                images: images,
                message: `Загружено ${images.length} дополнительных фотографий`
            },
            message: 'Дополнительные фотографии успешно загружены. Эксперт продолжит проверку.'
        })

    } catch (error) {
        console.error('❌ Ошибка загрузки дополнительных фото:', error)

        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка загрузки дополнительных фотографий',
            details: errorMessage
        }, { status: 500 })
    }
}