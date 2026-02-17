import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import api from '@/services/api';
import {
    Search,
    MapPin,
    ArrowUpDown,
    MoreVertical,
    ChevronRight,
    Filter,
    Plus,
    Calendar,
    Truck,
    Download
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '@/components/ui/StatusBadge';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/utils/cn';

type Load = {
    id: number;
    origin_city: string;
    destination_city: string;
    quoted_rate_amount: number;
    status: string;
    pickup_earliest: string;
    equipment_code: string;
    load_number?: string;
};

const columnHelper = createColumnHelper<Load>();

export default function LoadBoard() {
    const [data, setData] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const querySearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(querySearch);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        setSearchTerm(querySearch);
        fetchLoads(querySearch);
    }, [querySearch]);

    const fetchLoads = async (search?: string) => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;

            const resp = await api.get('/loads', { params });
            setData(resp.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setSearchParams({ search: searchTerm });
        }
    };

    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => <span className="font-black text-primary-600 tabular-nums">#{info.getValue()}</span>,
        }),
        columnHelper.accessor('origin_city', {
            header: 'Route Info',
            cell: info => (
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-primary-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                            {info.row.original.origin_city}
                            <span className="text-gray-400 mx-2">→</span>
                            {info.row.original.destination_city}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Domestic Freight</span>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('equipment_code', {
            header: 'Equipment',
            cell: info => (
                <div className="flex items-center text-gray-600 dark:text-gray-300 font-bold">
                    <Truck size={16} className="mr-2 opacity-50" />
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('pickup_earliest', {
            header: 'Pickup',
            cell: info => (
                <div className="flex items-center text-gray-500 font-bold">
                    <Calendar size={16} className="mr-2 opacity-50" />
                    {format(new Date(info.getValue()), 'MMM d, yyyy')}
                </div>
            ),
        }),
        columnHelper.accessor('quoted_rate_amount', {
            header: 'Offer Rate',
            cell: info => (
                <div className="flex flex-col">
                    <span className="text-lg font-black text-emerald-600 tabular-nums">${info.getValue().toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">All-in Rate</span>
                </div>
            ),
        }),
        columnHelper.accessor('status', {
            header: 'Current Status',
            cell: info => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.display({
            id: 'actions',
            cell: () => (
                <div className="flex items-center justify-end">
                    <button className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-gray-400 hover:text-primary-600 rounded-xl transition-all">
                        <MoreVertical size={20} />
                    </button>
                    <button className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-gray-400 hover:text-primary-600 rounded-xl transition-all ml-1">
                        <ChevronRight size={20} />
                    </button>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Load Board</h2>
                    <p className="text-gray-500 font-bold mt-2">Managing {data.length} active shipment requirements</p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-6 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-black text-sm text-gray-600 dark:text-gray-300 shadow-sm hover:translate-y-[-2px] transition-all group">
                        <Download size={18} className="mr-2 text-gray-400 group-hover:text-primary-500" />
                        Export Data
                    </button>
                    <Link to="/loads/create" className="flex items-center px-6 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all">
                        <Plus size={18} className="mr-2" />
                        Post New Freight
                    </Link>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-2 bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                <div className="relative flex-1 w-full lg:max-w-xl group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchSubmit}
                        placeholder="Search by city, carrier, ID or equipment..."
                        className="w-full pl-16 pr-6 py-5 bg-transparent border-none outline-none text-gray-900 dark:text-white font-bold placeholder-gray-400"
                    />
                </div>

                <div className="flex items-center h-full space-x-2 px-2 pb-2 lg:pb-0">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={cn(
                            "flex items-center px-6 py-4 rounded-2xl font-black text-sm transition-all",
                            isFilterOpen ? "bg-primary-500 text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <Filter size={18} className="mr-2" />
                        Quick Filters
                    </button>
                    <div className="w-px h-10 bg-gray-100 dark:bg-gray-800 mx-2" />
                    <button className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl hover:text-primary-500 transition-all">
                        <ArrowUpDown size={18} />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[40px] border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-2xl"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-gray-50/50 dark:bg-gray-800/20">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30">
                            {loading ? (
                                <tr><td colSpan={7} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing Freight Data...</span>
                                    </div>
                                </td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={7} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center grayscale opacity-30">
                                        <Search size={48} className="mb-4" />
                                        <span className="text-gray-900 dark:text-white font-black text-xl tracking-tighter">No shipments found</span>
                                        <p className="text-gray-500 font-bold mt-2">Try adjusting your filters or search terms.</p>
                                    </div>
                                </td></tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <motion.tr
                                        key={row.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-colors cursor-pointer group"
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-8 py-6 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-8 py-6 bg-gray-50/30 dark:bg-gray-800/10 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">Showing <span className="text-gray-900 dark:text-white">{data.length}</span> results</span>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 text-xs font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Previous</button>
                        <button className="px-4 py-2 text-xs font-black bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">1</button>
                        <button className="px-4 py-2 text-xs font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Next</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
