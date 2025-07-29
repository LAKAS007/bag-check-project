import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/tickets - создание нового тикета с загрузкой фото
export async function POST(req: NextRequest) {
    try {
        console.log('🚀 Starting ticket creation with Supabase...');

        // Проверяем переменные окружения
        console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('🔑 Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

        const formData = await req.formData();
        const email = formData.get('email') as string;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Получаем все файлы
        const files: File[] = [];
        for (const [key, value] of formData.entries()) {
            if (value instanceof File && key.startsWith('file_')) {
                files.push(value);
                console.log(`📷 Found file: ${value.name} (${value.size} bytes)`);
            }
        }

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'At least one image is required' },
                { status: 400 }
            );
        }

        console.log(`📧 Email: ${email}`);
        console.log(`📷 Files count: ${files.length}`);

        // Создаем тикет в БД
        const ticket = await prisma.ticket.create({
            data: {
                clientEmail: email,
                status: 'PENDING',
            },
        });

        console.log(`🎫 Created ticket: ${ticket.id}`);

        // Загружаем файлы в Supabase Storage
        const imagePromises = files.map(async (file, index) => {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const extension = file.name.split('.').pop() || 'jpg';
                const fileName = `${ticket.id}_image_${index + 1}.${extension}`;

                console.log(`📤 Uploading file ${index + 1}/${files.length}: ${fileName}`);

                // Загружаем в Supabase (передаем contentType как третий параметр)
                const { url, path } = await uploadToSupabase(
                    buffer,
                    fileName,
                    file.type
                );

                console.log(`✅ File uploaded successfully: ${url}`);
                console.log(`📁 File path: ${path}`);

                // Сохраняем в БД
                const image = await prisma.image.create({
                    data: {
                        ticketId: ticket.id,
                        url: url,
                        publicId: path, // Используем path как publicId для возможности удаления
                        type: 'INITIAL'
                    }
                });

                console.log(`💾 Image saved to DB: ${image.id}`);
                return image;

            } catch (uploadError) {
                console.error(`❌ Error uploading file ${index + 1}:`, uploadError);
                throw uploadError;
            }
        });

        // Ждем загрузки всех файлов
        const images = await Promise.all(imagePromises);

        // Получаем полный тикет с изображениями
        const fullTicket = await prisma.ticket.findUnique({
            where: { id: ticket.id },
            include: {
                images: true,
            },
        });

        console.log(`🎉 Ticket created successfully: ${ticket.id}`);
        console.log(`📊 Total images uploaded: ${images.length}`);

        return NextResponse.json({
            success: true,
            ticket: fullTicket,
            message: `Ticket created successfully with ${images.length} images`,
        });

    } catch (error) {
        console.error('❌ Error creating ticket:', error);

        // Более детальная ошибка для отладки
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error('Error details:', { errorMessage, errorStack });

        return NextResponse.json(
            {
                error: 'Failed to create ticket',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}

// GET /api/tickets - получение списка всех тикетов (для дашборда)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');

        const whereClause = status ? { status } : {};
        const limitNum = limit ? parseInt(limit) : undefined;
        const offsetNum = offset ? parseInt(offset) : undefined;

        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            include: {
                images: true,
                requests: true,
                certificate: true,
                _count: {
                    select: {
                        images: true,
                        requests: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limitNum,
            skip: offsetNum
        });

        // Подсчет общего количества для пагинации
        const total = await prisma.ticket.count({
            where: whereClause
        });

        // Возвращаем в формате, который ожидает dashboard
        return NextResponse.json({
            success: true,
            tickets,
            total,
            limit: limitNum,
            offset: offsetNum
        });

    } catch (error) {
        console.error('Ошибка получения тикетов:', error);

        return NextResponse.json(
            {
                success: false,  // Добавляем success: false для ошибок
                error: 'Ошибка получения данных',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}