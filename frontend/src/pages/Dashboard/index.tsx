import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BarChart3, UserCheck, PhoneCall, CheckCircle2 } from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { SearchBar } from '../../components/dashboard/SearchBar'
import { LeadsTable } from '../../components/dashboard/LeadsTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { TableSkeleton, CardSkeleton } from '../../components/common/SkeletonLoader'
import { getLeads, getDashboardStats } from '../../services/api'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const DashboardPage = () => {
  const [search, setSearch] = useState('')

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    retry: 1,
  })

  const { data: leads, isLoading: leadsLoading, isError: leadsError, refetch: refetchLeads } = useQuery({
    queryKey: ['leads', search],
    queryFn: () => getLeads(search),
    retry: 1,
  })

  const handleSearch = useCallback((query: string) => setSearch(query), [])

  return (
    <AdminLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">

        {/* Page Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track all incoming leads.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : statsError ? (
            <div className="col-span-4">
              <ErrorState message="Failed to load statistics." onRetry={refetchStats} />
            </div>
          ) : stats ? (
            <>
              <StatsCard title="Total Leads" value={stats.total} icon={BarChart3} color="slate" />
              <StatsCard title="New"          value={stats.new}       icon={UserCheck}    color="blue"  />
              <StatsCard title="Contacted"    value={stats.contacted} icon={PhoneCall}    color="amber" />
              <StatsCard title="Closed"       value={stats.closed}    icon={CheckCircle2} color="green" />
            </>
          ) : null}
        </motion.div>

        {/* Leads Panel */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm"
        >
          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-50">
            <div>
              <h2 className="text-base font-semibold text-slate-900">All Leads</h2>
              {leads && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
                  {search && <span> matching <span className="font-medium text-slate-600">"{search}"</span></span>}
                </p>
              )}
            </div>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Panel Content */}
          <div className="p-6">
            {leadsLoading ? (
              <TableSkeleton rows={5} />
            ) : leadsError ? (
              <ErrorState message="Failed to load leads." onRetry={refetchLeads} />
            ) : !leads || leads.length === 0 ? (
              <EmptyState
                title="No Leads Found"
                description={search ? 'Try a different search term' : 'No leads submitted yet'}
                onClear={search ? () => setSearch('') : undefined}
              />
            ) : (
              <LeadsTable leads={leads} />
            )}
          </div>
        </motion.div>

      </motion.div>
    </AdminLayout>
  )
}
