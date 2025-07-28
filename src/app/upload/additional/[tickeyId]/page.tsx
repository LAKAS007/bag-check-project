// src/app/upload/additional/[ticketId]/page.tsx - Страница загрузки дополнительных фото
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Shield, Upload, X, Check, AlertCircle, ArrowLeft, Camera, FileImage, Info } from 'lucide-react'
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
    photoRequests: Array<{
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
            const response = await fetch(`/api/tickets/${id}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Тикет не найден')
            }

            if (data.data.status !== 'NEEDS_MORE_PHOTOS') {
                setError('Этот тикет не ожидает дополнительных фотографий')
                setUploadStep('error')
                return
            }

            setTicketInfo(data.data)
            setUploadStep('upload')

        } catch (error) {
            console.error('Ошибка загрузки тикета:', error)
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

        imageFiles.forEach(file => {
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (uploadStep === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Загружаем информацию о заявке...</p>
                </div>
            </div>
        )
    }

    if (uploadStep === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold text-slate-900">BagCheck</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="max-w-2xl mx-auto px-4 py-20">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">Ошибка</h1>
                        <p className="text-lg text-slate-600 mb-8">{error}</p>
                        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            На главную
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (uploadStep === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold text-slate-900">BagCheck</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="max-w-2xl mx-auto px-4 py-20">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">
                            Фотографии отправлены!
                        </h1>
                        <p className="text-lg text-slate-600 mb-8">
                            Спасибо! Мы получили дополнительные фотографии. Наш эксперт продолжит проверку и вы получите результат в ближайшее время.
                        </p>
                        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                            <div className="text-sm text-slate-500 mb-2">Номер заявки</div>
                            <div className="text-2xl font-bold text-blue-600">{ticketId}</div>
                        </div>
                        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            На главную
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
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
                {ticketInfo && ticketInfo.photoRequests.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                        <div className="flex items-start space-x-3">
                            <Info className="h-6 w-6 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">Что нужно сфотографировать:</h3>
                                <p className="text-blue-800 mb-4">
                                    {ticketInfo.photoRequests[ticketInfo.photoRequests.length - 1].description}
                                </p>
                                <div className="text-sm text-blue-600">
                                    Запрос от {formatDate(ticketInfo.photoRequests[ticketInfo.photoRequests.length - 1].createdAt)}
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

                    {/* Uploaded Files */}
                    {files.length > 0 && (
                        <div className="mt-8">
                            <h4 className="font-semibold text-slate-900 mb-4">
                                Выбранные файлы ({files.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {files.map((file) => (
                                    <div key={file.id} className="relative group">
                                        <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                                            <img
                                                src={file.preview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeFile(file.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="mt-2">
                                            <div className="text-sm font-medium text-slate-900 truncate">
                                                {file.file.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {formatFileSize(file.file.size)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isUploading}
                                    className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Загружаем...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5" />
                                            <span>Отправить фотографии</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setFiles([])}
                                    className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl hover:border-red-500 hover:text-red-600 transition-colors"
                                >
                                    Очистить все
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tips */}
                <div className="bg-slate-50 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                        <FileImage className="h-5 w-5 text-slate-600" />
                        <span>Советы для качественных фотографий</span>
                    </h4>
                    <ul className="space-y-2 text-slate-600">
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Используйте хорошее естественное или яркое искусственное освещение</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Держите камеру устойчиво, избегайте размытых снимков</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Фотографируйте именно те элементы, которые указал эксперт</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>При необходимости сделайте несколько ракурсов одного элемента</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}