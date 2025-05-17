import React, { useState, useCallback, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { router, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { debounce } from 'lodash';

// Import components
import Toast from "@/Components/Toast";
import UserFilterBar from "./UserFilterBar";
import UserActiveFilters from "./UserActiveFilters";
import UserTableHeader from "./UserTableHeader";
import UserTableRow from "./UserTableRow";
import UserPagination from "./UserPagination";
import EmptyUsersState from "./EmptyUsersState";
import { UserFormModal } from "./UserModals";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ResetPasswordModal from "./ResetPasswordModal";

const UserManagementContent = () => {
    const { users, filters, toast } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [perPage, setPerPage] = useState(filters?.perPage || 10);
    const [sortField, setSortField] = useState(filters?.sortField || "name");
    const [sortDirection, setSortDirection] = useState(filters?.sortDirection || "asc");
    const [roleFilter, setRoleFilter] = useState(filters?.role || "all");

    // Check for flash messages on page load
    useEffect(() => {
        if (toast) {
            setToastMessage({ type: toast.type, message: toast.message });
            setShowToast(true);

            // Auto-close toast after 5 seconds
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Initialize filters from props
    useEffect(() => {
        if (filters) {
            setSearchTerm(filters.search || "");
            setPerPage(filters.perPage || 10);
            setSortField(filters.sortField || "name");
            setSortDirection(filters.sortDirection || "asc");
            setRoleFilter(filters.role || "all");
        }
    }, [filters]);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((term) => {
            router.get(
                route('admin.users'),
                { search: term, perPage, sortField, sortDirection, role: roleFilter },
                { preserveState: true, replace: true }
            );
        }, 500),
        [perPage, sortField, sortDirection, roleFilter]
    );

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Handle per page change
    const handlePerPageChange = (e) => {
        const value = parseInt(e.target.value);
        setPerPage(value);
        router.get(
            route('admin.users'),
            { search: searchTerm, perPage: value, sortField, sortDirection, role: roleFilter },
            { preserveState: true }
        );
    };

    // Handle role filter change
    const handleRoleFilterChange = (role) => {
        setRoleFilter(role);
        router.get(
            route('admin.users'),
            { search: searchTerm, perPage, sortField, sortDirection, role },
            { preserveState: true }
        );
    };

    // Handle sorting
    const handleSort = (field) => {
        const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        router.get(
            route('admin.users'),
            { search: searchTerm, perPage, sortField: field, sortDirection: direction, role: roleFilter },
            { preserveState: true }
        );
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("");
        setSortField("name");
        setSortDirection("asc");
        setRoleFilter("all");
        router.get(
            route('admin.users'),
            {
                search: "",
                perPage,
                sortField: "name",
                sortDirection: "asc",
                role: "all"
            },
            { preserveState: true }
        );
    };

    // Handle pagination navigation
    const goToPage = (page) => {
        router.get(route('admin.users', {
            page,
            search: searchTerm,
            perPage,
            sortField,
            sortDirection,
            role: roleFilter
        }), {}, { preserveState: true });
    };

    const handleAddUser = useCallback(() => {
        setCurrentUser(null);
        setIsModalOpen(true);
    }, []);

    const handleEditUser = useCallback((user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    }, []);

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleResetPassword = useCallback((userId) => {
        setResetPasswordUserId(userId);
    }, []);

    const handleSaveUser = useCallback((userData, callbacks = {}) => {
        const formData = new FormData();

        // Add all form fields to FormData
        Object.keys(userData).forEach(key => {
            formData.append(key, userData[key]);
        });

        if (currentUser) {
            // Add method spoofing for updates
            formData.append('_method', 'PUT');

            // Edit existing user
            router.post(route('admin.users.update', currentUser.id), formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (callbacks.onSuccess) callbacks.onSuccess();
                },
                onError: (errors) => {
                    console.error("Update errors:", errors);
                    if (callbacks.onError) callbacks.onError(errors);
                },
                preserveScroll: true,
                forceFormData: true
            });
        } else {
            // Add new user
            router.post(route('admin.users.store'), formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (callbacks.onSuccess) callbacks.onSuccess();
                },
                onError: (errors) => {
                    console.error("Create errors:", errors);
                    if (callbacks.onError) callbacks.onError(errors);
                },
                preserveScroll: true,
                forceFormData: true
            });
        }
    }, [currentUser]);

    const handleSubmitPasswordReset = useCallback((password) => {
        router.put(route('admin.users.reset-password', resetPasswordUserId), { password }, {
            onSuccess: () => {
                setResetPasswordUserId(null);
            },
            onError: () => {
                setToastMessage({ type: "error", message: "Failed to reset password" });
                setShowToast(true);
                setResetPasswordUserId(null);
            },
            preserveScroll: true,
        });
    }, [resetPasswordUserId]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-600">
            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 md:p-8">
                        <h1 className="font-cormorant text-3xl md:text-4xl font-light text-white text-center tracking-wide">
                            User Management
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Manage user accounts, permissions, and access
                        </p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                            <UserFilterBar
                                searchTerm={searchTerm}
                                onSearchChange={handleSearchChange}
                                perPage={perPage}
                                onPerPageChange={handlePerPageChange}
                                roleFilter={roleFilter}
                                onRoleFilterChange={handleRoleFilterChange}
                                onResetFilters={resetFilters}
                            />

                            {/* Add User Button */}
                            <button
                                onClick={handleAddUser}
                                className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                <Plus className="w-4 h-4 mr-2 inline-block" />
                                Add New User
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    <UserActiveFilters
                        roleFilter={roleFilter}
                        searchTerm={searchTerm}
                        onClearRoleFilter={() => handleRoleFilterChange('all')}
                        onClearSearchTerm={() => {
                            setSearchTerm('');
                            debouncedSearch('');
                        }}
                        onClearAllFilters={resetFilters}
                    />

                    {/* User List */}
                    <div className="p-6 md:p-8">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <UserTableHeader
                                    sortField={sortField}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                                <tbody className="divide-y divide-gray-200">
                                    {users.data && users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <UserTableRow
                                                key={user.id}
                                                user={user}
                                                onEdit={handleEditUser}
                                                onResetPassword={() => handleResetPassword(user.id)}
                                                onDelete={openDeleteModal}
                                            />
                                        ))
                                    ) : (
                                        <EmptyUsersState
                                            hasFilters={searchTerm || roleFilter !== 'all'}
                                        />
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <UserPagination
                            pagination={users}
                            onPageChange={goToPage}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isModalOpen && (
                <UserFormModal
                    user={currentUser}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveUser}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                user={userToDelete}
            />

            {resetPasswordUserId && (
                <ResetPasswordModal
                    userId={resetPasswordUserId}
                    onConfirm={handleSubmitPasswordReset}
                    onCancel={() => setResetPasswordUserId(null)}
                />
            )}
        </div>
    );
};

export default UserManagementContent;
