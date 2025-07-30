// src/app/verify/[id]/page.tsx - АДАПТИВНАЯ ВЕРСИЯ (статус + сертификат)
'use client'

import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, Calendar, Mail, Hash, Download, Loader2, AlertTriangle, Eye, Clock, Camera, Share2, Copy, Check, Award, FileText } from 'lucide-react'
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
        description: 'Ваша заявка принята и ожидает назначения эксперта',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: Clock
    },
    NEEDS_MORE_PHOTOS: {
        label: 'Нужны дополнительные фото',
        description: 'Эксперт запросил дополнительные фотографии для точной оценки',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        icon: Camera
    },
    IN_REVIEW: {
        label: 'На проверке',
        description: 'Эксперт анализирует предоставленные фотографии',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        icon: Eye
    },
    COMPLETED: {
        label: 'Проверка завершена',
        description: 'Результат экспертизы готов',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle
    }
}

const resultConfig = {
    AUTHENTIC: {
        label: 'Подлинная',
        title: 'Сертификат подлинности',
        color: 'text-green-600',
        icon: Award,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        cardBg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    FAKE: {
        label: 'Подделка',
        title: 'Заключение о подделке',
        color: 'text-red-600',
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        cardBg: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
    }
}

export default function AdaptiveVerifyPage({ params }: { params: Promise<{ id: string }> }) {
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<Image | null>(null)
    const [copied, setCopied] = useState(false)
    const [ticketId, setTicketId] = useState<string | null>(null)

    // Разворачиваем Promise params для Next.js 15
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
            setError(null)

            console.log('🔍 Загружаем данные тикета:', ticketId)

            // Обращаемся к API эндпоинту для получения тикета
            const response = await fetch(`/api/tickets/${ticketId}`)
            const data = await response.json()

            console.log('📄 Ответ API:', data)

            if (!response.ok) {
                throw new Error(data.error || 'Тикет не найден')
            }

            if (data.success && data.data) {
                setTicket(data.data)
                console.log('✅ Тикет загружен:', data.data)
            } else {
                throw new Error('Некорректный ответ от сервера')
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки тикета:', error)
            setError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке данных')
        } finally {
            setLoading(false)
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

    const formatCertificateDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    const openImageModal = (image: Image) => {
        setSelectedImage(image)
    }

    const closeImageModal = () => {
        setSelectedImage(null)
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    const shareLink = () => {
        const url = window.location.href
        if (navigator.share) {
            navigator.share({
                title: 'BagCheck - Сертификат подлинности',
                url: url
            })
        } else {
            copyToClipboard(url)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        Загружаем информацию
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        {ticketId && ticketId.length > 10 ? 'Проверяем сертификат...' : 'Проверяем статус заявки...'}
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="flex items-center justify-center pt-20">
                    <div className="text-center max-w-md mx-auto px-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Заявка не найдена
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 mb-8">
                            {error}
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/upload"
                                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Создать новую заявку
                            </Link>
                            <Link
                                href="/"
                                className="block w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
                            >
                                На главную
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        Данные не загружены
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        Попробуйте обновить страницу
                    </p>
                </div>
            </div>
        )
    }

    const currentStatus = statusConfig[ticket.status]
    const currentResult = ticket.result ? resultConfig[ticket.result] : null
    const isCompleted = ticket.status === 'COMPLETED'

    // 🎯 АДАПТИВНАЯ ЛОГИКА: разные режимы отображения
    if (isCompleted && currentResult) {
        // ═══════════════════════════════════════════════════════════════
        // 🏆 РЕЖИМ СЕРТИФИКАТА (когда тикет завершен)
        // ═══════════════════════════════════════════════════════════════
        return (
            <div className={`min-h-screen ${currentResult.cardBg}`}>
                {/* Header */}
                <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
                            </Link>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={shareLink}
                                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            <span className="text-sm">Скопировано</span>
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="h-4 w-4" />
                                            <span className="text-sm">Поделиться</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Certificate Header */}
                    <div className="text-center mb-12">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${currentResult.bgColor} mb-6`}>
                            <currentResult.icon className={`h-10 w-10 ${currentResult.color}`} />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            {currentResult.title}
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-300">
                            Официальное заключение экспертов BagCheck
                        </p>
                    </div>

                    {/* Certificate Card */}
                    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 ${currentResult.borderColor} p-8 mb-8`}>
                        {/* Certificate Number & Date */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Номер сертификата</div>
                                <div className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
                                    #{ticket.id.toUpperCase()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Дата выдачи</div>
                                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {formatCertificateDate(ticket.updatedAt)}
                                </div>
                            </div>
                        </div>

                        {/* Main Result */}
                        <div className={`text-center py-8 px-6 rounded-xl ${currentResult.bgColor} mb-8`}>
                            <div className={`text-3xl font-bold ${currentResult.color} mb-2`}>
                                {currentResult.label.toUpperCase()}
                            </div>
                            <div className="text-lg text-slate-700 dark:text-slate-300">
                                {ticket.result === 'AUTHENTIC' ? 'Изделие соответствует оригинальным стандартам' : 'Изделие является подделкой'}
                            </div>
                        </div>

                        {/* Expert Comment */}
                        {ticket.comment && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                    Заключение эксперта
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {ticket.comment}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Certificate Details */}
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <div className="text-slate-500 dark:text-slate-400 mb-1">Эксперт</div>
                                    <div className="text-slate-900 dark:text-white font-medium">BagCheck Expert</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 dark:text-slate-400 mb-1">Тип изделия</div>
                                    <div className="text-slate-900 dark:text-white font-medium">Дизайнерская сумка</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 dark:text-slate-400 mb-1">Метод проверки</div>
                                    <div className="text-slate-900 dark:text-white font-medium">Визуальная экспертиза</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 dark:text-slate-400 mb-1">Количество фото</div>
                                    <div className="text-slate-900 dark:text-white font-medium">{ticket.images.length} шт.</div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Код верификации</div>
                                    <div className="font-mono text-sm text-slate-900 dark:text-white">
                                        {ticket.certificate?.qrCode || `verify-${ticket.id}`}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-2">
                                        <Hash className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">QR-код</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        {ticket.certificate?.pdfUrl && (
                            <Link
                                href={ticket.certificate.pdfUrl}
                                target="_blank"
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center space-x-2"
                            >
                                <Download className="h-4 w-4" />
                                <span>Скачать PDF</span>
                            </Link>
                        )}
                        <button
                            onClick={() => copyToClipboard(window.location.href)}
                            className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-medium inline-flex items-center justify-center space-x-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    <span>Скопировано</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    <span>Копировать ссылку</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-center space-x-6 mb-4">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Защищено блокчейном</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Award className="h-4 w-4" />
                                <span>Сертифицированные эксперты</span>
                            </div>
                        </div>
                        <p>Этот сертификат является официальным документом экспертизы BagCheck</p>
                    </div>
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 РЕЖИМ ОТСЛЕЖИВАНИЯ СТАТУСА (когда тикет в процессе)
    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
                        </Link>
                        <button
                            onClick={fetchTicket}
                            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                        >
                            Обновить
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Status Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Заявка #{ticket.id.slice(-8)}
                            </h1>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Создана: {formatDate(ticket.createdAt)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Mail className="h-4 w-4" />
                                    <span>{ticket.clientEmail}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                                <currentStatus.icon className="h-4 w-4 mr-1" />
                                {currentStatus.label}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            {currentStatus.description}
                        </p>

                        {/* Additional Photo Requests */}
                        {ticket.requests && ticket.requests.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-3">
                                    Запросы дополнительных фото:
                                </h3>
                                {ticket.requests.map((request) => (
                                    <div key={request.id} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg mb-3 last:mb-0">
                                        <p className="text-slate-700 dark:text-slate-300 mb-2">
                                            {request.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500">
                                                {formatDate(request.createdAt)} •
                                                {request.status === 'PENDING' ? ' Ожидает загрузки' : ' Выполнено'}
                                            </p>
                                            {request.status === 'PENDING' && ticket.status === 'NEEDS_MORE_PHOTOS' && (
                                                <Link
                                                    href={`/upload/additional/${ticket.id}`}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                                                >
                                                    Загрузить фото
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Progress Steps */}
                        <div className="flex items-center justify-between text-sm">
                            {Object.entries(statusConfig).map(([status, config], index) => {
                                const isCompleted = Object.keys(statusConfig).indexOf(ticket.status) >= index
                                const isCurrent = ticket.status === status

                                return (
                                    <React.Fragment key={status}>
                                        <div className="flex flex-col items-center">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                                                isCompleted
                                                    ? isCurrent
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-green-600 text-white'
                                                    : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
                                            }`}>
                                                <config.icon className="h-5 w-5" />
                                            </div>
                                            <div className={`text-center ${isCurrent ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                                                <div className="font-medium">{config.label}</div>
                                            </div>
                                        </div>
                                        {index < Object.keys(statusConfig).length - 1 && (
                                            <div className={`flex-1 h-px mx-4 ${
                                                isCompleted && !isCurrent ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'
                                            }`} />
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Images */}
                {ticket.images && ticket.images.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Загруженные фотографии ({ticket.images.length})
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {ticket.images.map((image) => (
                                <div key={image.id} className="relative group cursor-pointer">
                                    <div
                                        className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden"
                                        onClick={() => openImageModal(image)}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`Фото ${image.type === 'INITIAL' ? 'первоначальное' : 'дополнительное'}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            image.type === 'INITIAL'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        }`}>
                                            {image.type === 'INITIAL' ? 'Первоначальное' : 'Дополнительное'}
                                        </span>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatDate(image.uploadedAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={closeImageModal}
                >
                    <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Фото {selectedImage.type === 'INITIAL' ? 'первоначальное' : 'дополнительное'}
                                </h3>
                                <button
                                    onClick={closeImageModal}
                                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <img
                                src={selectedImage.url}
                                alt="Увеличенное фото"
                                className="w-full h-auto max-h-96 object-contain mx-auto"
                            />
                            <p className="text-sm text-slate-500 text-center mt-2">
                                Загружено: {formatDate(selectedImage.uploadedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}