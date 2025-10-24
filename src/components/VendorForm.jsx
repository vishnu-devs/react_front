import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitVendorRequest } from '../api/vendor';
import { toast } from 'react-hot-toast';

const VendorForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        business_type: '',
        gst_number: '',
        pan_number: '',
        business_address: '',
        city: '',
        state: '',
        pincode: '',
        contact_person_name: '',
        contact_person_phone: '',
        alternate_phone: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        branch_name: '',
        gst_certificate: null,
        pan_card: null,
        business_license: null,
        bank_statement: null
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            await submitVendorRequest(data);
            toast.success('Vendor request submitted successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Vendor request submission failed:', error);
            toast.error(error.message || 'Failed to submit vendor request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-6">Vendor Registration Form</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Business Type</label>
                            <select
                                name="business_type"
                                value={formData.business_type}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            >
                                <option value="">Select Business Type</option>
                                <option value="Proprietorship">Proprietorship</option>
                                <option value="Partnership">Partnership</option>
                                <option value="LLC">LLC</option>
                                <option value="Private Limited">Private Limited</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">GST Number</label>
                            <input
                                type="text"
                                name="gst_number"
                                value={formData.gst_number}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">PAN Number</label>
                            <input
                                type="text"
                                name="pan_number"
                                value={formData.pan_number}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium mb-4">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Business Address</label>
                            <textarea
                                name="business_address"
                                value={formData.business_address}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                rows="3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Person Name</label>
                            <input
                                type="text"
                                name="contact_person_name"
                                value={formData.contact_person_name}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Person Phone</label>
                            <input
                                type="tel"
                                name="contact_person_phone"
                                value={formData.contact_person_phone}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Alternate Phone (Optional)</label>
                            <input
                                type="tel"
                                name="alternate_phone"
                                value={formData.alternate_phone}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Bank Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium mb-4">Bank Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Bank Name</label>
                            <input
                                type="text"
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Account Number</label>
                            <input
                                type="text"
                                name="account_number"
                                value={formData.account_number}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">IFSC Code</label>
                            <input
                                type="text"
                                name="ifsc_code"
                                value={formData.ifsc_code}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Branch Name</label>
                            <input
                                type="text"
                                name="branch_name"
                                value={formData.branch_name}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Document Upload */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium mb-4">Document Upload</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">GST Certificate</label>
                            <input
                                type="file"
                                name="gst_certificate"
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">PAN Card</label>
                            <input
                                type="file"
                                name="pan_card"
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Business License</label>
                            <input
                                type="file"
                                name="business_license"
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Bank Statement</label>
                            <input
                                type="file"
                                name="bank_statement"
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VendorForm;