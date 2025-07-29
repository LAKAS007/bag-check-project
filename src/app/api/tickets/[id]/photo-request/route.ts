// POST /api/tickets/[id]/photo-request - создание запроса на дополнительные фото
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params
        const body = await request.json()

        const { description } = body as { description: string }

        // Валидация
        if (!description || description.trim().length === 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Необходимо указать описание запроса'
            }, { status: 400 })
        }

        if (description.length > 500) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Описание не должно превышать 500 символов'
            }, { status: 400 })
        }

        // Проверка существования тикета
        const existingTicket = await TicketService.findById(id)
        if (!existingTicket) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Тикет не найден'
            }, { status: 404 })
        }

        // Проверка что тикет можно переводить в статус "нужны доп фото"
        if (existingTicket.status === 'COMPLETED') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Нельзя запросить дополнительные фото для завершенного тикета'
            }, { status: 400 })
        }

        // Создание запроса на дополнительные фото
        const photoRequest = await TicketService.createPhotoRequest(id, description.trim())

        // ✨ ОТПРАВКА EMAIL С ЗАПРОСОМ ДОПОЛНИТЕЛЬНЫХ ФОТО
        try {
            console.log(`📧 Sending photo request email for ticket: ${id}`)

            // Импортируем EmailService
            const { EmailService } = await import('@/lib/services/email')

            // Формируем URL для загрузки дополнительных фото
            const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upload/additional/${id}`

            // Отправляем email с запросом фото
            await EmailService.sendPhotoRequest({
                ticketId: id,
                clientEmail: existingTicket.clientEmail,
                description: description.trim(),
                uploadUrl: uploadUrl
            })

            console.log(`✅ Photo request email sent to: ${existingTicket.clientEmail}`)

        } catch (emailError) {
            console.error('❌ Error sending photo request email:', emailError)
            // Не прерываем процесс, запрос создан, email можно отправить позже
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: photoRequest,
            message: 'Запрос на дополнительные фото создан. Клиент получит уведомление на email.'
        })

    } catch (error) {
        console.error('Ошибка создания запроса на фото:', error)

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ошибка создания запроса'
        }, { status: 500 })
    }
}