'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Eye, Clock, CheckCircle, AlertCircle, XCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Ticket {
    id: string;
    status: 'PENDING' | 'NEEDS_MORE_PHOTOS' | 'IN_REVIEW' | 'COMPLETED';
    result?: 'AUTHENTIC' | 'FAKE';
    comment?: string;
    clientEmail: string;
    createdAt: string;
    updatedAt: string;
    images: Array<{
        id: string;
        url: string;
        type: 'INITIAL' | 'ADDITIONAL';
    }>;
    _count: {
        images: number;
        requests: number;
    };
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
};

const resultConfig = {
    AUTHENTIC: {
        label: 'Подлинная',
        color: 'text-green-600 dark:text-green-400'
    },
    FAKE: {
        label: 'Подделка',
        color: 'text-red-600 dark:text-red-400'
    }
};

export default function Dashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await fetch('/api/tickets');
            const data = await response.json();

            if (data.success) {
                setTickets(data.tickets);
            } else {
                console.error('Failed to fetch tickets');
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTicketAge = (createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Только что';
        if (diffHours < 24) return `${diffHours}ч назад`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}д назад`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-300">Загрузка тикетов...</p>
                </div>
            </div>
        );
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
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const count = tickets.filter(t => t.status === status).length;
                        const Icon = config.icon;

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
                        );
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
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredTickets.map((ticket) => {
                                    const statusInfo = statusConfig[ticket.status];
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {ticket.id.slice(0, 8)}...
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {getTicketAge(ticket.createdAt)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900 dark:text-white">
                                                    {ticket.clientEmail}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                          </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {ticket.result ? (
                                                    <span className={`text-sm font-medium ${resultConfig[ticket.result].color}`}>
                              {resultConfig[ticket.result].label}
                            </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">—</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex -space-x-2">
                                                        {ticket.images.slice(0, 3).map((image, idx) => (
                                                            <img
                                                                key={image.id}
                                                                src={image.url}
                                                                alt={`Photo ${idx + 1}`}
                                                                className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                              {ticket._count.images}
                            </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900 dark:text-white">
                                                    {formatDate(ticket.createdAt)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/dashboard/${ticket.id}`}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    Открыть
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}