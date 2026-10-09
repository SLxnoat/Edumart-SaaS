import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createSellerProduct } from '../api';
import '../components/ProductUpload.css';

const ProductUploadPage = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: '',
    shortDescription: '',
    description: '',
    price: '',
    // Step 2: File Upload & Media
    fileName: '',
    fileSize: '',
    thumbnailUrl: '',
    // Step 3: Categorization & Taxonomy
    categoryId: '1',
    subject: 'Mathematics',
    gradeLevel: 'Grade 10',
    examYear: '2024',
    productType: 'revision_notes',
    format: 'digital',
    stockQuantity: '0',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
        setError('Please complete all required fields in Basic Info');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (formData.format !== 'physical' && !formData.fileName) {
        // default a mock uploaded filename if user didn't specify
        setFormData((prev) => ({ ...prev, fileName: `${formData.title.replace(/\s+/g, '_')}.pdf`, fileSize: '4.2 MB' }));
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createSellerProduct({
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId, 10),
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        examYear: formData.examYear,
        productType: formData.productType,
        format: formData.format,
        stockQuantity: formData.format === 'physical' ? parseInt(formData.stockQuantity || 10, 10) : 0,
        thumbnailUrl: formData.thumbnailUrl || null,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to upload product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell product-upload-page">
      <div className="upload-header">
        <Link to="/seller/dashboard" className="btn btn-link">← Back to Seller Dashboard</Link>
        <h1>Upload New Educational Material</h1>
        <p className="subtitle">Publish study guides, notes, or past papers to the marketplace</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success ? (
        <div className="upload-success-card">
          <div className="success-badge-icon">✓</div>
          <h2>Product Submitted Successfully!</h2>
          <p>Your learning resource <strong>&ldquo;{formData.title}&rdquo;</strong> is now listed in the catalog.</p>
          <div className="success-actions">
            <Link to="/seller/products" className="btn btn-primary">Manage My Products</Link>
            <Link to="/seller/dashboard" className="btn btn-outline">Go to Dashboard</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="upload-stepper">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
              <span className="step-circle">1</span>
              <span>Basic Info</span>
            </div>
            <div className="stepper-line" />
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
              <span className="step-circle">2</span>
              <span>File Upload</span>
            </div>
            <div className="stepper-line" />
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
              <span className="step-circle">3</span>
              <span>Categorization</span>
            </div>
            <div className="stepper-line" />
            <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
              <span className="step-circle">4</span>
              <span>Preview & Publish</span>
            </div>
          </div>

          <div className="upload-body-card">
            {step === 1 && (
              <form onSubmit={handleNext} className="upload-step-form">
                <h2>Step 1: Basic Information</h2>
                <div className="form-group">
                  <label htmlFor="title">Material Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="e.g. Complete A/L Pure Mathematics Revision Pack"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shortDescription">Short Summary (Catchy 1-liner)</label>
                  <input
                    type="text"
                    id="shortDescription"
                    name="shortDescription"
                    placeholder="e.g. Comprehensive chapter breakdown with model solutions"
                    value={formData.shortDescription}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Detailed Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    placeholder="Provide syllabus details, topics covered, target exams..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price (USD $) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    min="0"
                    placeholder="19.99"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="upload-actions right">
                  <button type="submit" className="btn btn-primary">
                    Next: File Upload →
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleNext} className="upload-step-form">
                <h2>Step 2: File & Media Upload</h2>
                <div className="file-drop-area">
                  <span className="file-icon">📁</span>
                  <p>Drag and drop your PDF, notes, or revision pack here</p>
                  <input
                    type="file"
                    id="fileInput"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData((prev) => ({
                          ...prev,
                          fileName: file.name,
                          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                        }));
                      }
                    }}
                  />
                  {formData.fileName && (
                    <div className="selected-file-badge">
                      ✓ Selected: {formData.fileName} ({formData.fileSize})
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="thumbnailUrl">Cover Image URL (optional)</label>
                  <input
                    type="url"
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    placeholder="https://example.com/cover.jpg"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="upload-actions space-between">
                  <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                    ← Back to Info
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Next: Categorization →
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleNext} className="upload-step-form">
                <h2>Step 3: Taxonomy & Categorization</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Physics">Physics</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gradeLevel">Grade Level *</label>
                    <select id="gradeLevel" name="gradeLevel" value={formData.gradeLevel} onChange={handleChange}>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12 (A/L)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="format">Material Format *</label>
                    <select id="format" name="format" value={formData.format} onChange={handleChange}>
                      <option value="digital">Digital (Instant Download)</option>
                      <option value="physical">Physical (Shippable Book / Print)</option>
                      <option value="both">Both (Digital + Printed Copy)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="examYear">Target Exam Year</label>
                    <input
                      type="number"
                      id="examYear"
                      name="examYear"
                      value={formData.examYear}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {formData.format !== 'digital' && (
                  <div className="form-group">
                    <label htmlFor="stockQuantity">Stock Available (Units)</label>
                    <input
                      type="number"
                      id="stockQuantity"
                      name="stockQuantity"
                      min="1"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="upload-actions space-between">
                  <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>
                    ← Back to File Upload
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Next: Review & Publish →
                  </button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="upload-step-form">
                <h2>Step 4: Final Preview & Publish</h2>
                <div className="preview-product-box">
                  <div className="preview-meta-badge">{formData.subject} • {formData.gradeLevel}</div>
                  <h3>{formData.title}</h3>
                  <p className="preview-short-desc">{formData.shortDescription || 'No summary provided.'}</p>
                  <p className="preview-long-desc">{formData.description}</p>
                  <div className="preview-details-grid">
                    <div><strong>Price:</strong> ${parseFloat(formData.price || 0).toFixed(2)}</div>
                    <div><strong>Format:</strong> {formData.format.toUpperCase()}</div>
                    <div><strong>Exam Year:</strong> {formData.examYear}</div>
                    <div><strong>Attached File:</strong> {formData.fileName || 'PDF Document'}</div>
                  </div>
                </div>

                <div className="upload-actions space-between">
                  <button type="button" className="btn btn-outline" onClick={() => setStep(3)}>
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Publishing...' : '🚀 Publish Material to Marketplace'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductUploadPage;
