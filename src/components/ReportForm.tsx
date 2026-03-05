"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { ItemCategory, PostType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    MapPin,
    Camera,
    Send,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Link as LinkIcon,
    Globe,
    Cpu,
    ShieldCheck,
    Loader2,
    Zap,
    Sparkles,
    Gauge,
    Heart
} from "lucide-react";
import Image from "next/image";
import { calculateGoodwill, ItemCondition, CONDITION_MULTIPLIERS } from "@/lib/goodwillLogic";
import { Item } from "@/lib/types";
import { ImageUploader } from "@/components/ImageUploader";

const CATEGORIES: ItemCategory[] = [
    "Electronics",
    "Personal Items",
    "Pets & Animals",
    "Documents",
    "Apparel",
    "Other",
];

interface ReportFormProps {
    initialData?: Item;
    onCancel?: () => void;
    onSuccess?: () => void;
}

export default function ReportForm({ initialData, onCancel, onSuccess }: ReportFormProps) {
    const { addItem, editItem, currentUser } = useStore();
    const router = useRouter();

    const [postType, setPostType] = useState<PostType>(initialData?.type || "lost");
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [category, setCategory] = useState<ItemCategory>(initialData?.category || "Electronics");
    const [locationName, setLocationName] = useState(initialData?.locationName || "");
    const [date, setDate] = useState(initialData?.date || "");
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
    const [photoMethod, setPhotoMethod] = useState<"upload" | "url" | "web">(initialData?.photoUrl ? "url" : "upload");
    const [externalPhotoUrl, setExternalPhotoUrl] = useState(initialData?.photoUrl || "");
    const [webSearchQuery, setWebSearchQuery] = useState("");
    const [webSearchResults, setWebSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [verificationQuestion, setVerificationQuestion] = useState(initialData?.verificationQuestion || "");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [returnType, setReturnType] = useState<"community" | "thanks">("community");
    const [condition, setCondition] = useState<ItemCondition>(initialData?.condition || "Good");
    const [isUrgent, setIsUrgent] = useState(initialData?.isUrgent || false);

    if (!currentUser) {
        router.push("/login");
        return null;
    }

    const goodwill = calculateGoodwill(category, condition, isUrgent);

    const validateDate = (dateStr: string) => {
        const inputDate = new Date(dateStr);
        const now = new Date();
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(now.getMonth() - 5);

        if (inputDate > now) return "Date cannot be in the future.";
        if (inputDate < fiveMonthsAgo) return "Items lost/found more than 5 months ago cannot be reported.";
        return null;
    };

    const handleWebSearch = async () => {
        if (!webSearchQuery) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(webSearchQuery)}&per_page=6&client_id=o883JkF-vN7E2Z5RToGv9f1tL5L9E_8cT0f6U1I5k8M`);
            if (response.ok) {
                const data = await response.json();
                setWebSearchResults(data.results);
            } else {
                setWebSearchResults([
                    { id: '1', urls: { regular: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' } },
                    { id: '2', urls: { regular: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' } },
                    { id: '3', urls: { regular: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' } },
                ]);
            }
        } catch (error) {
            console.error("Web search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title || !description || !locationName || !date || (postType === "found" && !verificationQuestion)) {
            setError("Please fill in all required fields.");
            return;
        }

        const dateError = validateDate(date);
        if (dateError) {
            setError(dateError);
            return;
        }

        if (postType === "found" && !photoPreview && !externalPhotoUrl) {
            setError("A photo or image URL is mandatory for verification of found items.");
            return;
        }

        const itemPayload: any = {
            title,
            description,
            category,
            locationName,
            locationLat: 40.7128 + (Math.random() - 0.5) * 0.1,
            locationLng: -74.006 + (Math.random() - 0.5) * 0.1,
            date,
            verificationQuestion,
            condition,
            isUrgent,
            goodwillPoints: goodwill.goodwillPoints,
            photoUrl: photoMethod === "upload"
                ? (photoPreview || "")
                : (externalPhotoUrl || 'https://images.unsplash.com/photo-1532619675605-1fea6d25208b?auto=format&fit=crop&w=800&q=80'),
            isBoosted: currentUser.isVerified,
            type: postType,
        };

        if (initialData) {
            editItem(initialData.id, itemPayload);
        } else {
            addItem(itemPayload);
        }

        setSubmitted(true);
        if (onSuccess) {
            setTimeout(onSuccess, 1500);
        } else {
            setTimeout(() => router.push("/browse"), 2000);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(204,255,0,0.15)" }}
                >
                    <CheckCircle2 size={40} style={{ color: "var(--accent-green)" }} />
                </motion.div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                    {initialData ? "Report Updated!" : "Item Reported!"}
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Redirecting to browse...
                </p>
            </motion.div>
        );
    }

    const inputStyle: React.CSSProperties = {
        background: "var(--bg-hover)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-primary)",
        borderRadius: "12px",
        padding: "14px 16px",
        fontSize: "14px",
        width: "100%",
        outline: "none",
        transition: "all 0.2s",
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto space-y-8 pb-10"
        >
            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 font-medium">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            {/* Type Switcher */}
            {!initialData && (
                <div className="flex gap-4 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl">
                    {(["lost", "found"] as PostType[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setPostType(t)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${postType === t
                                ? "bg-white/[0.08] border border-white/10 text-white shadow-lg shadow-black/20"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                                }`}
                        >
                            {t === "lost" ? <AlertTriangle size={14} className={postType === "lost" ? "text-red-400" : ""} /> : <CheckCircle2 size={14} className={postType === "found" ? "text-cyan-400" : ""} />}
                            {t === "lost" ? "I Lost Something" : "I Found Something"}
                        </button>
                    ))}
                </div>
            )}

            {/* Title */}
            <div>
                <label className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                    Item Title *
                </label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. MacBook Pro 16-inch, Black Wallet..."
                    style={inputStyle}
                    required
                    className="focus:ring-2 focus:ring-[var(--primary-brand)]/20 focus:border-[var(--primary-brand)]"
                />
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                    <Calendar size={14} className="inline mr-1.5 text-[var(--text-secondary)]" />
                    Date Lost/Found *
                </label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    style={inputStyle}
                    required
                    className="focus:ring-2 focus:ring-[var(--primary-brand)]/20 focus:border-[var(--primary-brand)]"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1.5 ml-1">Must be within the last 5 months.</p>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                    Description *
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details: color, brand, distinguishing marks, contents..."
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                    required
                    className="focus:ring-2 focus:ring-[var(--primary-brand)]/20 focus:border-[var(--primary-brand)]"
                />
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                    Category *
                </label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    style={inputStyle}
                    className="focus:ring-2 focus:ring-[var(--primary-brand)]/20 focus:border-[var(--primary-brand)] appearance-none"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-[#020617] text-white">
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {/* Condition */}
            <div>
                <label className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                    <Gauge size={14} className="inline mr-1.5 text-[var(--text-secondary)]" />
                    Item Condition *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(CONDITION_MULTIPLIERS) as ItemCondition[]).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setCondition(c)}
                            className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${condition === c
                                ? "bg-[var(--primary-brand)]/10 border-[var(--primary-brand)] text-[var(--primary-brand)] shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                                : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Urgency Toggle */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 flex items-center justify-between group cursor-pointer hover:border-amber-500/30 transition-colors"
                onClick={() => setIsUrgent(!isUrgent)}>
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-colors ${isUrgent ? "bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-white/5 text-slate-500 group-hover:text-amber-400/50"}`}>
                        <Zap size={20} className={isUrgent ? "fill-amber-400" : ""} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-200">Urgency Flag</h4>
                        <p className="text-[10px] text-slate-500 font-bold">Marks item as high priority for the community</p>
                    </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${isUrgent ? "bg-amber-500" : "bg-slate-800"}`}>
                    <motion.div
                        animate={{ x: isUrgent ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                </div>
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                    <MapPin size={14} className="inline mr-1.5 text-[var(--text-secondary)]" />
                    General Location *
                </label>
                <input
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Central Park, near the fountain"
                    style={inputStyle}
                    required
                    className="focus:ring-2 focus:ring-[var(--primary-brand)]/20 focus:border-[var(--primary-brand)]"
                />
            </div>

            {/* Verification Question */}
            <div>
                <label className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                    <CheckCircle2 size={14} className="inline mr-1.5 text-[var(--text-secondary)]" />
                    Security Verification Question *
                </label>
                <textarea
                    value={verificationQuestion}
                    onChange={(e) => setVerificationQuestion(e.target.value)}
                    placeholder={postType === "found"
                        ? "Ask something only the owner would know (e.g. 'What is the lock screen wallpaper?')"
                        : "Describe a hidden detail for finders to verify (e.g. 'What color is the inner zipper lane?')"}
                    rows={2}
                    style={{ ...inputStyle, resize: "none" }}
                    required
                    className="focus:ring-2 focus:ring-[var(--primary-brand)]/20 focus:border-[var(--primary-brand)]"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1.5 ml-1">
                    {postType === "found"
                        ? "This prevents fake claims. You'll check this when someone messages you."
                        : "Helps you verify if a found item is actually yours."}
                </p>
            </div>

            {/* Found Item — Return Style (no money) */}
            {postType === "found" && (
                <div className="space-y-4">
                    <label className="block text-sm font-bold mb-2 text-[var(--text-primary)]">
                        Return Style *
                    </label>
                    <div className="flex gap-4 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl">
                        {(["community", "thanks"] as const).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setReturnType(r)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${returnType === r
                                    ? "bg-white/[0.08] border border-white/10 text-white shadow-lg shadow-black/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                                    }`}
                            >
                                {r === "community" ? <Heart size={14} className={returnType === "community" ? "text-cyan-400" : ""} /> : <Sparkles size={14} className={returnType === "thanks" ? "text-yellow-400" : ""} />}
                                {r === "community" ? "Community Return" : "Special Thanks"}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 ml-1">
                        {returnType === "community"
                            ? "Return the item as a community act of kindness — no conditions."
                            : "Let the owner express their gratitude with a personal thank-you note."}
                    </p>
                </div>
            )}

            {/* Community Points Preview */}
            <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-3">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-200">Community Impact</span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-black text-white">+{goodwill.goodwillPoints} pts</p>
                        <p className="text-[10px] text-cyan-500/80 font-bold mt-1">
                            Priority: {goodwill.priorityLevel} · Category weight: {goodwill.categoryWeight}x
                            {isUrgent && " · Urgent"}
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${goodwill.isUrgent ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {goodwill.priorityLevel}
                    </div>
                </div>
            </div>

            {/* Photo Section */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-[var(--text-primary)]">
                    <Camera size={14} className="inline mr-1.5 text-[var(--text-secondary)]" />
                    {postType === "found" ? "Proof of Finding *" : "Item Photo (Optional)"}
                </label>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setPhotoMethod("upload")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${photoMethod === "upload" ? "bg-white/10 text-white border border-white/20" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <Camera size={14} className="inline mr-1" /> Upload File
                    </button>
                    <button
                        type="button"
                        onClick={() => setPhotoMethod("url")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${photoMethod === "url" ? "bg-white/10 text-white border border-white/20" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <LinkIcon size={14} className="inline mr-1" /> Image URL
                    </button>
                    <button
                        type="button"
                        onClick={() => setPhotoMethod("web")}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${photoMethod === "web" ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "text-slate-500 hover:text-cyan-400"}`}
                    >
                        <Globe size={14} className="inline mr-1" /> Search Web
                    </button>
                </div>

                {photoMethod === "upload" ? (
                    <div className={!photoPreview && error && postType === "found" ? "border-red-500/30 bg-red-500/5 rounded-2xl p-1 border-2 border-dashed" : ""}>
                        <ImageUploader
                            onUploadSuccess={(url: string) => {
                                setPhotoPreview(url);
                            }}
                            label={postType === "found" ? "Upload Proof of Finding" : "Upload Item Photo"}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {photoMethod === "url" && (
                            <>
                                <input
                                    value={externalPhotoUrl}
                                    onChange={(e) => setExternalPhotoUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    style={inputStyle}
                                    className="focus:ring-2 focus:ring-[var(--primary-brand)]/20 focus:border-[var(--primary-brand)]"
                                />
                                {externalPhotoUrl && (
                                    <img src={externalPhotoUrl} alt="Preview" className="max-h-48 rounded-xl object-contain" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                )}
                            </>
                        )}
                        {photoMethod === "web" && (
                            <>
                                <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-xl">
                                    <input
                                        value={webSearchQuery}
                                        onChange={(e) => setWebSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleWebSearch())}
                                        placeholder="Search stock photos (e.g. 'Golden Retriever', 'Black iPhone')..."
                                        className="flex-1 bg-transparent px-3 py-2 text-xs text-white focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleWebSearch}
                                        disabled={isSearching}
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        {isSearching ? <Cpu size={12} className="animate-spin" /> : "Search"}
                                    </button>
                                </div>

                                {webSearchResults.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {webSearchResults.map((result: any) => (
                                            <button
                                                key={result.id}
                                                type="button"
                                                onClick={() => {
                                                    setExternalPhotoUrl(result.urls.regular);
                                                    setPhotoMethod("url");
                                                }}
                                                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all group"
                                            >
                                                <img src={result.urls.regular} className="w-full h-full object-cover" alt="Search result" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Select</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Verification info panel */}
            <div className="p-4 rounded-2xl bg-[rgba(204,255,0,0.04)] border border-[rgba(204,255,0,0.08)] flex gap-3">
                <ShieldCheck className="text-[var(--accent-green)] shrink-0 mt-0.5" size={18} />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    Your report is verified by the community. No payments needed — this platform is completely free.
                    All matches are powered by our location-based smart matching engine.
                </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors border border-white/10 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="flex-[3] py-4 rounded-xl bg-[var(--primary-brand)] text-black text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_30px_rgba(204,255,0,0.15)]"
                >
                    <Send size={16} />
                    {initialData ? "Update Report" : "Submit Report"}
                </button>
            </div>
        </motion.form>
    );
};
