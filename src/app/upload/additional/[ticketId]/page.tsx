// src/app/upload/additional/[ticketId]/page.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Shield, Upload, X, Check, AlertCircle, ArrowLeft, Camera, FileImage, Info, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface UploadedFile {
    file: File
    preview: string
    id: string
}

interface TicketInfo {
    id: string
    clientEmail: string
    status: string
    requests: Array<{
        id: string
        description: string
        status: string
        createdAt: string
    }>
}

export default function AdditionalPhotosPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const [ticketId, setTicketId] = useState<string>('')
    const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null)
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [uploadStep, setUploadStep] = useState<'loading' | 'upload' | 'success' | 'error'>('loading')
    const [error, setError] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        params.then(({ ticketId }) => {
            setTicketId(ticketId)
            loadTicketInfo(ticketId)
        })
    }, [params])

    const loadTicketInfo = async (id: string) => {
        try {
            setIsLoading(true)
            console.log('📋 Загружаем информацию о тикете:', id)

            const response = await fetch(`/api/tickets/${id}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Тикет не найден')
            }

            console.log('📄 Данные тикета:', data.data)

            if (data.data.status !== 'NEEDS_MORE_PHOTOS') {
                setError('Этот тикет не ожидает дополнительных фотографий')
                setUploadStep('error')
                return
            }

            setTicketInfo(data.data)
            setUploadStep('upload')

        } catch (error) {
            console.error('❌ Ошибка загрузки тикета:', error)
            setError(error instanceof Error ? error.message : 'Не удалось загрузить информацию о тикете')
            setUploadStep('error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFiles = Array.from(e.dataTransfer.files)
        processFiles(droppedFiles)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            processFiles(selectedFiles)
        }
    }

    const processFiles = (newFiles: File[]) => {
        const imageFiles = newFiles.filter(file => file.type.startsWith('image/'))

        if (imageFiles.length === 0) {
            alert('Пожалуйста, выберите файлы изображений')
            return
        }

        if (files.length + imageFiles.length > 10) {
            alert('Максимум 10 файлов')
            return
        }

        imageFiles.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert(`Файл ${file.name} слишком большой. Максимум 5MB.`)
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                const newFile: UploadedFile = {
                    file,
                    preview: e.target?.result as string,
                    id: Math.random().toString(36).substr(2, 9)
                }

                setFiles(prev => [...prev, newFile])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(file => file.id !== id))
    }

    const handleSubmit = async () => {
        if (files.length === 0) {
            alert('Пожалуйста, выберите хотя бы одну фотографию')
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()

            // Добавляем все файлы в FormData
            files.forEach((fileObj, index) => {
                formData.append(`file_${index}`, fileObj.file)
            })

            console.log('🚀 Отправляем дополнительные фото для тикета:', ticketId)

            // ИСПРАВЛЕНО: Используем правильный endpoint
            const response = await fetch(`/api/tickets/${ticketId}/additional-photos`, {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Ошибка загрузки фотографий')
            }

            console.log('✅ Дополнительные фото загружены:', result)
            setUploadStep('success')

        } catch (error) {
            console.error('❌ Ошибка загрузки:', error)
            alert('Произошла ошибка при загрузке. Попробуйте еще раз.')
        } finally {
            setIsUploading(false)
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

    if (uploadStep === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Загрузка информации о заявке...</p>
                </div>
            </div>
        )
    }

    if (uploadStep === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Ошибка</h1>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        На главную
                    </Link>
                </div>
            </div>
        )
    }

    if (uploadStep === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Фотографии загружены!</h1>
                    <p className="text-slate-600 mb-6">
                        Ваши дополнительные фотографии успешно загружены.
                        Эксперт продолжит проверку в ближайшее время.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-slate-900">BagCheck</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Дополнительные фотографии
                    </h1>
                    <p className="text-slate-600">
                        Заявка <code className="bg-slate-100 px-2 py-1 rounded text-sm">{ticketId}</code>
                    </p>
                </div>

                {/* Информация о запросе */}
                {ticketInfo && ticketInfo.requests.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                        <div className="flex items-start space-x-3">
                            <Info className="h-6 w-6 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">Что нужно сфотографировать:</h3>
                                <p className="text-blue-800 mb-4">
                                    {ticketInfo.requests[ticketInfo.requests.length - 1].description}
                                </p>
                                <div className="text-sm text-blue-600">
                                    Запрос от {formatDate(ticketInfo.requests[ticketInfo.requests.length - 1].createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Area */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                            isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <Camera className="h-8 w-8 text-blue-600" />
                        </div>

                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Загрузите дополнительные фотографии
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Перетащите файлы сюда или нажмите для выбора
                        </p>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center space-x-2"
                        >
                            <Upload className="h-5 w-5" />
                            <span>Выбрать файлы</span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        <p className="text-sm text-slate-500 mt-4">
                            Поддерживаются: JPG, PNG, WEBP. Максимум 10 файлов, до 5MB каждый.
                        </p>
                    </div>

                    {/* Превью загруженных файлов */}
                    {files.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                Выбранные файлы ({files.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {files.map((file) => (
                                    <div key={file.id} className="relative group">
                                        <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                                            <img
                                                src={file.preview}
                                                alt={file.file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeFile(file.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <p className="text-xs text-slate-500 mt-1 truncate">
                                            {file.file.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Кнопка отправки */}
                    {files.length > 0 && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleSubmit}
                                disabled={isUploading}
                                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center space-x-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Загрузка...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-5 w-5" />
                                        <span>Отправить фотографии</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}