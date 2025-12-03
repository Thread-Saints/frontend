import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_ENDPOINTS } from '../config/api'
import { useAuth } from '../context/AuthContext'
import styles from './Admin.module.css'

function Admin() {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

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
    colorVariants: [], // New: Array of {color, images}
    stock: '',
    rating: 0,
    reviewCount: 0,
    productDetails: '',
    washingInstructions: '',
    returnsPolicy: 'Standard return policy applies',
    shippingInfo: 'Standard shipping: 5-7 business days',
    isActive: true
  })

  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null)

  // Edit category state
  const [editingCategory, setEditingCategory] = useState(null)

  // Image upload state
  const [imageFiles, setImageFiles] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Color variant state
  const [colorVariantFiles, setColorVariantFiles] = useState({}) // { colorIndex: [files] }

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

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.GET_ALL_ORDERS_ADMIN)
      if (response.data.success) {
        setOrders(response.data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      showMessage('error', 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchOrders()
  }, [])

  const showMessage = (type, text) => {
    if (type === 'success') {
      toast.success(text)
    } else if (type === 'error') {
      toast.error(text)
    } else {
      toast.info(text)
    }
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

  // Handle size toggle - syncs with color variants
  const toggleSize = (size) => {
    const newSizes = productForm.sizes.includes(size)
      ? productForm.sizes.filter(s => s !== size)
      : [...productForm.sizes, size]
    syncColorVariantSizes(newSizes)
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

  // Remove existing image (when editing)
  const removeExistingImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Color Variant Functions
  const addColorVariant = () => {
    // Auto-populate sizeStock based on selected sizes
    const sizeStock = productForm.sizes.map(size => ({ size, stock: 0 }))
    setProductForm(prev => ({
      ...prev,
      colorVariants: [...prev.colorVariants, { color: '', images: [], sizeStock }]
    }))
  }

  const removeColorVariant = (index) => {
    setProductForm(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index)
    }))
    // Also remove associated files
    setColorVariantFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[index]
      return newFiles
    })
  }

  const updateColorVariantColor = (index, color) => {
    setProductForm(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === index ? { ...variant, color } : variant
      )
    }))
  }

  const updateColorVariantSizeStock = (variantIndex, size, stock) => {
    setProductForm(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) => {
        if (i !== variantIndex) return variant
        const updatedSizeStock = variant.sizeStock?.map(s =>
          s.size === size ? { ...s, stock: parseInt(stock) || 0 } : s
        ) || []
        return { ...variant, sizeStock: updatedSizeStock }
      })
    }))
  }

  // Sync sizeStock when sizes change
  const syncColorVariantSizes = (newSizes) => {
    setProductForm(prev => ({
      ...prev,
      sizes: newSizes,
      colorVariants: prev.colorVariants.map(variant => {
        const existingStocks = variant.sizeStock || []
        const newSizeStock = newSizes.map(size => {
          const existing = existingStocks.find(s => s.size === size)
          return existing || { size, stock: 0 }
        })
        return { ...variant, sizeStock: newSizeStock }
      })
    }))
  }

  const handleColorVariantImageFiles = (index, e) => {
    const files = Array.from(e.target.files)
    const currentFiles = colorVariantFiles[index] || []
    const currentImages = productForm.colorVariants[index]?.images || []

    if (files.length + currentFiles.length + currentImages.length > 5) {
      showMessage('error', 'Maximum 5 images per color')
      return
    }

    setColorVariantFiles(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), ...files]
    }))
  }

  const removeColorVariantFile = (variantIndex, fileIndex) => {
    setColorVariantFiles(prev => ({
      ...prev,
      [variantIndex]: prev[variantIndex].filter((_, i) => i !== fileIndex)
    }))
  }

  const removeColorVariantExistingImage = (variantIndex, imageIndex) => {
    setProductForm(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === variantIndex
          ? { ...variant, images: variant.images.filter((_, j) => j !== imageIndex) }
          : variant
      )
    }))
  }

  // Upload images to S3 (batch upload - all at once)
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

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : '',
      images: product.images,
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors && product.colors.length > 0 ? product.colors : [''],
      colorVariants: product.colorVariants || [],
      stock: product.stock.toString(),
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      productDetails: product.productDetails || '',
      washingInstructions: product.washingInstructions || '',
      returnsPolicy: product.returnsPolicy || 'Standard return policy applies',
      shippingInfo: product.shippingInfo || 'Standard shipping: 5-7 business days',
      isActive: product.isActive
    })
    setImageFiles([])
    setColorVariantFiles({})
    setActiveTab('add')
  }

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      images: [],
      category: '',
      sizes: [],
      colors: [''],
      colorVariants: [],
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
    setColorVariantFiles({})
  }

  // Submit product form (Create or Update)
  const handleSubmitProduct = async (e) => {
    e.preventDefault()

    // Validation
    if (!productForm.name || !productForm.description || !productForm.price) {
      showMessage('error', 'Please fill in all required fields')
      return
    }

    // Require sizes for new products
    if (productForm.sizes.length === 0 && !editingProduct) {
      showMessage('error', 'Please select at least one size')
      return
    }

    // Require color variants for new products
    if (productForm.colorVariants.length === 0 && !editingProduct) {
      showMessage('error', 'Please add at least one color variant')
      return
    }

    // Validate color variants
    for (let i = 0; i < productForm.colorVariants.length; i++) {
      const variant = productForm.colorVariants[i]
      if (!variant.color || variant.color.trim() === '') {
        showMessage('error', `Color name is required for variant ${i + 1}`)
        return
      }
      const variantFiles = colorVariantFiles[i] || []
      if (variant.images.length === 0 && variantFiles.length === 0) {
        showMessage('error', `At least one image is required for color: ${variant.color}`)
        return
      }
    }

    try {
      setLoading(true)

      let finalColorVariants = []

      // Upload color variant images
      for (let i = 0; i < productForm.colorVariants.length; i++) {
        const variant = productForm.colorVariants[i]
        const variantFiles = colorVariantFiles[i] || []

        let variantImages = [...variant.images]

        // Upload new images for this color variant
        if (variantFiles.length > 0) {
          const formData = new FormData()
          variantFiles.forEach(file => {
            formData.append('images', file)
          })

          const uploadResponse = await axios.post(API_ENDPOINTS.UPLOAD_MULTIPLE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })

          if (uploadResponse.data.success && uploadResponse.data.images) {
            const uploadedUrls = uploadResponse.data.images.map(img => img.url)
            variantImages = [...variantImages, ...uploadedUrls]
          }
        }

        finalColorVariants.push({
          color: variant.color.trim(),
          images: variantImages,
          sizeStock: variant.sizeStock || []
        })
      }

      const productData = {
        ...productForm,
        images: [],
        colorVariants: finalColorVariants,
        colors: [], // Colors now derived from colorVariants
        price: parseFloat(productForm.price),
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
        stock: 0 // Stock now managed per color/size
      }

      let response
      if (editingProduct) {
        response = await axios.put(API_ENDPOINTS.PRODUCT_BY_ID(editingProduct._id), productData)
      } else {
        response = await axios.post(API_ENDPOINTS.PRODUCTS, productData)
      }

      if (response.data.success) {
        showMessage('success', `Product ${editingProduct ? 'updated' : 'created'} successfully!`)
        handleCancelEdit()
        fetchProducts()
      }
    } catch (error) {
      console.error(`Error ${editingProduct ? 'updating' : 'creating'} product:`, error)
      showMessage('error', error.response?.data?.message || `Failed to ${editingProduct ? 'update' : 'create'} product`)
    } finally {
      setLoading(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id) => {
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

  // Upload category image to S3
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

  // Submit category form (create or update)
  const handleSubmitCategory = async (e) => {
    e.preventDefault()

    if (!categoryForm.name) {
      showMessage('error', 'Category name is required')
      return
    }

    try {
      setLoading(true)

      // Upload category image if provided
      let imageUrl = categoryForm.image || null
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

      let response
      if (editingCategory) {
        // Update existing category
        response = await axios.put(API_ENDPOINTS.CATEGORY_BY_ID(editingCategory._id), categoryData)
      } else {
        // Create new category
        response = await axios.post(API_ENDPOINTS.CATEGORIES, categoryData)
      }

      if (response.data.success) {
        showMessage('success', `Category ${editingCategory ? 'updated' : 'created'} successfully!`)
        setCategoryForm({
          name: '',
          description: '',
          isActive: true,
          image: ''
        })
        setCategoryImageFile(null)
        setEditingCategory(null)
        fetchCategories()
      }
    } catch (error) {
      console.error(`Error ${editingCategory ? 'updating' : 'creating'} category:`, error)
      showMessage('error', error.response?.data?.message || `Failed to ${editingCategory ? 'update' : 'create'} category`)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
      image: category.image || ''
    })
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel editing category
  const handleCancelEditCategory = () => {
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      description: '',
      isActive: true,
      image: ''
    })
    setCategoryImageFile(null)
  }

  // Delete category
  const handleDeleteCategory = async (id) => {
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

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true)
      const response = await axios.put(API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), {
        orderStatus: newStatus
      })

      if (response.data.success) {
        showMessage('success', 'Order status updated successfully!')
        fetchOrders()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      showMessage('error', error.response?.data?.message || 'Failed to update order status')
    } finally {
      setLoading(false)
    }
  }

  // Calculate total stock from colorVariants
  const getTotalStock = (product) => {
    if (product.colorVariants && product.colorVariants.length > 0) {
      return product.colorVariants.reduce((total, variant) => {
        const variantStock = variant.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0
        return total + variantStock
      }, 0)
    }
    return product.stock || 0
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'Processing':
        return '#ffa500'
      case 'Shipped':
        return '#2196f3'
      case 'Delivered':
        return '#4caf50'
      case 'Cancelled':
      case 'Payment Failed':
        return '#f44336'
      default:
        return '#ffffff'
    }
  }

  // Handle opening order details modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedOrder(null)
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
        <button
          className={activeTab === 'orders' ? styles.activeTab : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({orders.length})
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
                                src={product.colorVariants?.[0]?.images?.[0] || product.images?.[0] || ''}
                                alt={product.name}
                                className={styles.productThumb}
                              />
                            </td>
                            <td>{product.name}</td>
                            <td>${product.price}</td>
                            <td>
                              <span className={getTotalStock(product) > 0 ? styles.inStock : styles.outOfStock}>
                                {getTotalStock(product)}
                              </span>
                            </td>
                            <td>{product.sizes?.join(', ') || 'N/A'}</td>
                            <td>{product.colorVariants?.map(v => v.color).join(', ') || product.colors?.join(', ') || 'N/A'}</td>
                            <td>
                              <span className={product.isActive ? styles.active : styles.inactive}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className={styles.actions}>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className={styles.editBtn}
                                >
                                  Edit
                                </button>
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

        {/* Add/Edit Product Tab */}
        {activeTab === 'add' && (
          <div className={styles.addProductSection}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className={styles.cancelEditBtn}
                style={{ marginBottom: '1rem' }}
              >
                Cancel Edit
              </button>
            )}
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

              {/* Sizes Section - Select sizes first */}
              <div className={styles.formGroup}>
                <label>Available Sizes *</label>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                  Select sizes first, then add color variants to set stock per color/size
                </p>
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

              {/* Color Variants Section */}
              <div className={styles.formGroup}>
                <label>Color Variants * (Each color has its own images & stock per size)</label>
                {productForm.sizes.length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: '#f44336', marginBottom: '0.5rem' }}>
                    Please select at least one size above before adding colors
                  </p>
                )}
                <button
                  type="button"
                  onClick={addColorVariant}
                  className={styles.addBtn}
                  style={{ marginBottom: '1rem' }}
                  disabled={productForm.sizes.length === 0}
                >
                  + Add Color Variant
                </button>

                {productForm.colorVariants.map((variant, variantIndex) => (
                  <div key={variantIndex} className={styles.colorVariantContainer} style={{
                    border: '1px solid #ddd',
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0 }}>Color Variant {variantIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeColorVariant(variantIndex)}
                        className={styles.removeBtn}
                      >
                        Remove Variant
                      </button>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label>Color Name *</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateColorVariantColor(variantIndex, e.target.value)}
                        placeholder="e.g., Black, White, Navy Blue"
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                      />
                    </div>

                    {/* Size-specific stock for this color */}
                    {variant.sizeStock && variant.sizeStock.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label>Stock per Size</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {variant.sizeStock.map((sizeItem, sizeIdx) => (
                            <div key={sizeIdx} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: '#eee',
                              padding: '0.5rem',
                              borderRadius: '4px'
                            }}>
                              <span style={{ fontWeight: '500', minWidth: '40px' }}>{sizeItem.size}:</span>
                              <input
                                type="number"
                                value={sizeItem.stock}
                                onChange={(e) => updateColorVariantSizeStock(variantIndex, sizeItem.size, e.target.value)}
                                min="0"
                                style={{ width: '60px', padding: '0.25rem', textAlign: 'center' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!variant.sizeStock || variant.sizeStock.length === 0) && productForm.sizes.length === 0 && (
                      <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>
                        Select sizes above to set stock per size
                      </p>
                    )}

                    {/* Existing images for this variant */}
                    {variant.images.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                          Existing Images for {variant.color || 'this color'}:
                        </p>
                        <div className={styles.imagePreviewContainer}>
                          {variant.images.map((imageUrl, imgIndex) => (
                            <div key={`variant-${variantIndex}-img-${imgIndex}`} className={styles.imagePreview}>
                              <img src={imageUrl} alt={`${variant.color} ${imgIndex + 1}`} />
                              <button
                                type="button"
                                onClick={() => removeColorVariantExistingImage(variantIndex, imgIndex)}
                                className={styles.removeImageBtn}
                              >
                                ×
                              </button>
                              <span className={styles.imageName}>Image {imgIndex + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload new images for this variant */}
                    <div>
                      <label>Upload Images (Max 5 per color) *</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleColorVariantImageFiles(variantIndex, e)}
                        className={styles.fileInput}
                        style={{ marginTop: '0.5rem' }}
                      />
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                        {variant.images.length + (colorVariantFiles[variantIndex]?.length || 0)}/5 images
                      </p>
                    </div>

                    {/* Preview new files for this variant */}
                    {colorVariantFiles[variantIndex] && colorVariantFiles[variantIndex].length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>New Images to Upload:</p>
                        <div className={styles.imagePreviewContainer}>
                          {colorVariantFiles[variantIndex].map((file, fileIndex) => (
                            <div key={`file-${variantIndex}-${fileIndex}`} className={styles.imagePreview}>
                              <img src={URL.createObjectURL(file)} alt={`New ${fileIndex + 1}`} />
                              <button
                                type="button"
                                onClick={() => removeColorVariantFile(variantIndex, fileIndex)}
                                className={styles.removeImageBtn}
                              >
                                ×
                              </button>
                              <span className={styles.imageName}>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {productForm.colorVariants.length === 0 && (
                  <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                    Click "Add Color Variant" to add product colors with their specific images
                  </p>
                )}
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
                {uploadingImages ? 'Uploading Images...' : loading ? (editingProduct ? 'Updating Product...' : 'Creating Product...') : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className={styles.ordersSection}>
            <h2>All Orders ({orders.length})</h2>

            {orders.length === 0 ? (
              <p className={styles.noProducts}>No orders found.</p>
            ) : (
              <div className={styles.productTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Details</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td><strong>{order.orderNumber}</strong></td>
                        <td>{order.user?.email || 'N/A'}</td>
                        <td>{order.orderItems.length} item(s)</td>
                        <td>Rs.{order.totalPrice.toFixed(2)}</td>
                        <td>
                          <span
                            className={styles.statusBadge}
                            style={{
                              backgroundColor: order.paymentStatus === 'Paid' ? '#4caf50' : '#f44336',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={styles.statusBadge}
                            style={{
                              backgroundColor: getStatusColor(order.orderStatus),
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewDetails(order)}
                            className={styles.detailsBtn}
                          >
                            View Details
                          </button>
                        </td>
                        <td>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className={styles.statusSelect}
                            disabled={order.paymentStatus !== 'Paid'}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className={styles.categoriesSection}>
            <h2>Manage Categories</h2>

            {/* Add Category Form */}
            <div className={styles.addCategorySection}>
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancelEditCategory}
                  className={styles.cancelEditBtn}
                >
                  Cancel Editing
                </button>
              )}
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
                  {editingCategory && categoryForm.image && !categoryImageFile && (
                    <div className={styles.currentImagePreview}>
                      <p>Current Image:</p>
                      <img
                        src={categoryForm.image}
                        alt="Current category"
                        style={{ maxWidth: '200px', marginBottom: '10px' }}
                      />
                    </div>
                  )}
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
                  {uploadingCategoryImage ? 'Uploading Image...' : loading ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update Category' : 'Create Category')}
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
                                onClick={() => handleEditCategory(category)}
                                className={styles.editBtn}
                              >
                                Edit
                              </button>
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={handleCloseDetailsModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order Details</h2>
              <button onClick={handleCloseDetailsModal} className={styles.closeModalBtn}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Order Information */}
              <div className={styles.detailSection}>
                <h3>Order Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Order Number:</span>
                    <span className={styles.detailValue}>{selectedOrder.orderNumber}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Order Date:</span>
                    <span className={styles.detailValue}>
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Payment Status:</span>
                    <span className={styles.detailValue}>
                      <span
                        style={{
                          backgroundColor: selectedOrder.paymentStatus === 'Paid' ? '#4caf50' : '#f44336',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Order Status:</span>
                    <span className={styles.detailValue}>
                      <span
                        style={{
                          backgroundColor: getStatusColor(selectedOrder.orderStatus),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}
                      >
                        {selectedOrder.orderStatus}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className={styles.detailSection}>
                <h3>Customer Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Name:</span>
                    <span className={styles.detailValue}>{selectedOrder.user?.name || 'N/A'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{selectedOrder.user?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className={styles.detailSection}>
                <h3>Shipping Address</h3>
                <div className={styles.addressBox}>
                  <p><strong>{selectedOrder.shippingAddress?.fullName}</strong></p>
                  <p>{selectedOrder.shippingAddress?.address}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className={styles.detailSection}>
                <h3>Order Items</h3>
                <div className={styles.orderItemsList}>
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className={styles.orderItemCard}>
                      <img src={item.image} alt={item.name} className={styles.orderItemImage} />
                      <div className={styles.orderItemInfo}>
                        <p className={styles.orderItemName}>{item.name}</p>
                        {item.size && <p className={styles.orderItemDetail}>Size: {item.size}</p>}
                        {item.color && <p className={styles.orderItemDetail}>Color: {item.color}</p>}
                        <p className={styles.orderItemDetail}>Quantity: {item.quantity}</p>
                        <p className={styles.orderItemPrice}>Rs.{item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className={styles.detailSection}>
                <h3>Price Breakdown</h3>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Subtotal:</span>
                    <span>Rs.{selectedOrder.itemsPrice?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className={styles.priceRow}>
                      <span>Discount:</span>
                      <span style={{ color: '#4caf50' }}>-Rs.{selectedOrder.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.priceRow}>
                    <span>Shipping:</span>
                    <span>{selectedOrder.shippingPrice === 0 ? 'FREE' : `Rs.${selectedOrder.shippingPrice?.toFixed(2)}`}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Tax (GST):</span>
                    <span>Rs.{selectedOrder.taxPrice?.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow} style={{ borderTop: '2px solid #ddd', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    <span>Total:</span>
                    <span>Rs.{selectedOrder.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {selectedOrder.paymentResult && (
                <div className={styles.detailSection}>
                  <h3>Payment Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Payment ID:</span>
                      <span className={styles.detailValue}>{selectedOrder.paymentResult.razorpayPaymentId || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Payment Date:</span>
                      <span className={styles.detailValue}>
                        {selectedOrder.paidAt ? new Date(selectedOrder.paidAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
