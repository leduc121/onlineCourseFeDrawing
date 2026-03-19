import React, { useState, useEffect } from 'react';
import { bundlesApi } from '../api';
import { BundleGrid } from '../components/BundleAndStage';

interface Bundle {
  id: string;
  title: string;
  description: string;
  totalPrice: number;
  discountPercentage: number;
  courses: any[];
  expiryDate?: string;
  status: string;
}

export const BundleCatalogPage: React.FC = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    setIsLoading(true);
    try {
      const response = await bundlesApi.getAll();
      setBundles(response.data);
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (bundleId: string) => {
    try {
      // Integrate with your cart system
      alert(`Bundle added to cart: ${bundleId}`);
    } catch (error) {
      alert('Failed to add bundle to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Course Bundles</h1>
          <p className="text-gray-600 text-lg mt-2">
            Save money with our discounted course bundles
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading bundles...</p>
          </div>
        ) : (
          <BundleGrid bundles={bundles} onAddToCart={handleAddToCart} />
        )}
      </div>
    </div>
  );
};

export default BundleCatalogPage;
