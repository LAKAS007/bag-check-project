import { Prisma } from '@prisma/client'

// Полные типы сущностей с их связями
export type TicketWithRelations = Prisma.TicketGetPayload<{
    include: {
        images: true
        requests: true
        certificate: true
        user: true
    }
}>

export type TicketWithImages = Prisma.TicketGetPayload<{
    include: {
        images: true
    }
}>

export type TicketWithCertificate = Prisma.TicketGetPayload<{
    include: {
        certificate: true
    }
}>

// Типы для создания сущностей
export type CreateTicketData = {
    clientEmail: string
    images: {
        url: string
        publicId: string
        type?: 'INITIAL'
    }[]
}

export type CreatePhotoRequestData = {
    ticketId: string
    description: string
}

export type UpdateTicketStatusData = {
    status: 'PENDING' | 'NEEDS_MORE_PHOTOS' | 'IN_REVIEW' | 'COMPLETED'
    result?: 'AUTHENTIC' | 'FAKE'
    comment?: string
}

// API Response типы
export type ApiResponse<T = any> = {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export type UploadResponse = {
    url: string
    publicId: string
}

// Статусы и результаты (для удобства)
export const TICKET_STATUS = {
    PENDING: 'PENDING',
    NEEDS_MORE_PHOTOS: 'NEEDS_MORE_PHOTOS',
    IN_REVIEW: 'IN_REVIEW',
    COMPLETED: 'COMPLETED',
} as const

export const TICKET_RESULT = {
    AUTHENTIC: 'AUTHENTIC',
    FAKE: 'FAKE',
} as const

export const IMAGE_TYPE = {
    INITIAL: 'INITIAL',
    ADDITIONAL: 'ADDITIONAL',
} as const