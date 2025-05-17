import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, CheckCircle, Save } from "lucide-react";

const UserFormModal = ({ user, onClose, onSave }) => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        name: false,
        phone: false,
        email: false,
        password: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setPhone(user.phone || "");
            setEmail(user.email || "");
            setRole(user.role || "user");

            // Mark fields as touched for existing user but don't trigger validation yet
            setTouched({
                name: false,
                phone: false,
                email: false,
                password: false
            });

            // Clear any existing errors when editing a user
            setErrors({});
        }
    }, [user]);

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    // Validate phone format
    const isValidPhone = (phone) => {
        // Allow digits, spaces, dashes, plus signs, and parentheses
        const phoneRegex = /^([0-9\s\-\+\(\)]*)$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    };

    // Format phone number as user types
    const formatPhoneNumber = (value) => {
        // Strip all non-numeric characters
        const cleaned = value.replace(/\D/g, '');

        // Format based on length
        if (cleaned.length <= 3) {
            return cleaned;
        } else if (cleaned.length <= 6) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        } else if (cleaned.length <= 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}${cleaned.slice(10) ? '-' + cleaned.slice(10) : ''}`;
        }
    };

    // Handle phone input with formatting
    const handlePhoneChange = (e) => {
        const input = e.target.value;
        setPhone(input);

        // Mark as touched
        setTouched({ ...touched, phone: true });

        // Validate
        validateField('phone', input);
    };

    // Validate a single field
    const validateField = (field, value) => {
        const newErrors = { ...errors };

        // If editing user, and field value same as original, skip validation for email/phone
        if (user) {
            if (field === 'email' && value === user.email) {
                delete newErrors.email;
                setErrors(newErrors);
                return true;
            }
            if (field === 'phone' && value === user.phone) {
                delete newErrors.phone;
                setErrors(newErrors);
                return true;
            }
        }

        switch (field) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = "Name is required";
                } else {
                    delete newErrors.name;
                }
                break;

            case 'email':
                if (!value.trim()) {
                    newErrors.email = "Email is required";
                } else if (!isValidEmail(value)) {
                    newErrors.email = "Please enter a valid email address";
                } else {
                    delete newErrors.email;
                }
                break;

            case 'phone':
                if (!value.trim()) {
                    newErrors.phone = "Phone number is required";
                } else if (!isValidPhone(value)) {
                    newErrors.phone = "Please enter a valid phone number (min 10 digits)";
                } else {
                    delete newErrors.phone;
                }
                break;

            case 'password':
                if (!user && !value.trim()) {
                    newErrors.password = "Password is required for new users";
                } else if (value && value.length < 8) {
                    newErrors.password = "Password must be at least 8 characters";
                } else {
                    delete newErrors.password;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // Handle field blur events
    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });

        switch (field) {
            case 'name':
                validateField('name', name);
                break;
            case 'email':
                validateField('email', email);
                break;
            case 'phone':
                validateField('phone', phone);
                break;
            case 'password':
                validateField('password', password);
                break;
            default:
                break;
        }
    };

    // Handle input change with validation
    const handleInputChange = (e, field) => {
        const { value } = e.target;

        switch (field) {
            case 'name':
                setName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'password':
                setPassword(value);
                break;
            default:
                break;
        }

        // Mark as touched
        setTouched({ ...touched, [field]: true });

        // Validate
        validateField(field, value);
    };

    const validateForm = () => {
        // For an existing user, assume email is valid unless changed
        if (user && email === user.email) {
            delete errors.email;
        }

        // For an existing user, assume phone is valid unless changed
        if (user && phone === user.phone) {
            delete errors.phone;
        }

        // Validate all fields
        const nameValid = validateField('name', name);
        const emailValid = !errors.email;
        const phoneValid = !errors.phone;
        const passwordValid = validateField('password', password);

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            phone: true,
            password: true
        });

        return nameValid && emailValid && phoneValid && passwordValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError("");
        setIsSubmitting(true);

        // For existing users, trust the backend validation
        if (user) {
            const userData = { name, phone, email, role };

            // Only include password if it's set
            if (password) {
                userData.password = password;
            }

            // Modifikasi onSave untuk menangani error dengan callback
            onSave(userData, {
                onError: (errors) => {
                    console.error("Update errors:", errors);
                    setIsSubmitting(false);

                    // Cek error dan tampilkan
                    if (typeof errors === 'object') {
                        // Set error ke state errors jika ada
                        if (errors.email) setErrors(prev => ({ ...prev, email: errors.email }));
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: errors.phone }));
                        if (errors.name) setErrors(prev => ({ ...prev, name: errors.name }));
                        if (errors.password) setErrors(prev => ({ ...prev, password: errors.password }));

                        // Set error umum
                        if (errors.error) setFormError(errors.error);
                    } else {
                        setFormError("Failed to update user. Please try again.");
                    }
                }
            });
            return;
        }

        // For new users, validate the form
        if (validateForm()) {
            const userData = { name, phone, email, role };

            // Only include password if it's set
            if (password) {
                userData.password = password;
            }

            // Modifikasi onSave untuk menangani error dengan callback
            onSave(userData, {
                onError: (errors) => {
                    console.error("Create errors:", errors);
                    setIsSubmitting(false);

                    // Cek error dan tampilkan
                    if (typeof errors === 'object') {
                        // Set error ke state errors jika ada
                        if (errors.email) setErrors(prev => ({ ...prev, email: errors.email }));
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: errors.phone }));
                        if (errors.name) setErrors(prev => ({ ...prev, name: errors.name }));
                        if (errors.password) setErrors(prev => ({ ...prev, password: errors.password }));

                        // Set error umum
                        if (errors.error) setFormError(errors.error);
                    } else {
                        setFormError("Failed to create user. Please try again.");
                    }
                }
            });
        } else {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Determine if form is valid
    const isFormValid = () => {
        // For editing an existing user, don't block submission due to email/phone format
        if (user) {
            return name.trim() !== "";
        }

        // For new users, perform full validation
        if (!touched.name || !touched.email || !touched.phone || !touched.password) return false;

        return (
            !errors.name &&
            !errors.email &&
            !errors.phone &&
            !errors.password
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">
                        {user ? "Edit User" : "Add New User"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    {formError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                            {formError}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleInputChange(e, 'name')}
                            onBlur={() => handleBlur('name')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.name && errors.name ? "border-red-500" : touched.name && !errors.name ? "border-green-500" : "border-gray-300"
                                }`}
                        />
                        {touched.name && errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                onBlur={() => handleBlur('phone')}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.phone && errors.phone ? "border-red-500" : touched.phone && !errors.phone ? "border-green-500" : "border-gray-300"
                                    }`}
                                placeholder="123-456-7890"
                            />
                            {touched.phone && !errors.phone && (
                                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                        </div>
                        {touched.phone && errors.phone ? (
                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        ) : (
                            <p className="text-gray-500 text-xs mt-1">Format: 123-456-7890</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => handleInputChange(e, 'email')}
                                onBlur={() => handleBlur('email')}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.email && errors.email ? "border-red-500" : touched.email && !errors.email ? "border-green-500" : "border-gray-300"
                                    }`}
                                placeholder="user@example.com"
                            />
                            {touched.email && !errors.email && (
                                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                        </div>
                        {touched.email && errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            {user ? "Password (leave blank to keep current)" : "Password"}
                            {!user && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => handleInputChange(e, 'password')}
                                onBlur={() => handleBlur('password')}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.password && errors.password ? "border-red-500" : (touched.password && password && !errors.password) ? "border-green-500" : "border-gray-300"
                                    }`}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {touched.password && errors.password ? (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        ) : (
                            <p className="text-gray-500 text-xs mt-1">
                                {user ? "Leave blank to keep current password" : "Password must be at least 8 characters"}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <X className="w-4 h-4 mr-2 inline-block" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={(!isFormValid() && !user) || isSubmitting}
                            className={`px-4 py-2 rounded-md transition flex items-center ${isFormValid() || user
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-blue-300 text-white cursor-not-allowed"
                                } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {user ? "Update" : "Create"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
