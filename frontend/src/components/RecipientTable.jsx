import React from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function RecipientTable({ recipients, loading, page, totalPages, onPageChange }) {
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'SENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Sent</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending</span>;
      case 'FAILED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Failed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Campaign
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Scheduled At
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sent At
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                    <p>Loading recipients...</p>
                  </div>
                </td>
              </tr>
            ) : recipients.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <p className="text-base font-medium">No recipients found</p>
                    <p className="text-sm mt-1">Adjust your filters or schedule a new campaign.</p>
                  </div>
                </td>
              </tr>
            ) : (
              recipients.map((recipient) => (
                <tr key={recipient.id || recipient._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {recipient.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {recipient.campaign?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(recipient.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(recipient.campaign?.scheduledAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(recipient.sentAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {recipient.etherealPreviewUrl ? (
                      <a
                        href={recipient.etherealPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#00B04F] hover:text-[#009643] bg-[#E6F7ED] hover:bg-[#D8F3E4] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Preview (Ethereal)
                      </a>
                    ) : recipient.status === 'SENT' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        ✓ Sent via Gmail
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs px-3 py-1.5">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && recipients.length > 0 && (
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Page <span className="font-medium text-slate-900">{page}</span> of{' '}
            <span className="font-medium text-slate-900">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
