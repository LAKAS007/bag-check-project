// src/app/dashboard/[id]/page.tsx - Полная версия с PDF интеграцией
'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Camera, Eye, Calendar, Mail, Hash, Download, AlertCircle, Clock, Loader2, Send } from 'lucide-react'
import Link from 'next/link'

interface Image {
    id: string
    url: string
    type: 'INITIAL' | 'ADDITIONAL'
    uploadedAt: string
}

interface PhotoRequest {
    id: string
    description: string
    status: 'PENDING' | 'FULFILLED'
    createdAt: string
}

interface Certificate {
    id: string
    pdfUrl: string
    qrCode: string
    createdAt: string
}

interface Ticket {
    id: string
    status: 'PENDING' | 'NEEDS_MORE_PHOTOS' | 'IN_REVIEW' | 'COMPLETED'
    result?: 'AUTHENTIC' | 'FAKE'
    comment?: string
    clientEmail: string
    createdAt: string
    updatedAt: string
    images: Image[]
    requests: PhotoRequest[]
    certificate?: Certificate
}

const statusConfig = {
    PENDING: {
        label: 'Ожидает проверки',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: Clock
    },
    NEEDS_MORE_PHOTOS: {
        label: 'Нужны доп. фото',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        icon: AlertCircle
    },
    IN_REVIEW: {
        label: 'На проверке',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        icon: Eye
    },
    COMPLETED: {
        label: 'Завершено',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle
    }
}

const resultConfig = {
    AUTHENTIC: {
        label: 'Подлинная',
        color: 'text-green-600 dark:text-green-400',
        icon: CheckCircle
    },
    FAKE: {
        label: 'Подделка',
        color: 'text-red-600 dark:text-red-400',
        icon: XCircle
    }
}

// ИСПРАВЛЕНИЕ: params теперь Promise в Next.js 15
export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<Image | null>(null)
    const [comment, setComment] = useState('')
    const [photoRequest, setPhotoRequest] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [ticketId, setTicketId] = useState<string | null>(null)

    // Разворачиваем Promise params
    useEffect(() => {
        const initParams = async () => {
            const resolvedParams = await params
            setTicketId(resolvedParams.id)
        }
        initParams()
    }, [params])

    // Загружаем данные только после получения ID
    useEffect(() => {
        if (ticketId) {
            fetchTicket()
        }
    }, [ticketId])

    const fetchTicket = async () => {
        if (!ticketId) return

        try {
            setLoading(true)
            const response = await fetch(`/api/tickets/${ticketId}`)
            const data = await response.json()

            if (data.success) {
                setTicket(data.data)
            } else {
                setError(data.error || 'Тикет не найден')
            }
        } catch (err) {
            setError('Ошибка при загрузке данных')
        } finally {
            setLoading(false)
        }
    }

    // Обновленная функция с PDF интеграцией
    const handleDecision = async (result: 'AUTHENTIC' | 'FAKE') => {
        if (!comment.trim()) {
            alert('Пожалуйста, добавьте комментарий к решению')
            return
        }

        setIsProcessing(true)
        try {
            console.log(`🏁 Отправляем решение: ${result}`)

            const response = await fetch(`/api/tickets/${ticketId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    result,
                    comment,
                    expertName: 'BagCheck Expert',
                    brandName: 'Designer Bag',
                    itemType: 'Сумка'
                })
            })

            const data = await response.json()

            if (data.success) {
                // Обновляем локальное состояние тикета
                setTicket(data.data)

                // Показываем успешное сообщение
                alert(data.message)

                // Очищаем комментарий
                setComment('')

            } else {
                alert(data.error || 'Ошибка при сохранении решения')

                if (data.warning) {
                    console.warn('⚠️ Предупреждение:', data.warning)
                    setTimeout(() => alert(`Внимание: ${data.warning}`), 500)
                }
            }

        } catch (err) {
            console.error('❌ Ошибка при отправке решения:', err)
            alert('Ошибка при отправке данных на сервер')
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePhotoRequest = async () => {
        if (!photoRequest.trim()) {
            alert('Опишите, какие фото нужны')
            return
        }

        setIsProcessing(true)
        try {
            const response = await fetch(`/api/tickets/${ticketId}/photo-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: photoRequest
                })
            })

            const data = await response.json()

            if (data.success) {
                setTicket(data.data)
                setPhotoRequest('')
                alert('Запрос на дополнительные фото отправлен клиенту')
            } else {
                alert(data.error || 'Ошибка при отправке запроса')
            }
        } catch (err) {
            alert('Ошибка при отправке данных')
        } finally {
            setIsProcessing(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig]
        if (!config) return null

        const Icon = config.icon
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Загрузка данных...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <Link
                        href="/dashboard"
                        className="text-blue-600 hover:text-blue-700 underline"
                    >
                        Вернуться к списку заявок
                    </Link>
                </div>
            </div>
        )
    }

    if (!ticket) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    Тикет #{ticket.id.slice(-8)}
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {ticket.clientEmail}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {getStatusBadge(ticket.status)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Левая колонка - Детали тикета */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Информация о тикете */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Информация о заявке
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <Hash className="w-4 h-4 text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">ID тикета</p>
                                        <p className="font-mono text-slate-900 dark:text-white">{ticket.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">Email клиента</p>
                                        <p className="text-slate-900 dark:text-white">{ticket.clientEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">Создан</p>
                                        <p className="text-slate-900 dark:text-white">{formatDate(ticket.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Camera className="w-4 h-4 text-slate-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">Фотографии</p>
                                        <p className="text-slate-900 dark:text-white">{ticket.images.length} шт</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Фотографии */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Фотографии ({ticket.images.length})
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {ticket.images.map((image) => (
                                    <div
                                        key={image.id}
                                        className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`Фото ${image.type}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`text-xs px-2 py-1 rounded text-white ${
                                                image.type === 'INITIAL' ? 'bg-blue-600' : 'bg-orange-600'
                                            }`}>
                                                {image.type === 'INITIAL' ? 'Основное' : 'Доп.'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Модалка для просмотра изображения */}
                            {selectedImage && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
                                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                                Просмотр фотографии
                                            </h3>
                                            <button
                                                onClick={() => setSelectedImage(null)}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                <XCircle className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <img
                                                src={selectedImage.url}
                                                alt="Увеличенное фото"
                                                className="max-w-full max-h-[60vh] object-contain mx-auto"
                                            />
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 text-center">
                                                {selectedImage.type === 'INITIAL' ? 'Изначальное фото' : 'Дополнительное фото'} •
                                                Загружено: {formatDate(selectedImage.uploadedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Правая колонка - Экспертное заключение */}
                    <div className="space-y-6">
                        {/* Экспертное заключение - только если статус не COMPLETED */}
                        {ticket.status !== 'COMPLETED' ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                    Экспертное заключение
                                </h3>

                                <div className="space-y-6">
                                    {/* Комментарий */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Комментарий эксперта *
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Опишите ваше заключение, на основании каких признаков принято решение..."
                                            className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Кнопки решения */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleDecision('AUTHENTIC')}
                                            disabled={isProcessing || !comment.trim()}
                                            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                            )}
                                            {isProcessing ? 'Обработка...' : 'Подлинная'}
                                        </button>

                                        <button
                                            onClick={() => handleDecision('FAKE')}
                                            disabled={isProcessing || !comment.trim()}
                                            className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            ) : (
                                                <XCircle className="w-5 h-5 mr-2" />
                                            )}
                                            {isProcessing ? 'Обработка...' : 'Подделка'}
                                        </button>
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        * Комментарий обязателен и будет включен в сертификат
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Показываем результат если заявка завершена */
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                Экспертное заключение
                            </h3>

                            <div className="space-y-4">
                                {/* Результат проверки */}
                                <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            Результат:
                                        </span>
                                    <span className={`text-lg font-bold ${ticket.result ? resultConfig[ticket.result].color : ''}`}>
                                            {ticket.result ? resultConfig[ticket.result].label : 'Не определен'}
                                        </span>
                                </div>

                                {/* Комментарий эксперта */}
                                {ticket.comment && (
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">
                                                Комментарий эксперта:
                                            </span>
                                        <p className="text-slate-900 dark:text-white leading-relaxed">
                                            {ticket.comment}
                                        </p>
                                    </div>
                                )}

                                {/* Информация об отправке */}
                                <div className={`mt-4 p-4 rounded-lg border ${
                                    ticket.result === 'AUTHENTIC'
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                                }`}>
                                    <div className="flex items-center">
                                        <Mail className={`w-5 h-5 mr-2 ${
                                            ticket.result === 'AUTHENTIC'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-orange-600 dark:text-orange-400'
                                        }`} />
                                        <div>
                                            <p className={`text-sm font-medium ${
                                                ticket.result === 'AUTHENTIC'
                                                    ? 'text-green-800 dark:text-green-200'
                                                    : 'text-orange-800 dark:text-orange-200'
                                            }`}>
                                                {ticket.result === 'AUTHENTIC'
                                                    ? 'PDF сертификат отправлен на email'
                                                    : 'Уведомление отправлено на email'
                                                }
                                            </p>
                                            <p className={`text-xs ${
                                                ticket.result === 'AUTHENTIC'
                                                    ? 'text-green-600 dark:text-green-300'
                                                    : 'text-orange-600 dark:text-orange-300'
                                            }`}>
                                                Адрес: {ticket.clientEmail}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* QR код для верификации (только для подлинных) */}
                                {ticket.result === 'AUTHENTIC' && ticket.certificate && (
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">
                                                QR код для верификации:
                                            </span>
                                        <div className="flex items-center space-x-3">
                                            <code className="text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded">
                                                {ticket.certificate.qrCode}
                                            </code>
                                            <button
                                                onClick={() => window.open(`/verify/${ticket.certificate?.qrCode}`, '_blank')}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Проверить →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        )}

                        {/* Запрос дополнительных фото - только если статус позволяет */}
                        {(ticket.status === 'PENDING' || ticket.status === 'IN_REVIEW') && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Запросить дополнительные фото
                                </h3>
                                <div className="space-y-4">
                                    <textarea
                                        value={photoRequest}
                                        onChange={(e) => setPhotoRequest(e.target.value)}
                                        placeholder="Опишите какие дополнительные фотографии нужны..."
                                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={3}
                                    />
                                    <button
                                        onClick={handlePhotoRequest}
                                        disabled={isProcessing || !photoRequest.trim()}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4 mr-2" />
                                        )}
                                        {isProcessing ? 'Отправка...' : 'Отправить запрос'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* История запросов фото */}
                        {ticket.requests.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    История запросов
                                </h3>
                                <div className="space-y-3">
                                    {ticket.requests.map((request) => (
                                        <div key={request.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    request.status === 'FULFILLED'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    {request.status === 'FULFILLED' ? 'Выполнен' : 'Ожидает'}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDate(request.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                {request.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}