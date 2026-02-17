
import React, { forwardRef, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { enUS } from 'date-fns/locale';

interface DatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
    showTimeSelect?: boolean;
    dateFormat?: string;
    className?: string;
    minDate?: Date;
    label?: string;
}

const CustomInput = forwardRef(({ value, onClick, placeholder, label, className }: any, ref: any) => (
    <div className="w-full">
        {label && <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{label}</label>}
        <div
            onClick={onClick}
            ref={ref}
            className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors group ${className}`}
        >
            <span className={`font-medium ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {value || placeholder}
            </span>
            <CalendarIcon size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
    </div>
));

const PORTAL_ID = 'datepicker-portal';

const DatePicker: React.FC<DatePickerProps> = ({
    selected,
    onChange,
    placeholderText = "Select date",
    showTimeSelect = false,
    dateFormat = showTimeSelect ? "MMM d, yyyy h:mm aa" : "MMM d, yyyy",
    className,
    minDate,
    label
}) => {
    // Create portal container on mount so the calendar renders at body level
    useEffect(() => {
        if (!document.getElementById(PORTAL_ID)) {
            const el = document.createElement('div');
            el.id = PORTAL_ID;
            document.body.appendChild(el);
        }
    }, []);

    return (
        <div className="relative">
            <style>{`
                #${PORTAL_ID} {
                    position: relative;
                    z-index: 99999;
                }
                #${PORTAL_ID} .react-datepicker-popper {
                    z-index: 99999 !important;
                }
                .react-datepicker {
                    font-family: inherit;
                    background-color: rgb(255 255 255);
                    border: 1px solid rgb(229 231 235);
                    border-radius: 1rem;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                    overflow: hidden;
                }
                .dark .react-datepicker {
                    background-color: rgb(17 24 39);
                    border-color: rgb(55 65 81);
                    color: white;
                }
                .react-datepicker__header {
                    background-color: transparent;
                    border-bottom: 1px solid rgb(229 231 235);
                    padding-top: 1rem;
                }
                .dark .react-datepicker__header {
                    border-bottom-color: rgb(55 65 81);
                }
                .react-datepicker__current-month {
                    font-weight: 800;
                    color: rgb(17 24 39);
                    margin-bottom: 0.5rem;
                }
                .dark .react-datepicker__current-month {
                    color: white;
                }
                .react-datepicker__day-name {
                    color: rgb(107 114 128);
                    font-weight: 600;
                }
                .react-datepicker__day {
                    font-weight: 500;
                    margin: 0.2rem;
                    border-radius: 0.5rem;
                    color: rgb(55 65 81);
                }
                .dark .react-datepicker__day {
                    color: rgb(209 213 219);
                }
                .react-datepicker__day:hover {
                    background-color: rgb(239 246 255);
                    color: rgb(37 99 235);
                }
                .dark .react-datepicker__day:hover {
                    background-color: rgb(30 58 138);
                    color: white;
                }
                .react-datepicker__day--selected {
                    background-color: rgb(37 99 235) !important;
                    color: white !important;
                    font-weight: 700;
                }
                .react-datepicker__day--keyboard-selected {
                    background-color: rgb(219 234 254);
                    color: rgb(37 99 235);
                }
                .dark .react-datepicker__day--keyboard-selected {
                    background-color: rgb(30 58 138);
                    color: white;
                }
                .react-datepicker__time-container {
                    border-left: 1px solid rgb(229 231 235);
                }
                .dark .react-datepicker__time-container {
                    border-left-color: rgb(55 65 81);
                }
                .react-datepicker__time-container .react-datepicker__time {
                    background-color: transparent;
                }
                .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
                    height: auto;
                    padding: 8px 10px;
                }
                .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
                    background-color: rgb(239 246 255);
                    color: rgb(37 99 235);
                }
                .dark .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
                    background-color: rgb(30 58 138);
                    color: white;
                }
                .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
                    background-color: rgb(37 99 235) !important;
                    color: white !important;
                }
            `}</style>
            <ReactDatePicker
                selected={selected}
                onChange={onChange}
                showTimeSelect={showTimeSelect}
                dateFormat={dateFormat}
                placeholderText={placeholderText}
                customInput={<CustomInput label={label} className={className} />}
                minDate={minDate}
                locale={enUS}
                portalId={PORTAL_ID}
            />
        </div>
    );
};

export default DatePicker;
