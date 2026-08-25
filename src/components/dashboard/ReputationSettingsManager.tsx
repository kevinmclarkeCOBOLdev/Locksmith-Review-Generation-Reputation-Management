'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import {
  Globe,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Mail,
  Smartphone,
  Layers,
  Clock,
} from 'lucide-react';
import type { TenantReputationSettingsResult, PlatformSettingItem } from '@/services/settings.service';

export interface ReputationSettingsManagerProps {
  initialSettings: TenantReputationSettingsResult;
}

export function ReputationSettingsManager({ initialSettings }: ReputationSettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'platforms' | 'rules' | 'templates'>('platforms');

  // Platform state
  const [platforms, setPlatforms] = useState<PlatformSettingItem[]>(initialSettings.platforms);
  const [isSavingPlatforms, setIsSavingPlatforms] = useState(false);
  const [platformToast, setPlatformToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Template state
  const [activeTemplateChannel, setActiveTemplateChannel] = useState<'sms' | 'email'>('sms');
  const [smsBody, setSmsBody] = useState(
    initialSettings.templates.find((t) => t.channel === 'sms')?.bodyTemplate ||
      'Hi {customer_name}, thank you for choosing {business_name}! Could you take 30 seconds to share how we did? {review_link}'
  );
  const [emailSubject, setEmailSubject] = useState(
    initialSettings.templates.find((t) => t.channel === 'email')?.subject ||
      'How was your locksmith service with {business_name}?'
  );
  const [emailBody, setEmailBody] = useState(
    initialSettings.templates.find((t) => t.channel === 'email')?.bodyTemplate ||
      'Hi {customer_name},\n\nThank you for choosing {business_name} for your recent service. Customer satisfaction is our top priority.\n\nPlease take 30 seconds to leave us a rating:\n{review_link}\n\nBest regards,\nThe {business_name} Team'
  );
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateToast, setTemplateToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Rule state
  const [defaultChannel, setDefaultChannel] = useState<'sms' | 'email' | 'both'>(
    initialSettings.preferences.defaultChannel
  );
  const [expirationDays, setExpirationDays] = useState<number>(initialSettings.preferences.expirationDays);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [rulesToast, setRulesToast] = useState<string | null>(null);

  // Handlers: Platforms
  const handlePlatformChange = (platformName: string, field: 'destinationUrl' | 'isEnabled', value: any) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.platformName === platformName ? { ...p, [field]: value } : p))
    );
  };

  const handleSavePlatforms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlatforms(true);
    setPlatformToast(null);

    try {
      const res = await fetch('/api/settings/reputation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: platforms.map((p) => ({
            platformName: p.platformName,
            destinationUrl: p.destinationUrl,
            isEnabled: p.isEnabled,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update platform settings');
      }

      setPlatformToast({ type: 'success', message: 'Platform review links saved successfully!' });
    } catch (err: any) {
      setPlatformToast({ type: 'error', message: err.message });
    } finally {
      setIsSavingPlatforms(false);
      setTimeout(() => setPlatformToast(null), 4500);
    }
  };

  // Handlers: Templates
  const handleInsertToken = (token: string, channel: 'sms' | 'email', target: 'body' | 'subject' = 'body') => {
    if (channel === 'sms') {
      setSmsBody((prev) => prev + ' ' + token);
    } else if (channel === 'email') {
      if (target === 'subject') {
        setEmailSubject((prev) => prev + ' ' + token);
      } else {
        setEmailBody((prev) => prev + ' ' + token);
      }
    }
  };

  const handleSaveTemplate = async (channel: 'sms' | 'email') => {
    setIsSavingTemplate(true);
    setTemplateToast(null);

    try {
      const payload = {
        channel,
        templateName: `Default ${channel.toUpperCase()} Template`,
        subject: channel === 'email' ? emailSubject : undefined,
        bodyTemplate: channel === 'sms' ? smsBody : emailBody,
        isDefault: true,
      };

      const res = await fetch('/api/settings/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save template');
      }

      setTemplateToast({ type: 'success', message: `${channel.toUpperCase()} template saved successfully!` });
    } catch (err: any) {
      setTemplateToast({ type: 'error', message: err.message });
    } finally {
      setIsSavingTemplate(false);
      setTimeout(() => setTemplateToast(null), 4500);
    }
  };

  // Live Token Replacement for Preview
  const renderPreview = (text: string) => {
    return text
      .replace(/{customer_name}/g, 'Sarah Connor')
      .replace(/{business_name}/g, initialSettings.businessName)
      .replace(/{review_link}/g, 'https://lockreview.atypikalstudio.dev/review/54d913a932c0a85a');
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#333333] pb-2">
        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-2 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'platforms'
              ? 'bg-[#E76A0E] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-neutral-300 hover:bg-slate-200'
          }`}
        >
          <Globe size={14} />
          <span>Review Destinations</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-[#E76A0E] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-neutral-300 hover:bg-slate-200'
          }`}
        >
          <Layers size={14} />
          <span>Request Rules & Expiry</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-[#E76A0E] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-neutral-300 hover:bg-slate-200'
          }`}
        >
          <MessageSquare size={14} />
          <span>Review Message Templates</span>
        </button>
      </div>

      {/* TAB 1: REVIEW DESTINATIONS (Google, Trustpilot, Facebook, Checkatrade) */}
      {activeTab === 'platforms' && (
        <Card className="border border-slate-200 dark:border-[#333333] p-6 bg-white dark:bg-[#1a1a1a] space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe size={18} className="text-[#E76A0E]" />
              <span>Public Review Destinations</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Configure where satisfied 4–5 star customers are directed. Google Reviews is your primary destination for local Google Maps pack SEO.
            </p>
          </div>

          {platformToast && (
            <div
              className={`p-3 text-xs flex items-center gap-2 border ${
                platformToast.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {platformToast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{platformToast.message}</span>
            </div>
          )}

          <form onSubmit={handleSavePlatforms} className="space-y-6">
            <div className="space-y-4">
              {platforms.map((platform) => (
                <div
                  key={platform.platformName}
                  className="p-4 border border-slate-200 dark:border-[#2e2e2e] bg-slate-50/60 dark:bg-[#202020] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {platform.label}
                      </span>
                      {platform.isPrimary && (
                        <Badge variant="success" className="text-[10px] uppercase font-bold">
                          Primary Platform
                        </Badge>
                      )}
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platform.isEnabled}
                        onChange={(e) =>
                          handlePlatformChange(platform.platformName, 'isEnabled', e.target.checked)
                        }
                        className="text-[#E76A0E] focus:ring-[#E76A0E]"
                      />
                      <span>{platform.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="url"
                      placeholder={`https://${platform.platformName}.com/...`}
                      value={platform.destinationUrl}
                      onChange={(e) =>
                        handlePlatformChange(platform.platformName, 'destinationUrl', e.target.value)
                      }
                      disabled={!platform.isEnabled}
                      className="text-xs bg-white dark:bg-[#161616]"
                    />
                    {platform.destinationUrl && (
                      <a
                        href={platform.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 border border-slate-300 dark:border-[#3a3a3a] hover:bg-slate-100 dark:hover:bg-[#282828] text-xs font-semibold flex items-center gap-1.5 shrink-0"
                        title="Test link destination"
                      >
                        <ExternalLink size={13} />
                        <span>Test</span>
                      </a>
                    )}
                  </div>

                  {platform.platformName === 'google' && (
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 space-y-1 bg-white dark:bg-[#181818] p-2.5 border border-slate-200 dark:border-[#2e2e2e]">
                      <span className="font-bold text-slate-700 dark:text-neutral-300 block">
                        💡 How to get your Google Review link:
                      </span>
                      <p>
                        Search for your business on Google Maps, click &ldquo;Ask for reviews&rdquo;, and copy the short URL (e.g. <code className="font-mono text-[#E76A0E]">https://g.page/r/.../review</code>).
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSavingPlatforms}
                className="flex items-center gap-2 font-bold cursor-pointer"
              >
                <Save size={15} />
                <span>{isSavingPlatforms ? 'Saving Platform Links...' : 'Save Review Destinations'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: REQUEST RULES & EXPIRATION */}
      {activeTab === 'rules' && (
        <Card className="border border-slate-200 dark:border-[#333333] p-6 bg-white dark:bg-[#1a1a1a] space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={18} className="text-[#E76A0E]" />
              <span>Review Request Rules & Behavior</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Configure default channels, expiration windows, and safety limits for review dispatch.
            </p>
          </div>

          {rulesToast && (
            <div className="p-3 text-xs flex items-center gap-2 border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 size={14} />
              <span>{rulesToast}</span>
            </div>
          )}

          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50/60 dark:bg-[#202020] border border-slate-200 dark:border-[#2e2e2e] space-y-2">
              <label className="font-bold text-slate-900 dark:text-white block text-sm">
                Default Delivery Channel
              </label>
              <p className="text-slate-500 text-xs">
                When creating review requests without explicit channel override, dispatch via:
              </p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {(['sms', 'email', 'both'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setDefaultChannel(ch)}
                    className={`p-3 border font-bold flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer ${
                      defaultChannel === ch
                        ? 'border-[#E76A0E] bg-orange-50/50 dark:bg-orange-950/30 text-[#E76A0E]'
                        : 'border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#161616] text-slate-700 dark:text-neutral-300'
                    }`}
                  >
                    {ch === 'sms' && <Smartphone size={15} />}
                    {ch === 'email' && <Mail size={15} />}
                    {ch === 'both' && <MessageSquare size={15} />}
                    <span>{ch}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50/60 dark:bg-[#202020] border border-slate-200 dark:border-[#2e2e2e] space-y-2">
              <label className="font-bold text-slate-900 dark:text-white block text-sm">
                Review Token Expiration Window
              </label>
              <p className="text-slate-500 text-xs">
                How long a secure review link remains active before expiring:
              </p>
              <div className="grid grid-cols-4 gap-3 pt-1">
                {[7, 14, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExpirationDays(days)}
                    className={`p-3 border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      expirationDays === days
                        ? 'border-[#E76A0E] bg-orange-50/50 dark:bg-orange-950/30 text-[#E76A0E]'
                        : 'border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#161616] text-slate-700 dark:text-neutral-300'
                    }`}
                  >
                    <Clock size={14} />
                    <span>{days} Days</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50/60 dark:bg-[#202020] border border-slate-200 dark:border-[#2e2e2e] space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                🛡️ Anti-Fatigue & Duplicate Guard
              </span>
              <p className="text-slate-600 dark:text-neutral-400">
                LockReview automatically prevents duplicate review requests from being dispatched to the same customer within 14 days unless explicitly overridden by an admin.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setIsSavingRules(true);
                  setTimeout(() => {
                    setIsSavingRules(false);
                    setRulesToast('Review rules updated successfully.');
                    setTimeout(() => setRulesToast(null), 4000);
                  }, 400);
                }}
                disabled={isSavingRules}
                className="flex items-center gap-2 font-bold cursor-pointer"
              >
                <Save size={15} />
                <span>{isSavingRules ? 'Saving...' : 'Save Request Rules'}</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: MESSAGE TEMPLATES (SMS & Email) */}
      {activeTab === 'templates' && (
        <Card className="border border-slate-200 dark:border-[#333333] p-6 bg-white dark:bg-[#1a1a1a] space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-[#E76A0E]" />
              <span>Review Request Templates</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Customize the messages dispatched to customers via SMS and Email. Use dynamic tokens to personalize content.
            </p>
          </div>

          {templateToast && (
            <div
              className={`p-3 text-xs flex items-center gap-2 border ${
                templateToast.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {templateToast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{templateToast.message}</span>
            </div>
          )}

          {/* Template Channel Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2a2a2a] pb-2">
            <button
              onClick={() => setActiveTemplateChannel('sms')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTemplateChannel === 'sms'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                  : 'bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-neutral-300'
              }`}
            >
              <Smartphone size={13} />
              <span>SMS Template</span>
            </button>
            <button
              onClick={() => setActiveTemplateChannel('email')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTemplateChannel === 'email'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                  : 'bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-neutral-300'
              }`}
            >
              <Mail size={13} />
              <span>Email Template</span>
            </button>
          </div>

          {/* Dynamic Token Chips */}
          <div className="p-3 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#2e2e2e] space-y-1.5 text-xs">
            <span className="font-bold text-slate-700 dark:text-neutral-300 text-[11px] block">
              Available Dynamic Variable Tokens (Click to insert):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {['{customer_name}', '{business_name}', '{review_link}'].map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => handleInsertToken(token, activeTemplateChannel)}
                  className="px-2 py-1 bg-white dark:bg-[#161616] border border-slate-300 dark:border-[#3a3a3a] text-xs font-mono font-bold text-[#E76A0E] hover:bg-orange-50 dark:hover:bg-[#2a221a] cursor-pointer"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* SMS Template Editor */}
          {activeTemplateChannel === 'sms' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  SMS Message Body:
                </label>
                <Textarea
                  rows={6}
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  className="text-xs bg-white dark:bg-[#161616]"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Character count: {smsBody.length} chars (~{Math.ceil(smsBody.length / 160)} SMS segment)</span>
                </div>
                <Button
                  onClick={() => handleSaveTemplate('sms')}
                  disabled={isSavingTemplate}
                  className="flex items-center gap-2 font-bold cursor-pointer"
                >
                  <Save size={14} />
                  <span>{isSavingTemplate ? 'Saving...' : 'Save SMS Template'}</span>
                </Button>
              </div>

              {/* Live Preview */}
              <div className="p-4 bg-slate-100 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  📱 Live Customer SMS Preview
                </span>
                <div className="bg-emerald-600 text-white p-3 rounded-none text-xs leading-relaxed shadow-sm font-sans">
                  {renderPreview(smsBody)}
                </div>
              </div>
            </div>
          )}

          {/* Email Template Editor */}
          {activeTemplateChannel === 'email' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Email Subject Line:
                  </label>
                  <Input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="text-xs bg-white dark:bg-[#161616]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Email Body:
                  </label>
                  <Textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="text-xs bg-white dark:bg-[#161616]"
                  />
                </div>

                <Button
                  onClick={() => handleSaveTemplate('email')}
                  disabled={isSavingTemplate}
                  className="flex items-center gap-2 font-bold cursor-pointer"
                >
                  <Save size={14} />
                  <span>{isSavingTemplate ? 'Saving...' : 'Save Email Template'}</span>
                </Button>
              </div>

              {/* Live Email Preview */}
              <div className="p-4 bg-slate-100 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a] space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  ✉️ Live Customer Email Preview
                </span>
                <div className="bg-white dark:bg-[#1f1f1f] p-4 border border-slate-200 dark:border-[#333333] space-y-3 text-slate-800 dark:text-neutral-200">
                  <div className="border-b border-slate-100 dark:border-[#2e2e2e] pb-2">
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">
                      Subject: {renderPreview(emailSubject)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      From: {initialSettings.businessName} &lt;reviews@atypikalstudio.dev&gt;
                    </span>
                  </div>
                  <div className="whitespace-pre-line text-xs leading-relaxed">
                    {renderPreview(emailBody)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
