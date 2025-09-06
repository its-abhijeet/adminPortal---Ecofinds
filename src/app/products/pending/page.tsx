"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BACKEND_API_URL } from "@/constants/apiConstants";
import {
  Package,
  DollarSign,
  Calendar,
  Tag,
  Box,
  CheckCircle,
  X,
  ImageIcon,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Pagination from "@/components/Pagination";

interface Seller {
  user: {
    name: string;
    email: string;
    phoneNumber: string | null;
    countryCode: string | null;
    address: string;
    isEmailVerified: boolean;
    isDocumentVerified: boolean;
    createdAt: string;
  };
}

interface Product {
  id: number;
  sellerUserId: string;
  seller: Seller;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
  category: string;
  description: string;
  additionalNotes?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: number;
    url: string;
    productId: number;
    createdAt: string;
  }>;
}

export default function PendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;
  const { user, token } = useAuth();
  const router = useRouter();

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const openProductDetails = (product: Product) => {
    console.log(product);
    setSelectedProduct(product);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedProduct(null);
  };

  const handleApprove = async (productId: number) => {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/products/${productId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove the approved product from the list
        setProducts(products.filter((p) => p.id !== productId));
        // Close dialog if open
        if (showDialog && selectedProduct?.id === productId) {
          closeDialog();
        }
      }
    } catch (error) {
      console.error("Error approving product:", error);
    }
  };

  const handleReject = async (productId: number) => {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/products/${productId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove the rejected product from the list
        setProducts(products.filter((p) => p.id !== productId));
        // Close dialog if open
        if (showDialog && selectedProduct?.id === productId) {
          closeDialog();
        }
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/products/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Filter only pending products
          setProducts(data.filter((p: Product) => !p.isApproved));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, token, router]);

  // Calculate pagination
  const totalPages = Math.ceil(products.length / ROWS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pending Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve pending products ({products.length})
          </p>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Seller
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => openProductDetails(product)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative bg-gray-100 rounded-md">
                        {product.images[0] && !imageErrors[product.id] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                            onError={() => handleImageError(product.id)}
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => openProductDetails(product)}
                  >
                    <div className="text-sm text-gray-900">
                      {product.category}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => openProductDetails(product)}
                  >
                    <div className="text-sm text-gray-900">
                      {product.price} {product?.currency}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => {
                      openProductDetails(product);
                      console.log(product);
                    }}
                  >
                    <div className="text-sm text-gray-900">
                      {product?.seller?.user?.name || "Unknown"}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    onClick={() => openProductDetails(product)}
                  >
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleApprove(product.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(product.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {products.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              <div className="text-sm text-gray-500 text-center mt-2">
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * ROWS_PER_PAGE + 1,
                  products.length
                )}{" "}
                to {Math.min(currentPage * ROWS_PER_PAGE, products.length)} of{" "}
                {products.length} products
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12 bg-white shadow-sm rounded-lg mt-4">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No pending products
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              All pending products have been reviewed or there are no pending
              products at the moment.
            </p>
          </div>
        )}

        {/* Product Details Dialog */}
        {showDialog && selectedProduct && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="product-details-dialog"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={closeDialog}
              ></div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={closeDialog}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-start">
                        <h3
                          className="text-lg leading-6 font-medium text-gray-900"
                          id="modal-title"
                        >
                          {selectedProduct.name}
                        </h3>
                        <div className="ml-3 flex items-center text-lg font-semibold text-[#027e3f]">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {selectedProduct.price} {selectedProduct.currency}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Product Image */}
                        <div className="relative h-48 bg-gray-100 rounded-lg">
                          {selectedProduct.images[0] &&
                          !imageErrors[selectedProduct.id] ? (
                            <Image
                              src={selectedProduct.images[0].url}
                              alt={selectedProduct.name}
                              fill
                              className="object-cover rounded-lg"
                              onError={() =>
                                handleImageError(selectedProduct.id)
                              }
                              sizes="(max-width: 640px) 100vw, 50vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Description
                            </h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedProduct.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Category
                              </h4>
                              <p className="mt-1 text-sm text-gray-900 flex items-center">
                                <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {selectedProduct.category}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Quantity
                              </h4>
                              <p className="mt-1 text-sm text-gray-900 flex items-center">
                                <Box className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {selectedProduct.quantity}{" "}
                                {selectedProduct.unit}
                              </p>
                            </div>
                          </div>

                          {selectedProduct.additionalNotes && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Additional Notes
                              </h4>
                              <p className="mt-1 text-sm text-gray-900">
                                {selectedProduct.additionalNotes}
                              </p>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Listed On
                            </h4>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {new Date(
                                selectedProduct.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Seller Details */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-500">
                          Seller Information
                        </h4>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">
                              {selectedProduct?.seller?.user?.name || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>
                              {selectedProduct?.seller?.user?.email ||
                                "No email"}
                            </span>
                            {selectedProduct?.seller?.user?.isEmailVerified && (
                              <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                            )}
                          </div>
                          {selectedProduct?.seller?.user?.phoneNumber && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <span>
                                {selectedProduct?.seller?.user?.countryCode}{" "}
                                {selectedProduct?.seller?.user?.phoneNumber}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="line-clamp-1">
                              {selectedProduct?.seller?.user?.address ||
                                "No address"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>
                              Member since{" "}
                              {selectedProduct?.seller?.user?.createdAt
                                ? new Date(
                                    selectedProduct.seller.user.createdAt
                                  ).toLocaleDateString()
                                : "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
                            <span>
                              {selectedProduct?.seller?.user
                                ?.isDocumentVerified ? (
                                <span className="text-green-600">
                                  Verified Seller
                                </span>
                              ) : (
                                <span className="text-yellow-600">
                                  Pending Verification
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleApprove(selectedProduct.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleReject(selectedProduct.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#027e3f] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={closeDialog}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
