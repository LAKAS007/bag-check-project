// src/app/dashboard/page.tsx - ПОЛНАЯ ВЕРСИЯ с автообновлением
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Search, Filter, Calendar, Mail, Hash, Eye, CheckCircle, XCircle, Clock, AlertCircle, Loader2, RefreshCw, Camera } from 'lucide-react'
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
    _count: {
        images: number
        requests: number
    }
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

export default function DashboardPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Функция для загрузки тикетов
    const fetchTickets = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }

            const response = await fetch('/api/tickets', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Отключаем кэш для получения актуальных данных
                cache: 'no-store'
            })

            const data = await response.json()

            if (data.success) {
                setTickets(data.tickets || [])
                setLastUpdated(new Date())
                console.log('✅ Тикеты обновлены:', data.tickets?.length)
            } else {
                console.error('❌ Ошибка загрузки тикетов:', data.error)
            }
        } catch (error) {
            console.error('❌ Ошибка при загрузке тикетов:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    // Инициализация
    useEffect(() => {
        fetchTickets()
    }, [fetchTickets])

    // Автообновление каждые 30 секунд
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('🔄 Автообновление тикетов...')
            fetchTickets(true)
        }, 30000) // 30 секунд

        return () => clearInterval(interval)
    }, [fetchTickets])

    // Ручное обновление
    const handleManualRefresh = () => {
        console.log('🔄 Ручное обновление тикетов...')
        fetchTickets(true)
    }

    // Фильтрация тикетов
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = searchTerm === '' ||
            ticket.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Функция для форматирования времени
    const formatTimeAgo = (createdAt: string) => {
        const now = new Date()
        const created = new Date(createdAt)
        const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))

        if (diffHours < 1) return 'Только что'
        if (diffHours < 24) return `${diffHours}ч назад`
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}д назад`
    }

    // Рендер статуса
    const renderStatus = (status: Ticket['status']) => {
        const config = statusConfig[status]
        const Icon = config.icon

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </span>
        )
    }

    // Рендер результата
    const renderResult = (result?: Ticket['result']) => {
        if (!result) return <span className="text-slate-400">—</span>

        const config = resultConfig[result]
        const Icon = config.icon

        return (
            <span className={`inline-flex items-center ${config.color}`}>
                <Icon className="h-4 w-4 mr-1" />
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-300">Загрузка тикетов...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Эксперт</span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            {lastUpdated && (
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Обновлено: {lastUpdated.toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                </span>
                            )}
                            <button
                                onClick={handleManualRefresh}
                                disabled={refreshing}
                                className="p-2 text-slate-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                                title="Обновить список"
                            >
                                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <Link
                                href="/upload"
                                className="text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                Новая заявка
                            </Link>
                            <Link
                                href="/"
                                className="text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                На главную
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Панель эксперта
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        Управление заявками на проверку подлинности
                        {refreshing && (
                            <span className="ml-2 text-blue-600">
                                <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                                Обновление...
                            </span>
                        )}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const count = tickets.filter(t => t.status === status).length
                        const Icon = config.icon

                        return (
                            <div key={status} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {config.label}
                                        </p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                            {count}
                                        </p>
                                    </div>
                                    <Icon className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Поиск по email или ID тикета..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="ALL">Все статусы</option>
                                {Object.entries(statusConfig).map(([status, config]) => (
                                    <option key={status} value={status}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                    {filteredTickets.length === 0 ? (
                        <div className="p-12 text-center">
                            <XCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                Тикеты не найдены
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                {searchTerm || statusFilter !== 'ALL'
                                    ? 'Попробуйте изменить фильтры поиска'
                                    : 'Пока нет заявок на проверку'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Тикет
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Клиент
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Статус
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Результат
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Фото
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Создан
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Hash className="h-4 w-4 text-slate-400 mr-2" />
                                                <span className="text-sm font-mono text-slate-900 dark:text-white">
                                                        {ticket.id.slice(-8)}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 text-slate-400 mr-2" />
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                        {ticket.clientEmail}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStatus(ticket.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderResult(ticket.result)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                                <Camera className="h-4 w-4 mr-1" />
                                                {ticket._count.images}
                                                {ticket._count.requests > 0 && (
                                                    <span className="ml-2 text-orange-500">
                                                            (+{ticket._count.requests} запрос)
                                                        </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                {formatTimeAgo(ticket.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/dashboard/${ticket.id}`}
                                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg transition-colors"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Открыть
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Real-time status indicator */}
                {refreshing && (
                    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Обновление данных...</span>
                    </div>
                )}
            </div>
        </div>
    )
}