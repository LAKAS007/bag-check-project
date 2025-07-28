// src/app/dashboard/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Camera, Eye, Calendar, Mail, Hash, Download, AlertCircle, Clock, Loader2 } from 'lucide-react'
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
        color: 'text-green-600 dark:text-green-400'
    },
    FAKE: {
        label: 'Подделка',
        color: 'text-red-600 dark:text-red-400'
    }
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<Image | null>(null)
    const [comment, setComment] = useState('')
    const [photoRequest, setPhotoRequest] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        fetchTicket()
    }, [params.id])

    const fetchTicket = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/tickets/${params.id}`)
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

    const handleDecision = async (result: 'AUTHENTIC' | 'FAKE') => {
        if (!comment.trim()) {
            alert('Пожалуйста, добавьте комментарий к решению')
            return
        }

        setIsProcessing(true)
        try {
            const response = await fetch(`/api/tickets/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'COMPLETED',
                    result,
                    comment
                })
            })

            const data = await response.json()

            if (data.success) {
                setTicket(data.data)
                alert(`Решение "${result === 'AUTHENTIC' ? 'Подлинная' : 'Подделка'}" успешно сохранено`)
            } else {
                alert(data.error || 'Ошибка при сохранении решения')
            }
        } catch (err) {
            alert('Ошибка при отправке данных')
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
            // Здесь нужно будет адаптировать под ваш API
            const response = await fetch(`/api/tickets/${params.id}/photo-request`, {
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
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Заявка {ticket.id.slice(0, 8)}...
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Проверка подлинности дизайнерской сумки
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {getStatusBadge(ticket.status)}
                            {ticket.certificate && (
                                <a
                                    href={ticket.certificate.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Скачать сертификат"
                                >
                                    <Download className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Левая колонка - Информация о заявке */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Основная информация */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Информация о заявке
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center text-sm">
                                    <Hash className="w-4 h-4 text-slate-400 mr-3" />
                                    <span className="text-slate-600 dark:text-slate-300">ID:</span>
                                    <span className="ml-2 font-mono text-slate-900 dark:text-white">
                    {ticket.id}
                  </span>
                                </div>

                                <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 text-slate-400 mr-3" />
                                    <span className="text-slate-600 dark:text-slate-300">Клиент:</span>
                                    <span className="ml-2 text-slate-900 dark:text-white">
                    {ticket.clientEmail}
                  </span>
                                </div>

                                <div className="flex items-center text-sm">
                                    <Calendar className="w-4 h-4 text-slate-400 mr-3" />
                                    <span className="text-slate-600 dark:text-slate-300">Создана:</span>
                                    <span className="ml-2 text-slate-900 dark:text-white">
                    {formatDate(ticket.createdAt)}
                  </span>
                                </div>

                                {ticket.result && (
                                    <div className="flex items-center text-sm">
                                        <CheckCircle className="w-4 h-4 text-slate-400 mr-3" />
                                        <span className="text-slate-600 dark:text-slate-300">Результат:</span>
                                        <span className={`ml-2 font-medium ${resultConfig[ticket.result].color}`}>
                      {resultConfig[ticket.result].label}
                    </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Запросы дополнительных фото */}
                        {ticket.requests.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Запросы дополнительных фото
                                </h3>

                                <div className="space-y-3">
                                    {ticket.requests.map((request) => (
                                        <div key={request.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                                {request.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(request.createdAt)}
                        </span>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    request.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                          {request.status === 'PENDING' ? 'Ожидает' : 'Выполнен'}
                        </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Новый запрос фото - только если статус не COMPLETED */}
                        {ticket.status !== 'COMPLETED' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Запросить дополнительные фото
                                </h3>

                                <div className="space-y-4">
                  <textarea
                      value={photoRequest}
                      onChange={(e) => setPhotoRequest(e.target.value)}
                      placeholder="Опишите, какие дополнительные фотографии нужны для экспертизы..."
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                  />

                                    <button
                                        onClick={handlePhotoRequest}
                                        disabled={isProcessing || !photoRequest.trim()}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4 mr-2" />
                                        )}
                                        {isProcessing ? 'Отправка...' : 'Отправить запрос'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Правая колонка - Фотографии и решение */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Галерея фотографий */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Фотографии сумки ({ticket.images.length})
                                </h3>
                                {selectedImage && (
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Свернуть просмотр
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                {ticket.images.map((image) => (
                                    <div
                                        key={image.id}
                                        className="relative group cursor-pointer"
                                        onClick={() => setSelectedImage(selectedImage?.id === image.id ? null : image)}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`Фото ${image.type === 'INITIAL' ? 'изначальное' : 'дополнительное'}`}
                                            className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600 transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                                        <div className="absolute bottom-2 left-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                          image.type === 'INITIAL'
                              ? 'bg-blue-500 text-white'
                              : 'bg-orange-500 text-white'
                      }`}>
                        {image.type === 'INITIAL' ? 'Основное' : 'Доп.'}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Увеличенное изображение */}
                            {selectedImage && (
                                <div className="mb-6">
                                    <div className="relative">
                                        <img
                                            src={selectedImage.url}
                                            alt="Увеличенное фото"
                                            className="w-full max-h-96 object-contain bg-slate-100 dark:bg-slate-700 rounded-lg"
                                        />
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">
                                        {selectedImage.type === 'INITIAL' ? 'Изначальное фото' : 'Дополнительное фото'} •
                                        Загружено: {formatDate(selectedImage.uploadedAt)}
                                    </p>
                                </div>
                            )}
                        </div>

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
                                    <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mr-3">
                      Результат:
                    </span>
                                        <span className={`text-lg font-bold ${ticket.result ? resultConfig[ticket.result].color : ''}`}>
                      {ticket.result ? resultConfig[ticket.result].label : 'Не определен'}
                    </span>
                                    </div>

                                    {ticket.comment && (
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                                Комментарий эксперта:
                                            </h4>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                    {ticket.comment}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {ticket.certificate && (
                                        <div className="mt-6 p-4 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-green-800 dark:text-green-400">
                                                        Сертификат готов
                                                    </h4>
                                                    <p className="text-xs text-green-600 dark:text-green-500">
                                                        Выдан: {formatDate(ticket.certificate.createdAt)}
                                                    </p>
                                                </div>
                                                <a
                                                    href={ticket.certificate.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                >
                                                    Скачать PDF
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}