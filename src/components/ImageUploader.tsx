'use client';

import React, { useState, useCallback } from 'react';
import { uploadImageAction } from '@/app/actions/upload';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";

interface ImageUploaderProps {
    onUploadSuccess?: (url: string) => void;
    label?: string;
}

export function ImageUploader({ onUploadSuccess, label = "Add Photo" }: ImageUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successUrl, setSuccessUrl] = useState<string | null>(null);

    const handleFile = (selectedFile: File) => {
        setError(null);
        setSuccessUrl(null);

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File is too large (max 5MB)");
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
            setError("Only JPG, PNG and WebP are supported");
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFile(droppedFile);
    }, []);

    const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) handleFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadImageAction(formData);

        setUploading(false);

        if (result.success && result.url) {
            setSuccessUrl(result.url);
            if (onUploadSuccess) onUploadSuccess(result.url);
        } else {
            setError(result.error || "Upload failed");
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setSuccessUrl(null);
        setError(null);
    };

    return (
        <div className="w-full space-y-4">
            <AnimatePresence mode="wait">
                {!preview && !successUrl ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 bg-white/5 hover:bg-white/10 transition-all cursor-pointer relative"
                    >
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={onSelect}
                            accept="image/*"
                        />
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Upload size={24} />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-medium">{label}</p>
                            <p className="text-white/40 text-sm">Drag & drop or click to browse</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10"
                    >
                        {preview && (
                            <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex space-x-2">
                                    {!successUrl && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center space-x-2 shadow-lg cursor-pointer"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <span>Start Upload</span>
                                            )}
                                        </button>
                                    )}
                                    {successUrl && (
                                        <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium flex items-center space-x-2 border border-emerald-500/30">
                                            <CheckCircle size={16} />
                                            <span>Saved successfully!</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={reset}
                                    className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-400 text-sm flex items-center space-x-2 px-2"
                >
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    <span>{error}</span>
                </motion.p>
            )}

            {successUrl && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">Public Asset URL</span>
                    <code className="text-xs text-blue-300 break-all select-all cursor-copy">{successUrl}</code>
                </div>
            )}
        </div>
    );
}
