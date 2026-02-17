
import { useState, useEffect } from 'react';
import { FileText, Download, Upload, Search, Filter, MoreVertical, File, Loader2, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import DatePicker from '@/components/ui/DatePicker';
import { useLanguage } from '@/i18n/LanguageContext';
import api from '@/services/api';
import { format } from 'date-fns';

export default function Documents() {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [documents, setDocuments] = useState<any[]>([]);

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        document_type: 'Invoice',
        reference_number: '',
        issuing_authority: '',
        expiry_date: '',
        file: null as File | null
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await api.get('/documents');
            setDocuments(response.data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.file) {
            alert('Please select a file');
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append('file', formData.file);
        data.append('document_type', formData.document_type);
        data.append('reference_number', formData.reference_number);
        data.append('issuing_authority', formData.issuing_authority);
        if (formData.expiry_date) data.append('expiry_date', formData.expiry_date);

        try {
            const response = await api.post('/documents', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDocuments([response.data, ...documents]);
            setIsUploadModalOpen(false);
            setFormData({
                document_type: 'Invoice',
                reference_number: '',
                issuing_authority: '',
                expiry_date: '',
                file: null
            });
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (doc: any) => {
        setDocToDelete(doc);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!docToDelete) return;
        setDeleting(true);
        try {
            await api.delete(`/documents/${docToDelete.id}`);
            setDocuments(documents.filter(d => d.id !== docToDelete.id));
            setIsDeleteModalOpen(false);
            setDocToDelete(null);
        } catch (error) {
            console.error('Failed to delete document', error);
            alert('Failed to delete document');
        } finally {
            setDeleting(false);
        }
    };

    const handleView = (doc: any) => {
        // In this environment, dashboard is 3001, backend is 3000.
        // We need to point to the backend URL for the file.
        const backendUrl = 'http://localhost:3000';
        const url = doc.file_url.startsWith('http') ? doc.file_url : `${backendUrl}${doc.file_url}`;
        window.open(url, '_blank');
    };

    const handleDownload = async (doc: any) => {
        try {
            const backendUrl = 'http://localhost:3000';
            const url = doc.file_url.startsWith('http') ? doc.file_url : `${backendUrl}${doc.file_url}`;

            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            // Extract filename from path or use reference number
            const filename = doc.file_url.split('/').pop() || `document-${doc.reference_number}.pdf`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
            alert('Failed to download document');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                        {t('nav.documents')} <span className="text-blue-600 italic">Vault</span>
                    </h1>
                    <p className="text-gray-500 font-bold mt-2">Manage your freight documents and compliance files.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-600/30 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
                >
                    <Upload size={20} /> Upload New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-6 md:col-span-1 space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Filter size={14} /> Categories
                    </h4>
                    <div className="space-y-1">
                        {['All Documents', 'Invoices', 'Bill of Lading', 'Customs', 'Insurance', 'Contracts'].map((cat, i) => (
                            <button key={i} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${i === 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </GlassCard>

                <div className="md:col-span-3 space-y-6">
                    <GlassCard className="p-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by document name, reference, or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-transparent font-bold focus:ring-0"
                            />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-0 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">File Name</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="p-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {documents.filter(doc =>
                                    doc.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-gray-500 font-bold">
                                            No documents found.
                                        </td>
                                    </tr>
                                ) : (
                                    documents.filter(doc =>
                                        doc.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((doc) => (
                                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                                        <File size={20} />
                                                    </div>
                                                    <span className="font-bold text-sm">{doc.reference_number || 'Unnamed Doc'}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-bold text-gray-500">{doc.document_type}</td>
                                            <td className="p-6 text-sm font-bold text-gray-500">
                                                {format(new Date(doc.created_at), 'dd MMM yyyy')}
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${doc.is_verified ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {doc.is_verified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleView(doc)}
                                                        className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 rounded-lg transition-colors"
                                                        title="View Document"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(doc)}
                                                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 rounded-lg transition-colors"
                                                        title="Download Document"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(doc)}
                                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 rounded-lg transition-colors"
                                                        title="Delete Document"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </GlassCard>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && docToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-8"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mb-2">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black">Delete Document?</h2>
                            <p className="text-gray-500 font-medium">
                                Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">{docToDelete.reference_number}</span>? This action cannot be undone.
                            </p>

                            <div className="flex gap-3 w-full mt-6">
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                                >
                                    {deleting ? <Loader2 className="animate-spin" size={18} /> : 'Delete'}
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 font-bold py-3 rounded-xl"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
                    >
                        <h2 className="text-2xl font-black mb-6">Upload Document</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Document Type</label>
                                <select
                                    value={formData.document_type}
                                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                >
                                    <option value="Invoice">Invoice</option>
                                    <option value="BOL">Bill of Lading</option>
                                    <option value="Insurance">Insurance</option>
                                    <option value="Customs">Customs Declaration</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Reference Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., INV-001"
                                    value={formData.reference_number}
                                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Issuing Authority</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Company Name"
                                    value={formData.issuing_authority}
                                    onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                />
                            </div>

                            <div>
                                <DatePicker
                                    label="Expiry Date (Optional)"
                                    selected={formData.expiry_date ? new Date(formData.expiry_date) : null}
                                    onChange={(date: Date | null) => setFormData({ ...formData, expiry_date: date ? date.toISOString() : '' })}
                                    placeholderText="Select expiry date"
                                    minDate={new Date()}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">File</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
