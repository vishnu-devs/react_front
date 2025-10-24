import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/product';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProduct(id);
        // API response shape: { status, data: { ...product } }
        setProduct(res?.data?.data || null);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }
  if (!product) {
    return <div className="p-6">Product not found</div>;
  }

  const price = product?.price?.formatted || (product?.price ? `₹${product.price}` : '');
  const image = product?.images?.main || product?.main_image || null;
  const stockLeft = Number(product?.stock_left ?? product?.stock_quantity ?? 0);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button className="mb-4 text-blue-600" onClick={() => navigate(-1)}>← Back</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {image ? (
            <img src={image} alt={product.name} className="w-full h-auto rounded" />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">No Image</div>
          )}
          {product.images?.additional && product.images.additional.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images.additional.map((img, idx) => (
                <img key={idx} src={img} alt={`image-${idx}`} className="w-full h-20 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-gray-600 mt-2">{product.description || 'No description available.'}</p>
          <div className="mt-4">
            <span className="text-xl font-bold">{price}</span>
            {product.price?.mrp?.formatted && (
              <span className="ml-2 line-through text-gray-500">{product.price.mrp.formatted}</span>
            )}
          </div>
          <div className="mt-2 text-sm">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${
              stockLeft > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stockLeft > 0 ? `In stock: ${stockLeft}` : 'Out of Stock'}
            </span>
            {typeof product?.sold_quantity !== 'undefined' && (
              <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 bg-blue-100 text-blue-800">
                Sold: {product.sold_quantity}
              </span>
            )}
          </div>
          {product.vendor && (
            <div className="mt-2 text-sm text-gray-600">Vendor: {product.vendor.name}</div>
          )}
          {product.highlights && Array.isArray(product.highlights) && product.highlights.length > 0 && (
            <ul className="mt-4 list-disc list-inside text-sm text-gray-700">
              {product.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex gap-3">
            <button
              disabled={stockLeft <= 0}
              className={`px-4 py-2 rounded ${stockLeft <= 0 ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white'}`}
            >
              {stockLeft <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className="px-4 py-2 border rounded">Add to Wishlist</button>
          </div>
        </div>
      </div>
    </div>
  );
}