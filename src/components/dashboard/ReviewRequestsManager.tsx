'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Search,
  Smartphone,
  Mail,
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { CreateReviewRequestModal } from './CreateReviewRequestModal';
import { ReviewRequestDetailModal } from './ReviewRequestDetailModal';
import type { ReviewRequestItem, ReviewRequestStatus } from '@/types/review';

export interface ReviewRequestsManagerProps {
  initialRequests: ReviewRequestItem[];
  initialTotal: number;
  initialPage?: number;
  initialLimit?: number;
  tenantName: string;
}

export function ReviewRequestsManager({
  initialRequests,
  initialTotal,
  initialPage = 1,
  initialLimit = 20,
  tenantName,
}: ReviewRequestsManagerProps) {
  const [requests, setRequests] = useState<ReviewRequestItem[]>(initialRequests);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Modals & Actions
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<ReviewRequestItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResend = async (requestId: string, customerName?: string) => {
    setResendingId(requestId);
    try {
      const res = await fetch(`/api/reviews/${requestId}/retry`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(`Review request re-dispatched to ${customerName || 'customer'}!`);
        fetchRequests(page, search, statusFilter, channelFilter);
      } else {
        setToastMessage(`Failed to resend: ${data.error || 'Delivery failed'}`);
      }
    } catch (err: any) {
      setToastMessage(`Failed to resend: ${err.message}`);
    } finally {
      setResendingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const fetchRequests = useCallback(
    async (currentPage = page, currentSearch = search, currentStatus = statusFilter, currentChannel = channelFilter) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', limit.toString());
        if (currentSearch.trim()) params.set('search', currentSearch.trim());
        if (currentStatus !== 'all') params.set('status', currentStatus);
        if (currentChannel !== 'all') params.set('channel', currentChannel);

        const res = await fetch(`/api/reviews?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.data) {
          setRequests(data.data.items || []);
          setTotal(data.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch review requests:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, search, statusFilter, channelFilter, limit]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchRequests(1, val, statusFilter, channelFilter);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatusFilter(val);
    setPage(1);
    fetchRequests(1, search, val, channelFilter);
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setChannelFilter(val);
    setPage(1);
    fetchRequests(1, search, statusFilter, val);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchRequests(newPage, search, statusFilter, channelFilter);
  };

  const handleCreateSuccess = (newRequest: ReviewRequestItem) => {
    setToastMessage(`Review request created successfully for ${newRequest.customerName || 'customer'}!`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchRequests(1, search, statusFilter, channelFilter);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const renderStatusBadge = (status: ReviewRequestStatus, rating?: number | null) => {
    switch (status) {
      case 'positive':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Star size={10} className="fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />
            Positive ({rating || 5}★)
          </Badge>
        );
      case 'negative':
        return (
          <Badge variant="warning">
            Private ({rating || 3}★)
          </Badge>
        );
      case 'responded':
        return (
          <Badge variant="success">
            Responded ({rating ? `${rating}★` : ''})
          </Badge>
        );
      case 'delivered':
        return <Badge variant="info">Delivered</Badge>;
      case 'sent':
        return <Badge variant="info">Sent</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#333333]">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Review Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Manage, dispatch and track SMS & Email review requests for <strong>{tenantName}</strong>.
          </p>
        </div>

        <Button
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          className="font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          Create Review Request
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333333]">
        {/* Search */}
        <div className="md:col-span-6 relative flex items-center">
          <Search size={15} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by customer name, phone, email, or service..."
            className="w-full pl-9 pr-3 py-2 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none border border-slate-200 dark:border-[#333333] focus:border-[#E76A0E]"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            aria-label="Filter by status"
            className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333333] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E76A0E]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="responded">Responded</option>
            <option value="positive">Positive (4–5★)</option>
            <option value="negative">Private Feedback (1–3★)</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Channel Filter */}
        <div className="md:col-span-3 flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={handleChannelChange}
            aria-label="Filter by channel"
            className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333333] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E76A0E]"
          >
            <option value="all">All Channels</option>
            <option value="sms">SMS Only</option>
            <option value="email">Email Only</option>
            <option value="both">Both (SMS + Email)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRequests(page, search, statusFilter, channelFilter)}
            disabled={isLoading}
            className="p-2 shrink-0"
            title="Refresh List"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#E76A0E]' : ''} />
          </Button>
        </div>
      </div>

      {/* Main Review Requests Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#202020] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Service Type</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created / Sent</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#2e2e2e]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#E76A0E]" />
                    <span>Loading review requests...</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Inbox size={32} className="mx-auto text-slate-400 mb-2 opacity-60" />
                    <p className="font-bold text-slate-700 dark:text-neutral-300">No review requests found</p>
                    <p className="text-slate-500 dark:text-neutral-400 text-xs mt-1">
                      {search || statusFilter !== 'all' || channelFilter !== 'all'
                        ? 'Try adjusting your search query or filters.'
                        : 'Create your first review request to start gathering positive customer feedback.'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Create Review Request
                    </Button>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-[#222222] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {req.customerName || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-neutral-300">
                      {req.customerPhone || req.customerEmail || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-neutral-400">
                      {req.serviceType || 'Locksmith Service'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold uppercase text-[10px] inline-flex items-center gap-1 text-slate-700 dark:text-neutral-300">
                        {req.channel === 'sms' && <Smartphone size={12} className="text-[#E76A0E]" />}
                        {req.channel === 'email' && <Mail size={12} className="text-[#E76A0E]" />}
                        {req.channel === 'both' && <MessageSquare size={12} className="text-[#E76A0E]" />}
                        {req.channel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(req.status, req.rating)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-neutral-400 text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleResend(req.id, req.customerName)}
                        disabled={resendingId === req.id}
                        className="text-xs font-bold text-slate-600 dark:text-neutral-400 hover:text-[#E76A0E] hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {resendingId === req.id ? 'Sending...' : 'Resend'}
                      </button>
                      <button
                        onClick={() => setSelectedRequestForDetail(req)}
                        className="text-xs font-bold text-[#E76A0E] hover:underline cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination Bar */}
        {total > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-[#2e2e2e] text-xs text-slate-500 dark:text-neutral-400">
            <div>
              Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(page * limit, total)}
              </span>{' '}
              of <span className="font-bold text-slate-900 dark:text-white">{total}</span> requests
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => handlePageChange(page - 1)}
                className="flex items-center gap-1 text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <span className="font-bold text-slate-900 dark:text-white">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => handlePageChange(page + 1)}
                className="flex items-center gap-1 text-xs"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Creation Modal */}
      <CreateReviewRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Detail Modal */}
      <ReviewRequestDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
      />
    </div>
  );
}
