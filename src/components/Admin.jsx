import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { useAuth } from '../context/AuthContext'
import styles from './Admin.module.css'

function Admin() {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    isActive: true,
    image: ''
  })

  // Category image upload state
  const [categoryImageFile, setCategoryImageFile] = useState(null)
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false)

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    images: [],
    category: '',
    sizes: [],
    colors: [''],
    stock: '',
    rating: 0,
    reviewCount: 0,
    productDetails: '',
    washingInstructions: '',
    returnsPolicy: 'Standard return policy applies',
    shippingInfo: 'Standard shipping: 5-7 business days',
    isActive: true
  })

  // Image upload state
  const [imageFiles, setImageFiles] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.PRODUCTS)
      if (response.data.success) {
        setProducts(response.data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      showMessage('error', 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CATEGORIES)
      if (response.data.success) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      showMessage('error', 'Failed to fetch categories')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Handle product form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle array inputs (images, colors)
  const handleArrayChange = (index, value, field) => {
    setProductForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field) => {
    setProductForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (index, field) => {
    setProductForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // Handle size toggle
  const toggleSize = (size) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  // Handle image file selection
  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + imageFiles.length > 5) {
      showMessage('error', 'Maximum 5 images allowed')
      return
    }
    setImageFiles(prev => [...prev, ...files])
  }

  // Remove image file
  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Upload images to Cloudinary (batch upload - all at once)
  const uploadImages = async () => {
    if (imageFiles.length === 0) {
      return []
    }

    try {
      setUploadingImages(true)

      // Create FormData and append all images
      const formData = new FormData()
      imageFiles.forEach(file => {
        formData.append('images', file) // 'images' to match backend array field
      })

      // Upload all images at once
      const response = await axios.post(API_ENDPOINTS.UPLOAD_MULTIPLE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success && response.data.images) {
        // Extract URLs from response
        const uploadedUrls = response.data.images.map(img => img.url)
        return uploadedUrls
      }

      return []
    } catch (error) {
      console.error('Error uploading images:', error)
      throw new Error('Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  // Submit product form
  const handleSubmitProduct = async (e) => {
    e.preventDefault()

    // Validation
    if (!productForm.name || !productForm.description || !productForm.price) {
      showMessage('error', 'Please fill in all required fields')
      return
    }

    if (imageFiles.length === 0) {
      showMessage('error', 'At least one product image is required')
      return
    }

    try {
      setLoading(true)

      // Upload images first
      const uploadedImageUrls = await uploadImages()

      if (uploadedImageUrls.length === 0) {
        showMessage('error', 'Failed to upload images')
        return
      }

      const productData = {
        ...productForm,
        images: uploadedImageUrls,
        colors: productForm.colors.filter(color => color.trim()),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock) || 0
      }

      const response = await axios.post(API_ENDPOINTS.PRODUCTS, productData)

      if (response.data.success) {
        showMessage('success', 'Product created successfully!')
        // Reset form
        setProductForm({
          name: '',
          description: '',
          price: '',
          salePrice: '',
          images: [],
          category: '',
          sizes: [],
          colors: [''],
          stock: '',
          rating: 0,
          reviewCount: 0,
          productDetails: '',
          washingInstructions: '',
          returnsPolicy: 'Standard return policy applies',
          shippingInfo: 'Standard shipping: 5-7 business days',
          isActive: true
        })
        setImageFiles([])
        fetchProducts()
      }
    } catch (error) {
      console.error('Error creating product:', error)
      showMessage('error', error.response?.data?.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      setLoading(true)
      const response = await axios.delete(API_ENDPOINTS.PRODUCT_BY_ID(id))

      if (response.data.success) {
        showMessage('success', 'Product deleted successfully!')
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showMessage('error', error.response?.data?.message || 'Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  // Toggle product active status
  const toggleProductStatus = async (product) => {
    try {
      setLoading(true)
      const response = await axios.put(API_ENDPOINTS.PRODUCT_BY_ID(product._id), {
        isActive: !product.isActive
      })

      if (response.data.success) {
        showMessage('success', `Product ${product.isActive ? 'deactivated' : 'activated'} successfully!`)
        fetchProducts()
      }
    } catch (error) {
      console.error('Error updating product:', error)
      showMessage('error', 'Failed to update product status')
    } finally {
      setLoading(false)
    }
  }

  // Handle category image file selection
  const handleCategoryImageFile = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCategoryImageFile(file)
    }
  }

  // Remove category image file
  const removeCategoryImageFile = () => {
    setCategoryImageFile(null)
  }

  // Upload category image to Cloudinary
  const uploadCategoryImage = async () => {
    if (!categoryImageFile) {
      return null
    }

    try {
      setUploadingCategoryImage(true)

      const formData = new FormData()
      formData.append('image', categoryImageFile)

      const response = await axios.post(API_ENDPOINTS.UPLOAD_SINGLE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success && response.data.imageUrl) {
        return response.data.imageUrl
      }

      return null
    } catch (error) {
      console.error('Error uploading category image:', error)
      throw new Error('Failed to upload category image')
    } finally {
      setUploadingCategoryImage(false)
    }
  }

  // Handle category form input changes
  const handleCategoryInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCategoryForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Submit category form
  const handleSubmitCategory = async (e) => {
    e.preventDefault()

    if (!categoryForm.name) {
      showMessage('error', 'Category name is required')
      return
    }

    try {
      setLoading(true)

      // Upload category image if provided
      let imageUrl = null
      if (categoryImageFile) {
        imageUrl = await uploadCategoryImage()
        if (!imageUrl) {
          showMessage('error', 'Failed to upload category image')
          return
        }
      }

      // Create category data with image URL
      const categoryData = {
        ...categoryForm,
        image: imageUrl
      }

      const response = await axios.post(API_ENDPOINTS.CATEGORIES, categoryData)

      if (response.data.success) {
        showMessage('success', 'Category created successfully!')
        setCategoryForm({
          name: '',
          description: '',
          isActive: true,
          image: ''
        })
        setCategoryImageFile(null)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error creating category:', error)
      showMessage('error', error.response?.data?.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      setLoading(true)
      const response = await axios.delete(API_ENDPOINTS.CATEGORY_BY_ID(id))

      if (response.data.success) {
        showMessage('success', 'Category deleted successfully!')
        fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      showMessage('error', error.response?.data?.message || 'Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  // Toggle category active status
  const toggleCategoryStatus = async (category) => {
    try {
      setLoading(true)
      const response = await axios.put(API_ENDPOINTS.CATEGORY_BY_ID(category._id), {
        isActive: !category.isActive
      })

      if (response.data.success) {
        showMessage('success', `Category ${category.isActive ? 'deactivated' : 'activated'} successfully!`)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error updating category:', error)
      showMessage('error', 'Failed to update category status')
    } finally {
      setLoading(false)
    }
  }

  // Group products by category
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category.name] = products.filter(p => p.category === category.name)
    return acc
  }, {})

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={logout} className={styles.logoutBtn}>Logout</button>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={activeTab === 'products' ? styles.activeTab : ''}
          onClick={() => setActiveTab('products')}
        >
          Product Management
        </button>
        <button
          className={activeTab === 'add' ? styles.activeTab : ''}
          onClick={() => setActiveTab('add')}
        >
          Add New Product
        </button>
        <button
          className={activeTab === 'categories' ? styles.activeTab : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </div>

      <div className={styles.content}>
        {/* Product Management Tab */}
        {activeTab === 'products' && (
          <div className={styles.productsSection}>
            <h2>All Products by Category</h2>

            {categories.map(category => (
              <div key={category._id} className={styles.categorySection}>
                <h3>{category.name} ({productsByCategory[category.name]?.length || 0} products)</h3>

                {(!productsByCategory[category.name] || productsByCategory[category.name].length === 0) ? (
                  <p className={styles.noProducts}>No products in this category</p>
                ) : (
                  <div className={styles.productTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Sizes</th>
                          <th>Colors</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsByCategory[category.name].map(product => (
                          <tr key={product._id}>
                            <td>
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className={styles.productThumb}
                              />
                            </td>
                            <td>{product.name}</td>
                            <td>${product.price}</td>
                            <td>
                              <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                                {product.stock}
                              </span>
                            </td>
                            <td>{product.sizes?.join(', ') || 'N/A'}</td>
                            <td>{product.colors?.join(', ') || 'N/A'}</td>
                            <td>
                              <span className={product.isActive ? styles.active : styles.inactive}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className={styles.actions}>
                                <button
                                  onClick={() => toggleProductStatus(product)}
                                  className={styles.toggleBtn}
                                >
                                  {product.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product._id)}
                                  className={styles.deleteBtn}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add' && (
          <div className={styles.addProductSection}>
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmitProduct} className={styles.productForm}>
              <div className={styles.formGroup}>
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Sale Price (Optional)</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={productForm.salePrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={productForm.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => cat.isActive).map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Product Images * (Max 5 images)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFiles}
                  className={styles.fileInput}
                />
                {imageFiles.length > 0 && (
                  <div className={styles.imagePreviewContainer}>
                    {imageFiles.map((file, index) => (
                      <div key={index} className={styles.imagePreview}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImageFile(index)}
                          className={styles.removeImageBtn}
                        >
                          ×
                        </button>
                        <span className={styles.imageName}>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {uploadingImages && (
                  <p className={styles.uploadingText}>Uploading images...</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Sizes</label>
                <div className={styles.sizeSelector}>
                  {sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      className={productForm.sizes.includes(size) ? styles.sizeActive : ''}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Colors</label>
                {productForm.colors.map((color, index) => (
                  <div key={index} className={styles.arrayInput}>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'colors')}
                      placeholder="e.g., Black, White, Blue"
                    />
                    {productForm.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'colors')}
                        className={styles.removeBtn}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('colors')}
                  className={styles.addBtn}
                >
                  + Add Color
                </button>
              </div>

              <div className={styles.formGroup}>
                <label>Product Details (Optional)</label>
                <textarea
                  name="productDetails"
                  value={productForm.productDetails}
                  onChange={handleInputChange}
                  placeholder="Additional product specifications and details"
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Washing Instructions (Optional)</label>
                <textarea
                  name="washingInstructions"
                  value={productForm.washingInstructions}
                  onChange={handleInputChange}
                  placeholder="Care and washing instructions"
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Returns Policy (Optional)</label>
                <input
                  type="text"
                  name="returnsPolicy"
                  value={productForm.returnsPolicy}
                  onChange={handleInputChange}
                  placeholder="Returns and refunds policy"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Shipping Info (Optional)</label>
                <input
                  type="text"
                  name="shippingInfo"
                  value={productForm.shippingInfo}
                  onChange={handleInputChange}
                  placeholder="Shipping and delivery information"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={productForm.isActive}
                    onChange={handleInputChange}
                  />
                  Active (visible on store)
                </label>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading || uploadingImages}>
                {uploadingImages ? 'Uploading Images...' : loading ? 'Creating Product...' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className={styles.categoriesSection}>
            <h2>Manage Categories</h2>

            {/* Add Category Form */}
            <div className={styles.addCategorySection}>
              <h3>Add New Category</h3>
              <form onSubmit={handleSubmitCategory} className={styles.categoryForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Category Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={categoryForm.name}
                      onChange={handleCategoryInputChange}
                      placeholder="e.g., T-Shirts, Jeans, Shoes"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description (Optional)</label>
                    <input
                      type="text"
                      name="description"
                      value={categoryForm.description}
                      onChange={handleCategoryInputChange}
                      placeholder="Brief description"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Category Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryImageFile}
                    className={styles.fileInput}
                  />
                  {categoryImageFile && (
                    <div className={styles.imagePreviewContainer}>
                      <div className={styles.imagePreview}>
                        <img
                          src={URL.createObjectURL(categoryImageFile)}
                          alt="Category preview"
                        />
                        <button
                          type="button"
                          onClick={removeCategoryImageFile}
                          className={styles.removeImageBtn}
                        >
                          ×
                        </button>
                        <span className={styles.imageName}>{categoryImageFile.name}</span>
                      </div>
                    </div>
                  )}
                  {uploadingCategoryImage && (
                    <p className={styles.uploadingText}>Uploading image...</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={categoryForm.isActive}
                      onChange={handleCategoryInputChange}
                    />
                    Active (visible to customers)
                  </label>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || uploadingCategoryImage}>
                  {uploadingCategoryImage ? 'Uploading Image...' : loading ? 'Creating...' : 'Create Category'}
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className={styles.categoriesListSection}>
              <h3>All Categories ({categories.length})</h3>

              {categories.length === 0 ? (
                <p className={styles.noProducts}>No categories found. Add your first category above.</p>
              ) : (
                <div className={styles.productTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Products</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(category => (
                        <tr key={category._id}>
                          <td>
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className={styles.productThumb}
                              />
                            ) : (
                              <div className={styles.noImage}>No Image</div>
                            )}
                          </td>
                          <td><strong>{category.name}</strong></td>
                          <td>{category.description || 'N/A'}</td>
                          <td>{productsByCategory[category.name]?.length || 0}</td>
                          <td>
                            <span className={category.isActive ? styles.active : styles.inactive}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button
                                onClick={() => toggleCategoryStatus(category)}
                                className={styles.toggleBtn}
                              >
                                {category.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category._id)}
                                className={styles.deleteBtn}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
