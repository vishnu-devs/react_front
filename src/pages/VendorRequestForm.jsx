import { submitVendorRequest } from '../api/vendor';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function VendorRequestForm() {
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
  });

  const [gstCertificate, setGstCertificate] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [businessLicense, setBusinessLicense] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      switch (name) {
        case 'gst_certificate':
          setGstCertificate(files[0]);
          break;
        case 'pan_card':
          setPanCard(files[0]);
          break;
        case 'business_license':
          setBusinessLicense(files[0]);
          break;
        case 'bank_statement':
          setBankStatement(files[0]);
          break;
        default:
          break;
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate file sizes (2048KB = 2MB)
    const maxSize = 2048 * 1024;
    if (gstCertificate && gstCertificate.size > maxSize) {
      alert('The gst certificate field must not be greater than 2048 kilobytes.');
      return;
    }
    if (panCard && panCard.size > maxSize) {
      alert('The pan card field must not be greater than 2048 kilobytes.');
      return;
    }
    if (businessLicense && businessLicense.size > maxSize) {
      alert('The business license field must not be greater than 2048 kilobytes.');
      return;
    }
    if (bankStatement && bankStatement.size > maxSize) {
      alert('The bank statement field must not be greater than 2048 kilobytes.');
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    data.append('business_name', formData.business_type); // Add business_name from business_type
    if (gstCertificate) data.append('gst_certificate', gstCertificate);
    if (panCard) data.append('pan_card', panCard);
    if (businessLicense) data.append('business_license', businessLicense);
    if (bankStatement) data.append('bank_statement', bankStatement);

    try {
      const response = await submitVendorRequest(data);
      console.log('Vendor request submitted successfully:', response.data);
      alert('Vendor request submitted successfully!');
      setFormData({
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
      });
      setGstCertificate(null);
      setPanCard(null);
      setBusinessLicense(null);
      setBankStatement(null);
    } catch (error) {
      console.error('Error submitting vendor request:', error.response ? error.response.data : error.message);
      let errorMessage = 'Error submitting vendor request: ';
      if (error.response && error.response.data && error.response.data.errors) {
        for (const key in error.response.data.errors) {
          errorMessage += `\n${key}: ${error.response.data.errors[key].join(', ')}`;
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Vendor Request Form</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="business_type" className="block text-gray-700 font-bold mb-2">Business Type</label>
            <input type="text" id="business_type" name="business_type" value={formData.business_type} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="gst_number" className="block text-gray-700 font-bold mb-2">GST Number</label>
            <input type="text" id="gst_number" name="gst_number" value={formData.gst_number} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="pan_number" className="block text-gray-700 font-bold mb-2">PAN Number</label>
            <input type="text" id="pan_number" name="pan_number" value={formData.pan_number} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="business_address" className="block text-gray-700 font-bold mb-2">Business Address</label>
            <input type="text" id="business_address" name="business_address" value={formData.business_address} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="city" className="block text-gray-700 font-bold mb-2">City</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="state" className="block text-gray-700 font-bold mb-2">State</label>
            <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="pincode" className="block text-gray-700 font-bold mb-2">Pincode</label>
            <input type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Contact Person Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="contact_person_name" className="block text-gray-700 font-bold mb-2">Contact Person Name</label>
            <input type="text" id="contact_person_name" name="contact_person_name" value={formData.contact_person_name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="contact_person_phone" className="block text-gray-700 font-bold mb-2">Contact Person Phone</label>
            <input type="tel" id="contact_person_phone" name="contact_person_phone" value={formData.contact_person_phone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="alternate_phone" className="block text-gray-700 font-bold mb-2">Alternate Phone (Optional)</label>
            <input type="tel" id="alternate_phone" name="alternate_phone" value={formData.alternate_phone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Bank Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="bank_name" className="block text-gray-700 font-bold mb-2">Bank Name</label>
            <input type="text" id="bank_name" name="bank_name" value={formData.bank_name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="account_number" className="block text-gray-700 font-bold mb-2">Account Number</label>
            <input type="text" id="account_number" name="account_number" value={formData.account_number} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="ifsc_code" className="block text-gray-700 font-bold mb-2">IFSC Code</label>
            <input type="text" id="ifsc_code" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div>
            <label htmlFor="branch_name" className="block text-gray-700 font-bold mb-2">Branch Name</label>
            <input type="text" id="branch_name" name="branch_name" value={formData.branch_name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Document Uploads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="gst_certificate" className="block text-gray-700 font-bold mb-2">GST Certificate (PDF, JPG, PNG)</label>
            <input type="file" id="gst_certificate" name="gst_certificate" onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" accept=".pdf,.jpg,.jpeg,.png" required />
          </div>
          <div>
            <label htmlFor="pan_card" className="block text-gray-700 font-bold mb-2">PAN Card (PDF, JPG, PNG)</label>
            <input type="file" id="pan_card" name="pan_card" onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" accept=".pdf,.jpg,.jpeg,.png" required />
          </div>
          <div>
            <label htmlFor="business_license" className="block text-gray-700 font-bold mb-2">Business License (PDF, JPG, PNG)</label>
            <input type="file" id="business_license" name="business_license" onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" accept=".pdf,.jpg,.jpeg,.png" required />
          </div>
          <div>
            <label htmlFor="bank_statement" className="block text-gray-700 font-bold mb-2">Bank Statement (PDF, JPG, PNG)</label>
            <input type="file" id="bank_statement" name="bank_statement" onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" accept=".pdf,.jpg,.jpeg,.png" required />
          </div>
        </div>

        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Submit Request
        </button>
      </form>
    </div>
  );
}