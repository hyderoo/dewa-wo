import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const UserPagination = ({ pagination, onPageChange }) => {
    if (!pagination || !pagination.data || pagination.data.length === 0) return null;

    return (
        <div className="flex justify-between items-center mt-6 flex-col sm:flex-row space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500">
                Showing {pagination.from} to {pagination.to} of {pagination.total} users
            </div>
            <div className="flex space-x-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={pagination.current_page === 1}
                    className={`p-2 rounded ${pagination.current_page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        } border border-gray-300`}
                >
                    <ChevronsLeft size={18} />
                </button>
                <button
                    onClick={() => onPageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className={`p-2 rounded ${pagination.current_page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        } border border-gray-300`}
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter(page =>
                        // Show first and last pages always
                        page === 1 ||
                        page === pagination.last_page ||
                        // Show pages around current page
                        (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                    )
                    .map((page, index, array) => {
                        // Add ellipsis
                        const previousPage = array[index - 1];
                        const showEllipsis = previousPage && page - previousPage > 1;

                        return (
                            <React.Fragment key={page}>
                                {showEllipsis && (
                                    <span className="p-2 border border-gray-300 rounded bg-white text-gray-500">
                                        ...
                                    </span>
                                )}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`p-2 min-w-[40px] rounded ${pagination.current_page === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                        } border border-gray-300`}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        );
                    })}

                <button
                    onClick={() => onPageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className={`p-2 rounded ${pagination.current_page === pagination.last_page
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        } border border-gray-300`}
                >
                    <ChevronRight size={18} />
                </button>
                <button
                    onClick={() => onPageChange(pagination.last_page)}
                    disabled={pagination.current_page === pagination.last_page}
                    className={`p-2 rounded ${pagination.current_page === pagination.last_page
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        } border border-gray-300`}
                >
                    <ChevronsRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default UserPagination;
