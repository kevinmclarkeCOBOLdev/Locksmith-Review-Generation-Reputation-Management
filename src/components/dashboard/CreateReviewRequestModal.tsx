'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  Search,
  MessageSquare,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import type { DeliveryChannel, ReviewTemplateItem } from '@/types/review';
import type { EligibleLeadItem } from '@/services/review.service';

export interface CreateReviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRequest: any) => void;
  initialLeadId?: string | null;
}

export function CreateReviewRequestModal({
  isOpen,
  onClose,
  onSuccess,
  initialLeadId,
}: CreateReviewRequestModalProps) {
  // State
  const [leads, setLeads] = useState<EligibleLeadItem[]>([]);
  const [templates, setTemplates] = useState<ReviewTemplateItem[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected State
  const [selectedLead, setSelectedLead] = useState<EligibleLeadItem | null>(null);
  const [channel, setChannel] = useState<DeliveryChannel>('sms');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  // Submission & Preview State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Fetch leads on modal open
  useEffect(() => {
    if (!isOpen) {
      setSelectedLead(null);
      setSearchQuery('');
      setErrorMessage(null);
      setDuplicateWarning(null);
      setUseCustomMessage(false);
      setCustomMessage('');
      setAllowDuplicate(false);
      return;
    }

    fetchLeads();
    fetchTemplates();
  }, [isOpen]);

  // If initialLeadId provided, auto-select it
  useEffect(() => {
    if (initialLeadId && leads.length > 0) {
      const match = leads.find((l) => l.id === initialLeadId);
      if (match) {
        handleSelectLead(match);
      }
    }
  }, [initialLeadId, leads]);

  const fetchLeads = async (search?: string, status?: string) => {
    setIsLoadingLeads(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status && status !== 'all') params.set('status', status);
      params.set('limit', '50');

      const res = await fetch(`/api/reviews/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data?.items) {
        setLeads(data.data.items);
      }
    } catch (err) {
      console.error('Failed to load eligible leads:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/reviews/templates');
      const data = await res.json();
      if (data.success && data.data) {
        setTemplates(data.data);
      }
    } catch (err) {
      console.error('Failed to load review templates:', err);
    }
  };

  const handleSelectLead = (lead: EligibleLeadItem) => {
    setSelectedLead(lead);
    setErrorMessage(null);

    // Auto-adjust channel based on available contacts
    if (lead.phone && !lead.email) {
      setChannel('sms');
    } else if (lead.email && !lead.phone) {
      setChannel('email');
    }

    if (lead.hasActiveRequest) {
      setDuplicateWarning(
        `A review request has already been created for this customer (${lead.lastRequestStatus?.toUpperCase() || 'ACTIVE'}).`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  // Filter templates for current channel
  const availableTemplates = useMemo(() => {
    if (channel === 'both') return templates;
    return templates.filter((t) => t.channel === channel);
  }, [templates, channel]);

  // Selected template object
  const activeTemplate = useMemo(() => {
    if (selectedTemplateId) {
      return templates.find((t) => t.id === selectedTemplateId);
    }
    return availableTemplates[0] || null;
  }, [selectedTemplateId, availableTemplates, templates]);

  // Live rendered preview
  const livePreview = useMemo(() => {
    const customerName = selectedLead?.name || 'Customer Name';
    const businessName = 'Atypikal Locksmith Services';
    const reviewLink = 'https://lockreview.atypikalstudio.dev/review/preview-token-xyz';

    let rawBody = '';
    if (useCustomMessage && customMessage.trim()) {
      rawBody = customMessage;
    } else if (activeTemplate) {
      rawBody = activeTemplate.bodyTemplate;
    } else {
      rawBody =
        channel === 'sms'
          ? 'Hi {customer_name}, thanks for choosing {business_name}! How was our service? Leave a quick review: {review_link}'
          : '<p>Hi {customer_name},</p><p>Thank you for choosing <strong>{business_name}</strong>. Please rate your experience: <a href="{review_link}">Leave Feedback</a></p>';
    }

    const rendered = rawBody
      .replace(/{customer_name}/g, customerName)
      .replace(/{business_name}/g, businessName)
      .replace(/{review_link}/g, reviewLink);

    let subject = activeTemplate?.subject || 'Feedback on your recent locksmith service';
    subject = subject
      .replace(/{customer_name}/g, customerName)
      .replace(/{business_name}/g, businessName);

    return {
      body: rendered,
      subject,
      charCount: rendered.length,
      smsSegments: Math.ceil(rendered.length / 160) || 1,
    };
  }, [selectedLead, channel, activeTemplate, useCustomMessage, customMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) {
      setErrorMessage('Please select a customer first.');
      return;
    }

    // Validation
    if ((channel === 'sms' || channel === 'both') && !selectedLead.phone) {
      setErrorMessage(`Customer ${selectedLead.name} has no phone number on record.`);
      return;
    }
    if ((channel === 'email' || channel === 'both') && !selectedLead.email) {
      setErrorMessage(`Customer ${selectedLead.name} has no email address on record.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        leadId: selectedLead.id,
        channel,
        templateId: selectedTemplateId || undefined,
        customMessage: useCustomMessage ? customMessage : undefined,
        allowDuplicate,
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.data?.code === 'DUPLICATE_REQUEST_DETECTED') {
          setDuplicateWarning(data.error);
        } else {
          setErrorMessage(data.error || 'Failed to create review request.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#E76A0E]" size={20} />
          <span>Create Review Request</span>
        </div>
      }
      description="Select an existing customer from the shared database, customize your message, and dispatch via SMS or Email."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Customer Selection & Channel Config */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1: Customer Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-[#E76A0E] text-white flex items-center justify-center text-[11px] font-black rounded-none">
                    1
                  </span>
                  Select Customer / Job
                </label>
                {selectedLead && (
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="text-[11px] font-bold text-[#E76A0E] hover:underline cursor-pointer"
                  >
                    Change Customer
                  </button>
                )}
              </div>

              {!selectedLead ? (
                <div className="space-y-2 border border-slate-200 dark:border-[#333333] p-3 bg-slate-50 dark:bg-[#202020]">
                  {/* Search and filter controls */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          fetchLeads(e.target.value, statusFilter);
                        }}
                        placeholder="Search name, phone, email, service..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-[#3a3a3a] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E76A0E]"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        fetchLeads(searchQuery, e.target.value);
                      }}
                      aria-label="Filter leads by status"
                      className="px-2 py-1.5 bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-[#3a3a3a] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E76A0E]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="completed">Completed Only</option>
                      <option value="booked">Booked</option>
                    </select>
                  </div>

                  {/* Leads List */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-200 dark:divide-[#2e2e2e] border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#181818]">
                    {isLoadingLeads ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        <RefreshCw size={16} className="animate-spin mx-auto mb-2 text-[#E76A0E]" />
                        Loading customers from database...
                      </div>
                    ) : leads.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-neutral-400">
                        No customers found matching search criteria.
                      </div>
                    ) : (
                      leads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => handleSelectLead(lead)}
                          className="p-2.5 hover:bg-orange-50 dark:hover:bg-[#252525] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {lead.name}
                              </span>
                              <Badge
                                variant={
                                  lead.status === 'completed'
                                    ? 'success'
                                    : lead.status === 'booked'
                                    ? 'info'
                                    : 'default'
                                }
                                className="text-[9px] py-0 px-1.5"
                              >
                                {lead.status}
                              </Badge>
                              {lead.hasActiveRequest && (
                                <Badge variant="warning" className="text-[9px] py-0 px-1.5">
                                  Already Sent
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                              {lead.serviceType} • {lead.phone || lead.email || lead.postcode}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0 text-xs px-2 py-1">
                            Select <ChevronRight size={12} />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Selected Lead Card */
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/50 flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <UserCheck className="text-emerald-600 dark:text-emerald-400 mt-0.5" size={18} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          {selectedLead.name}
                        </span>
                        <Badge variant="success" className="text-[9px] py-0 px-1.5">
                          {selectedLead.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-neutral-300 mt-1 space-y-0.5">
                        <div>
                          <strong>Service:</strong> {selectedLead.serviceType}
                        </div>
                        <div>
                          <strong>Phone:</strong> {selectedLead.phone || 'None'} |{' '}
                          <strong>Email:</strong> {selectedLead.email || 'None'}
                        </div>
                        <div>
                          <strong>Postcode:</strong> {selectedLead.postcode}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Channel Selection */}
            <div>
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 bg-[#E76A0E] text-white flex items-center justify-center text-[11px] font-black rounded-none">
                  2
                </span>
                Delivery Channel
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 text-left border cursor-pointer transition-all ${
                    channel === 'sms'
                      ? 'border-[#E76A0E] bg-orange-50/40 dark:bg-[#E76A0E]/10 text-slate-900 dark:text-white ring-1 ring-[#E76A0E]'
                      : 'border-slate-300 dark:border-[#333333] hover:border-slate-400 dark:hover:border-[#444] text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <Smartphone size={15} className="text-[#E76A0E]" />
                    SMS
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                    Highest open & click rate (Direct to mobile)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`p-3 text-left border cursor-pointer transition-all ${
                    channel === 'email'
                      ? 'border-[#E76A0E] bg-orange-50/40 dark:bg-[#E76A0E]/10 text-slate-900 dark:text-white ring-1 ring-[#E76A0E]'
                      : 'border-slate-300 dark:border-[#333333] hover:border-slate-400 dark:hover:border-[#444] text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <Mail size={15} className="text-[#E76A0E]" />
                    Email
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                    Branded HTML email with buttons
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('both')}
                  className={`p-3 text-left border cursor-pointer transition-all ${
                    channel === 'both'
                      ? 'border-[#E76A0E] bg-orange-50/40 dark:bg-[#E76A0E]/10 text-slate-900 dark:text-white ring-1 ring-[#E76A0E]'
                      : 'border-slate-300 dark:border-[#333333] hover:border-slate-400 dark:hover:border-[#444] text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <MessageSquare size={15} className="text-[#E76A0E]" />
                    Both
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                    Dispatches via SMS and Email
                  </p>
                </button>
              </div>
            </div>

            {/* Step 3: Template & Custom Message */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 bg-[#E76A0E] text-white flex items-center justify-center text-[11px] font-black rounded-none">
                  3
                </span>
                Template & Message Copy
              </label>

              {availableTemplates.length > 0 && (
                <Select
                  label="Review Template"
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setUseCustomMessage(false);
                  }}
                >
                  {availableTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.templateName} {tpl.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </Select>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomMessage}
                    onChange={(e) => setUseCustomMessage(e.target.checked)}
                    className="accent-[#E76A0E] cursor-pointer"
                  />
                  <span>Customize message copy for this request</span>
                </label>
              </div>

              {useCustomMessage && (
                <div className="space-y-2">
                  <Textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter custom message body..."
                    helperText="Placeholders: {customer_name}, {business_name}, {review_link}"
                  />
                </div>
              )}
            </div>

            {/* Duplicate Guard Alert */}
            {duplicateWarning && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Duplicate Review Request Warning</p>
                    <p className="mt-0.5 text-[11px]">{duplicateWarning}</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 pt-1 border-t border-amber-200 dark:border-amber-800/60 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDuplicate}
                    onChange={(e) => setAllowDuplicate(e.target.checked)}
                    className="accent-[#E76A0E] cursor-pointer"
                  />
                  <span>I understand and want to create a new review request anyway.</span>
                </label>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Dynamic Preview */}
          <div className="lg:col-span-5 flex flex-col">
            <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-[#E76A0E]" />
              Live Request Preview
            </label>

            <div className="flex-1 bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-[#2e2e2e] p-4 flex flex-col justify-between">
              {channel === 'sms' || channel === 'both' ? (
                /* Mobile Phone Frame Preview */
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2a2a2a] text-[11px] font-bold text-slate-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Smartphone size={13} /> SMS Preview
                    </span>
                    <span>{livePreview.charCount} chars ({livePreview.smsSegments} SMS)</span>
                  </div>

                  <div className="bg-slate-200/80 dark:bg-[#202020] p-3 border border-slate-300 dark:border-[#333] space-y-2">
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold text-center">
                      To: {selectedLead?.phone || '+44 7911 123456'}
                    </div>

                    {/* SMS Bubble */}
                    <div className="bg-[#E76A0E] text-white p-3 rounded-none text-xs leading-relaxed shadow-sm">
                      {livePreview.body}
                    </div>

                    <div className="text-[9px] text-right text-slate-400">Now • Delivered</div>
                  </div>
                </div>
              ) : null}

              {channel === 'email' || channel === 'both' ? (
                /* Email Window Preview */
                <div className={`space-y-3 ${channel === 'both' ? 'mt-4 pt-4 border-t border-slate-200 dark:border-[#2a2a2a]' : ''}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2a2a2a] text-[11px] font-bold text-slate-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} /> Email Preview
                    </span>
                    <span>To: {selectedLead?.email || 'customer@example.com'}</span>
                  </div>

                  <div className="bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#333333] p-4 text-xs space-y-3">
                    <div className="border-b border-slate-100 dark:border-[#2a2a2a] pb-2">
                      <span className="text-slate-400 text-[10px] font-bold">SUBJECT: </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {livePreview.subject}
                      </span>
                    </div>

                    <div
                      className="text-slate-700 dark:text-neutral-300 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: livePreview.body.includes('<')
                          ? livePreview.body
                          : `<p>${livePreview.body.replace(/\n/g, '<br/>')}</p>`,
                      }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#2a2a2a] text-[10px] text-slate-400 dark:text-neutral-500 flex items-center justify-between">
                <span>Unique Cryptographic Link: 64-char token</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} /> 1-Click Verification
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#2e2e2e]">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            type="submit"
            size="md"
            isLoading={isSubmitting}
            disabled={!selectedLead || (duplicateWarning !== null && !allowDuplicate)}
            className="flex items-center gap-2"
          >
            <Sparkles size={15} />
            Create & Dispatch Review Request
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
