// src/app/verify-certificate/[id]/page.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ для Next.js 15
'use client'

import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, Calendar, Mail, Hash, Download, Loader2, AlertTriangle, Eye, Share2, Copy, Check } from 'lucide-react'
import Link from 'next/link'

interface Image {
    id: string
    url: string
    type: 'INITIAL' | 'ADDITIONAL'
    uploadedAt: string
}

interface Certificate {
    id: string
    pdfUrl: string
    qrCode: string
    createdAt: string
    ticket: {
        id: string
        result: 'AUTHENTIC' | 'FAKE'
        comment: string
        clientEmail: string
        createdAt: string
        updatedAt: string
        images: Image[]
    }
}

// ИСПРАВЛЕНИЕ: params теперь Promise в Next.js 15
export default function CertificateVerificationPage({ params }: { params: Promise<{ id: string }> }) {
    const [certificate, setCertificate] = useState<Certificate | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<Image | null>(null)
    const [copied, setCopied] = useState(false)
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
            fetchCertificate()
        }
    }, [ticketId])

    const fetchCertificate = async () => {
        if (!ticketId) return

        try {
            setLoading(true)
            const response = await fetch(`/api/verify/${ticketId}`)
            const data = await response.json()

            if (data.success) {
                setCertificate(data.certificate)
            } else {
                setError(data.error || 'Сертификат не найден')
            }
        } catch (err) {
            setError('Ошибка при загрузке данных')
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

    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Сертификат подлинности BagCheck',
                    text: 'Проверка сертификата подлинности дизайнерской сумки',
                    url: window.location.href
                })
            } catch (err) {
                console.error('Share failed:', err)
                handleCopyLink()
            }
        } else {
            handleCopyLink()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300 mb-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-lg">Проверяем сертификат...</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Это может занять несколько секунд
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                {/* Header */}
                <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/public" className="flex items-center space-x-2">
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
                            Сертификат не найден
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 mb-8">
                            {error}
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/public"
                                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                На главную
                            </Link>
                            <Link
                                href="/upload"
                                className="block w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
                            >
                                Создать новую заявку
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!certificate) return null

    const isAuthentic = certificate.ticket.result === 'AUTHENTIC'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/public" className="flex items-center space-x-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
                        </Link>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-600 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-600">Скопировано</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">Поделиться</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Verification Badge */}
                <div className="text-center mb-12">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        isAuthentic
                            ? 'bg-green-100 dark:bg-green-900/20'
                            : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                        {isAuthentic ? (
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        ) : (
                            <XCircle className="w-10 h-10 text-red-600" />
                        )}
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {isAuthentic ? 'Сертификат подлинности' : 'Результат экспертизы'}
                    </h1>

                    <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                        isAuthentic
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                        {isAuthentic ? '✓ Подлинная сумка' : '✗ Подделка'}
                    </div>

                    {isAuthentic && (
                        <p className="text-slate-600 dark:text-slate-300 mt-4">
                            Данный товар прошел экспертную проверку и подтвержден как подлинный
                        </p>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Левая колонка - Информация о сертификате */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Основная информация */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Информация о проверке
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-start text-sm">
                                    <Hash className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                                    <div>
                                        <span className="text-slate-600 dark:text-slate-300 block">ID заявки:</span>
                                        <span className="font-mono text-slate-900 dark:text-white">
                      {certificate.ticket.id}
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-start text-sm">
                                    <Calendar className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                                    <div>
                                        <span className="text-slate-600 dark:text-slate-300 block">Дата проверки:</span>
                                        <span className="text-slate-900 dark:text-white">
                      {formatDateShort(certificate.createdAt)}
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-start text-sm">
                                    <Mail className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                                    <div>
                                        <span className="text-slate-600 dark:text-slate-300 block">Клиент:</span>
                                        <span className="text-slate-900 dark:text-white">
                      {certificate.ticket.clientEmail.replace(/(.{3}).*(@.*)/, '$1***$2')}
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Действия */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Документы
                            </h3>

                            {isAuthentic ? (
                                <div className="space-y-3">
                                    <a
                                        href={certificate.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Скачать PDF сертификат
                                    </a>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        Официальный документ с QR-кодом для верификации
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-medium text-orange-800 dark:text-orange-400">
                                                Сертификат не выдан
                                            </h4>
                                            <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                                                Товар не прошел проверку подлинности
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Trust indicators */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Гарантии качества
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                                    <span className="text-slate-700 dark:text-slate-300">Экспертная проверка</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                                    <span className="text-slate-700 dark:text-slate-300">Защищенный QR-код</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                                    <span className="text-slate-700 dark:text-slate-300">Официальный документ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка - Фотографии и экспертное заключение */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Экспертное заключение */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                Экспертное заключение
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Результат:
                  </span>
                                    <span className={`text-lg font-bold ${
                                        isAuthentic
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                    {isAuthentic ? 'Подлинная' : 'Подделка'}
                  </span>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
                                        Комментарий эксперта:
                                    </h4>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {certificate.ticket.comment}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Проверка выполнена: {formatDate(certificate.ticket.updatedAt)}
                                </div>
                            </div>
                        </div>

                        {/* Галерея фотографий */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Проверенные фотографии ({certificate.ticket.images.length})
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
                                {certificate.ticket.images.map((image) => (
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

                            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                Все фотографии были проанализированы экспертом
                            </div>
                        </div>
                    </div>
                </div>

                {/* Дополнительная информация */}
                <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start space-x-4">
                        <Shield className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-2">
                                О сертификате BagCheck
                            </h3>
                            <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
                                Данный сертификат подтверждает, что товар прошел профессиональную экспертизу
                                подлинности специалистами BagCheck. QR-код позволяет в любой момент проверить
                                подлинность данного документа. Сертификат имеет юридическую силу и может
                                использоваться при продаже товара.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-4 text-xs text-blue-700 dark:text-blue-400">
                                <Link href="/public" className="hover:underline">О компании</Link>
                                <Link href="/contact" className="hover:underline">Контакты</Link>
                                <Link href="/legal" className="hover:underline">Правовая информация</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}