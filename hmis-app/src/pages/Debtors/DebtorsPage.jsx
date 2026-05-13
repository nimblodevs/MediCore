import { useState } from 'react'
import { Search, Filter, Download, Eye, Edit, Trash2, Phone, Mail, MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react'

const DebtorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [debtors] = useState([
    {
      id: 'DBT001',
      patientName: 'John Kamau',
      patientId: 'PT-2024-001',
      phone: '+254 712 345 678',
      email: 'john.kamau@email.com',
      address: 'Nairobi, Kenya',
      registrationDate: '2024-01-15',
      totalAmount: 15000,
      paidAmount: 5000,
      outstandingAmount: 10000,
      dueDate: '2024-02-15',
      status: 'overdue',
      services: ['Consultation', 'Laboratory Tests', 'Medication'],
    },
    {
      id: 'DBT002',
      patientName: 'Mary Wanjiku',
      patientId: 'PT-2024-002',
      phone: '+254 723 456 789',
      email: 'mary.wanjiku@email.com',
      address: 'Mombasa, Kenya',
      registrationDate: '2024-01-20',
      totalAmount: 25000,
      paidAmount: 15000,
      outstandingAmount: 10000,
      dueDate: '2024-03-01',
      status: 'pending',
      services: ['Surgery', 'Hospital Stay', 'Medication'],
    },
    {
      id: 'DBT003',
      patientName: 'Peter Ochieng',
      patientId: 'PT-2024-003',
      phone: '+254 734 567 890',
      email: 'peter.ochieng@email.com',
      address: 'Kisumu, Kenya',
      registrationDate: '2024-02-01',
      totalAmount: 8000,
      paidAmount: 6000,
      outstandingAmount: 2000,
      dueDate: '2024-03-15',
      status: 'current',
      services: ['Consultation', 'X-Ray'],
    },
    {
      id: 'DBT004',
      patientName: 'Grace Akinyi',
      patientId: 'PT-2024-004',
      phone: '+254 745 678 901',
      email: 'grace.akinyi@email.com',
      address: 'Nakuru, Kenya',
      registrationDate: '2024-02-10',
      totalAmount: 35000,
      paidAmount: 10000,
      outstandingAmount: 25000,
      dueDate: '2024-02-28',
      status: 'overdue',
      services: ['Emergency Care', 'Surgery', 'ICU Stay', 'Medication'],
    },
    {
      id: 'DBT005',
      patientName: 'David Mutua',
      patientId: 'PT-2024-005',
      phone: '+254 756 789 012',
      email: 'david.mutua@email.com',
      address: 'Eldoret, Kenya',
      registrationDate: '2024-02-15',
      totalAmount: 12000,
      paidAmount: 8000,
      outstandingAmount: 4000,
      dueDate: '2024-03-20',
      status: 'pending',
      services: ['Laboratory Tests', 'Consultation'],
    },
  ])

  const filteredDebtors = debtors.filter((debtor) => {
    const matchesSearch =
      debtor.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtor.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtor.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' || debtor.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const totalOutstanding = debtors.reduce((sum, debtor) => sum + debtor.outstandingAmount, 0)
  const totalOverdue = debtors.filter((d) => d.status === 'overdue').reduce((sum, debtor) => sum + debtor.outstandingAmount, 0)

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'current':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Debtors Management</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage outstanding patient payments</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition-all hover:from-cyan-700 hover:to-cyan-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Total Debtors</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{debtors.length}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Total Outstanding</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totalOutstanding)}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Overdue Amount</p>
              <p className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/25">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Overdue Cases</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{debtors.filter((d) => d.status === 'overdue').length}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25">
              <Calendar size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, patient ID or debtor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-cyan-500/20"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-cyan-500/20"
              >
                <option value="all">All Status</option>
                <option value="current">Current</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Debtors Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Debtor Info</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Contact</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Services</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Amounts</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Due Date</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Status</th>
                <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredDebtors.map((debtor) => (
                <tr key={debtor.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{debtor.patientName}</p>
                      <p className="text-xs text-slate-500">{debtor.patientId}</p>
                      <p className="text-xs text-slate-400">{debtor.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Phone size={12} className="text-slate-400" />
                        {debtor.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail size={12} className="text-slate-400" />
                        {debtor.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin size={12} className="text-slate-400" />
                        {debtor.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {debtor.services.map((service, index) => (
                        <span
                          key={index}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">Total: <span className="font-medium text-slate-700">{formatCurrency(debtor.totalAmount)}</span></div>
                      <div className="text-xs text-slate-500">Paid: <span className="font-medium text-green-600">{formatCurrency(debtor.paidAmount)}</span></div>
                      <div className="text-xs text-slate-500">Outstanding: <span className="font-bold text-red-600">{formatCurrency(debtor.outstandingAmount)}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Calendar size={14} className="text-slate-400" />
                      {debtor.dueDate}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(debtor.status)}`}>
                      {debtor.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-cyan-50 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/20">
                        <Eye size={18} />
                      </button>
                      <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-500/20">
                        <Edit size={18} />
                      </button>
                      <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-red-500/20">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDebtors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle size={48} className="text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-500">No debtors found</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DebtorsPage
