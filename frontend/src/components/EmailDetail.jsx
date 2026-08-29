import React from 'react';
import { ArrowLeft, Star, Trash2, ExternalLink, Mail, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function EmailDetail({ recipient, onBack }) {
  const { user } = useAuth();
  if (!recipient) return null;

  const campaignName = recipient.campaign?.name || 'Email Campaign';
  const email = recipient.email;
  const sentAt = recipient.sentAt ? new Date(recipient.sentAt).toLocaleString() : (recipient.campaign?.scheduledAt ? new Date(recipient.campaign.scheduledAt).toLocaleString() : 'Scheduled');
  const previewUrl = recipient.etherealPreviewUrl;
  const status = recipient.status || 'PENDING';
  const senderEmail = user?.email || 'me';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {campaignName}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <button className="hover:text-amber-400 transition-colors"><Star className="h-5 w-5" /></button>
          <button className="hover:text-red-500 transition-colors"><Trash2 className="h-5 w-5" /></button>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
            {senderEmail.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Recipient Details */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
            {email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">To: {email}</span>
            </div>
            <span className="text-xs text-gray-400">From: {senderEmail}</span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="text-xs text-gray-400 block">{sentAt}</span>
          {status === 'SENT' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" /> Sent
            </span>
          )}
          {status === 'PENDING' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
              <Clock className="h-3.5 w-3.5" /> Pending
            </span>
          )}
          {status === 'FAILED' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
              <XCircle className="h-3.5 w-3.5" /> Failed
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Email Body */}
      <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50 space-y-3 text-sm text-gray-800 leading-relaxed">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pb-2 border-b border-gray-200/60">
          <Mail className="h-4 w-4 text-blue-600" />
          <span>Message Body for Campaign: <strong className="text-gray-900">{campaignName}</strong></span>
        </div>
        <p className="pt-1">Hello <strong className="text-gray-900">{email}</strong>,</p>
        <p>This email is part of the <strong>{campaignName}</strong> outreach campaign scheduled from Mini ReachInbox.</p>
        <p className="text-xs text-gray-500 pt-4">Best regards,<br /><strong className="text-gray-700">{senderEmail}</strong></p>
      </div>

      {/* Ethereal Live Link if available */}
      {previewUrl && (
        <div className="pt-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open Ethereal Live Email Sandbox
          </a>
        </div>
      )}
    </div>
  );
}
