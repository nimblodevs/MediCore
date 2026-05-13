import { useState } from 'react'
import { 
  Plus, Edit, Trash2, Save, X, Percent, DollarSign, Building, 
  FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Stethoscope, Syringe, ClipboardList, Activity, Pill, Microscope
} from 'lucide-react'

const SERVICE_POINTS = [
  { id: 'consultation', name: 'Consultation', icon: Stethoscope },
  { id: 'laboratory', name: 'Laboratory Tests', icon: Microscope },
  { id: 'radiology', name: 'Radiology/X-Ray', icon: Activity },
  { id: 'pharmacy', name: 'Pharmacy/Medication', icon: Pill },
  { id: 'surgery', name: 'Surgery', icon: Syringe },
  { id: 'inpatient', name: 'Inpatient/Hospital Stay', icon: ClipboardList },
]

const COPAYMENT_TYPES = [
  { value: 'percentage_global', label: 'Percentage (All Services)' },
  { value: 'fixed_global', label: 'Fixed Amount (All Services)' },
  { value: 'percentage_per_service', label: 'Percentage Per Service Point' },
  { value: 'fixed_per_service', label: 'Fixed Amount Per Service Point' },
  { value: 'mixed', label: 'Mixed (Different Categories)' },
]

const SchemeManagement = ({ companies, schemes, onAddScheme, onUpdateScheme, onDeleteScheme }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingSchemeId, setEditingSchemeId] = useState(null)
  const [expandedScheme, setExpandedScheme] = useState(null)
  
  const [newScheme, setNewScheme] = useState({
    name: '',
    companyId: '',
    description: '',
    copaymentType: 'percentage_global',
    copaymentValue: '',
    servicePointCopayments: [],
    isActive: true,
  })

  const resetForm = () => {
    setNewScheme({
      name: '',
      companyId: '',
      description: '',
      copaymentType: 'percentage_global',
      copaymentValue: '',
      servicePointCopayments: [],
      isActive: true,
    })
    setIsAdding(false)
    setEditingSchemeId(null)
  }

  const handleAddServicePointCopayment = () => {
    setNewScheme(prev => ({
      ...prev,
      servicePointCopayments: [
        ...prev.servicePointCopayments,
        { servicePointId: '', type: 'percentage', value: '' }
      ]
    }))
  }

  const handleRemoveServicePointCopayment = (index) => {
    setNewScheme(prev => ({
      ...prev,
      servicePointCopayments: prev.servicePointCopayments.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateServicePointCopayment = (index, field, value) => {
    setNewScheme(prev => ({
      ...prev,
      servicePointCopayments: prev.servicePointCopayments.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingSchemeId) {
      onUpdateScheme(editingSchemeId, newScheme)
    } else {
      onAddScheme(newScheme)
    }
    resetForm()
  }

  const handleEdit = (scheme) => {
    setNewScheme({
      name: scheme.name,
      companyId: scheme.companyId,
      description: scheme.description || '',
      copaymentType: scheme.copaymentType,
      copaymentValue: scheme.copaymentValue?.toString() || '',
      servicePointCopayments: scheme.servicePointCopayments || [],
      isActive: scheme.isActive,
    })
    setEditingSchemeId(scheme.id)
    setIsAdding(true)
  }

  const handleDelete = (schemeId) => {
    if (window.confirm('Are you sure you want to delete this scheme?')) {
      onDeleteScheme(schemeId)
    }
  }

  const handleExpandToggle = (schemeId) => {
    setExpandedScheme(expandedScheme === schemeId ? null : schemeId)
  }

  const getCopaymentDisplay = (scheme) => {
    switch (scheme.copaymentType) {
      case 'percentage_global':
        return `${scheme.copaymentValue}% on all services`
      case 'fixed_global':
        return `KES ${Number(scheme.copaymentValue).toLocaleString()} on all services`
      case 'percentage_per_service':
        return 'Percentage varies by service point'
      case 'fixed_per_service':
        return 'Fixed amounts vary by service point'
      case 'mixed':
        return 'Mixed copayment categories'
      default:
        return 'No copayment configured'
    }
  }

  const getServicePointName = (id) => {
    return SERVICE_POINTS.find(sp => sp.id === id)?.name || id
  }

  const getServicePointIcon = (id) => {
    const sp = SERVICE_POINTS.find(sp => sp.id === id)
    const IconComponent = sp?.icon || FileText
    return <IconComponent size={14} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheme Management</h1>
          <p className="mt-1 text-sm text-slate-500">Configure insurance schemes and copayment structures</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition-all hover:from-cyan-700 hover:to-cyan-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25"
        >
          <Plus size={18} />
          Add New Scheme
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingSchemeId ? 'Edit Scheme' : 'Add New Scheme'}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Scheme Name *
                </label>
                <input
                  type="text"
                  required
                  value={newScheme.name}
                  onChange={(e) => setNewScheme(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-cyan-500/20"
                  placeholder="e.g., Premium Health Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company *
                </label>
                <select
                  required
                  value={newScheme.companyId}
                  onChange={(e) => setNewScheme(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-cyan-500/20"
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={newScheme.description}
                onChange={(e) => setNewScheme(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-cyan-500/20"
                placeholder="Brief description of the scheme..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Copayment Type *
                </label>
                <select
                  value={newScheme.copaymentType}
                  onChange={(e) => setNewScheme(prev => ({ 
                    ...prev, 
                    copaymentType: e.target.value,
                    servicePointCopayments: []
                  }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-cyan-500/20"
                >
                  {COPAYMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {(newScheme.copaymentType === 'percentage_global' || newScheme.copaymentType === 'fixed_global') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {newScheme.copaymentType === 'percentage_global' ? 'Percentage (%)' : 'Fixed Amount (KES)'} *
                  </label>
                  <div className="relative">
                    {newScheme.copaymentType === 'percentage_global' ? (
                      <Percent className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    ) : (
                      <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    )}
                    <input
                      type="number"
                      required
                      min="0"
                      step={newScheme.copaymentType === 'percentage_global' ? "0.1" : "1"}
                      value={newScheme.copaymentValue}
                      onChange={(e) => setNewScheme(prev => ({ ...prev, copaymentValue: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pl-10 text-sm text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-cyan-500/20"
                      placeholder={newScheme.copaymentType === 'percentage_global' ? "10" : "500"}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Service Point Specific Copayments */}
            {(newScheme.copaymentType === 'percentage_per_service' || 
              newScheme.copaymentType === 'fixed_per_service' || 
              newScheme.copaymentType === 'mixed') && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Service Point Copayments</h3>
                  <button
                    type="button"
                    onClick={handleAddServicePointCopayment}
                    className="inline-flex items-center gap-1 rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyan-700"
                  >
                    <Plus size={14} />
                    Add Service Point
                  </button>
                </div>

                {newScheme.servicePointCopayments.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No service points added yet</p>
                ) : (
                  <div className="space-y-3">
                    {newScheme.servicePointCopayments.map((spCopay, index) => (
                      <div key={index} className="flex flex-wrap items-end gap-3 rounded-md bg-white p-3 border border-slate-200">
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Service Point
                          </label>
                          <select
                            value={spCopay.servicePointId}
                            onChange={(e) => handleUpdateServicePointCopayment(index, 'servicePointId', e.target.value)}
                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          >
                            <option value="">Select Service</option>
                            {SERVICE_POINTS.map(sp => (
                              <option key={sp.id} value={sp.id}>{sp.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Type
                          </label>
                          <select
                            value={spCopay.type}
                            onChange={(e) => handleUpdateServicePointCopayment(index, 'type', e.target.value)}
                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>

                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Value
                          </label>
                          <div className="relative">
                            {spCopay.type === 'percentage' ? (
                              <Percent className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                            ) : (
                              <DollarSign className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                            )}
                            <input
                              type="number"
                              min="0"
                              step={spCopay.type === 'percentage' ? "0.1" : "1"}
                              value={spCopay.value}
                              onChange={(e) => handleUpdateServicePointCopayment(index, 'value', e.target.value)}
                              className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-2 pl-7 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                              placeholder={spCopay.type === 'percentage' ? "10" : "500"}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveServicePointCopayment(index)}
                          className="rounded-md p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newScheme.isActive}
                onChange={(e) => setNewScheme(prev => ({ ...prev, isActive: e.target.checked }))}
                className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Active Scheme
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition-all hover:from-cyan-700 hover:to-cyan-600"
              >
                <Save size={18} />
                {editingSchemeId ? 'Update Scheme' : 'Create Scheme'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schemes List */}
      <div className="space-y-3">
        {schemes.map((scheme) => {
          const company = companies.find(c => c.id === scheme.companyId)
          const isExpanded = expandedScheme === scheme.id

          return (
            <div
              key={scheme.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${scheme.isActive ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{scheme.name}</h3>
                        <p className="text-xs text-slate-500">{company?.name || 'Unknown Company'}</p>
                      </div>
                      {scheme.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          Inactive
                        </span>
                      )}
                    </div>

                    {scheme.description && (
                      <p className="mt-2 text-sm text-slate-600">{scheme.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building size={14} className="text-slate-400" />
                        <span className="text-slate-600">Copayment:</span>
                        <span className="font-medium text-cyan-600">{getCopaymentDisplay(scheme)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExpandToggle(scheme.id)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                      onClick={() => handleEdit(scheme)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(scheme.id)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">Service Point Details</h4>
                  
                  {scheme.servicePointCopayments && scheme.servicePointCopayments.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {scheme.servicePointCopayments.map((spCopay, index) => {
                        const IconComponent = SERVICE_POINTS.find(sp => sp.id === spCopay.servicePointId)?.icon || FileText
                        return (
                          <div key={index} className="flex items-center gap-3 rounded-lg bg-white p-3 border border-slate-200">
                            <div className="flex size-8 items-center justify-center rounded-md bg-cyan-100 text-cyan-600">
                              <IconComponent size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">
                                {getServicePointName(spCopay.servicePointId)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {spCopay.type === 'percentage' ? `${spCopay.value}%` : `KES ${Number(spCopay.value).toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <AlertCircle size={16} />
                      <p>No specific service point copayments configured</p>
                    </div>
                  )}

                  {(scheme.copaymentType === 'percentage_global' || scheme.copaymentType === 'fixed_global') && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-100">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This copayment applies to ALL service points uniformly.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {schemes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-slate-200 bg-white">
            <FileText size={48} className="text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-500">No schemes found</p>
            <p className="mt-1 text-xs text-slate-400">Create your first scheme to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SchemeManagement
