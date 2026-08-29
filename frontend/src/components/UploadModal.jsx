import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Paperclip, Clock, Bold, Italic, Underline, 
  List, ListOrdered, Quote, Code, RotateCcw, RotateCw, X, Calendar, FileText, Loader2 
} from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ComposeModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [fromEmail, setFromEmail] = useState(user?.email || 'user@example.com');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delayBetween, setDelayBetween] = useState('00');
  const [hourlyLimit, setHourlyLimit] = useState('00');
  const [csvFile, setCsvFile] = useState(null);
  
  // Send Later Popover state
  const [showSchedulePopover, setShowSchedulePopover] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const handlePresetSelect = (offsetDays, timeStr) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setScheduledDateTime(`${year}-${month}-${day}T${hh}:${mm}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subject) {
      setError('Please enter a subject');
      return;
    }

    const scheduledAtDate = scheduledDateTime 
      ? new Date(scheduledDateTime).toISOString() 
      : new Date().toISOString();

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', subject);
      formData.append('scheduledAt', scheduledAtDate);
      if (toEmail) {
        formData.append('to', toEmail);
      }
      if (csvFile) {
        formData.append('file', csvFile);
      }

      await api.post('/campaigns/schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send/schedule email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header matching Screenshot 5 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">Compose New Email</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* CSV File Upload Icon */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach CSV file"
              className={`p-2 rounded-full transition-colors relative ${csvFile ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <Paperclip className="h-5 w-5" />
              {csvFile && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">1</span>
              )}
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => e.target.files?.[0] && setCsvFile(e.target.files[0])}
            />

            {/* Schedule Clock Icon Toggle */}
            <button 
              type="button"
              onClick={() => setShowSchedulePopover(!showSchedulePopover)}
              title="Send Later options"
              className={`p-2 rounded-full transition-colors ${showSchedulePopover || scheduledDateTime ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <Clock className="h-5 w-5" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-1.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full text-sm font-semibold transition-all disabled:opacity-50 min-w-[80px] flex items-center justify-center shadow-xs"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </button>
          </div>
        </div>

        {/* Send Later Popover Dropdown */}
        {showSchedulePopover && (
          <div className="absolute top-16 right-16 z-20 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Send Later</h4>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Pick date & time</label>
              <input 
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <button 
                type="button" 
                onClick={() => handlePresetSelect(24, '09:00')}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                Tomorrow
              </button>
              <button 
                type="button" 
                onClick={() => handlePresetSelect(24, '10:00')}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                Tomorrow, 10:00 AM
              </button>
              <button 
                type="button" 
                onClick={() => handlePresetSelect(24, '11:00')}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                Tomorrow, 11:00 AM
              </button>
              <button 
                type="button" 
                onClick={() => handlePresetSelect(24, '15:00')}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                Tomorrow, 3:00 PM
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setShowSchedulePopover(false)}
                className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => setShowSchedulePopover(false)}
                className="px-4 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-full font-medium shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs">
              {error}
            </div>
          )}

          {scheduledDateTime && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-xs text-blue-700">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4" />
                <span>Scheduled to send automatically on: <strong>{new Date(scheduledDateTime).toLocaleString()}</strong></span>
              </div>
              <button 
                type="button" 
                onClick={() => setScheduledDateTime('')}
                className="text-[11px] hover:underline font-semibold"
              >
                Send Now instead
              </button>
            </div>
          )}

          {csvFile && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#00B04F]" />
                <span className="font-medium">{csvFile.name}</span>
                <span className="text-gray-500">({(csvFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button type="button" onClick={() => setCsvFile(null)} className="text-emerald-700 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Form Fields matching Screenshot 5 */}
          <div className="space-y-3">
            <div className="flex items-center text-sm border-b border-gray-100 pb-2">
              <span className="w-16 text-gray-400 font-normal">From</span>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="flex-1 bg-transparent border-0 text-sm text-gray-900 font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
              <div className="flex items-center flex-1">
                <span className="w-16 text-gray-400 font-normal">To</span>
                <input
                  type="text"
                  placeholder={csvFile ? `Loaded from ${csvFile.name}` : "recipient@example.com"}
                  disabled={!!csvFile}
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-sm text-gray-900 placeholder-gray-300 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-slate-100 hover:bg-[#E6F7ED] text-slate-700 hover:text-[#00B04F] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Paperclip className="h-3.5 w-3.5" />
                {csvFile ? 'Change CSV' : 'Upload CSV'}
              </button>
            </div>

            <div className="flex items-center text-sm border-b border-gray-100 pb-2">
              <span className="w-16 text-gray-400 font-normal">Subject</span>
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent border-0 text-sm text-gray-900 placeholder-gray-300 focus:outline-none"
              />
            </div>

            {/* Delay & Hourly Limit matching Screenshot 5 */}
            <div className="flex items-center gap-6 pt-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>Delay between 2 emails</span>
                <input 
                  type="text" 
                  value={delayBetween} 
                  onChange={(e) => setDelayBetween(e.target.value)}
                  className="w-12 text-center py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-800" 
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Hourly Limit</span>
                <input 
                  type="text" 
                  value={hourlyLimit} 
                  onChange={(e) => setHourlyLimit(e.target.value)}
                  className="w-12 text-center py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-800" 
                />
              </div>
            </div>

            {/* Rich Text Editor Toolbar matching Screenshot 5 */}
            <div className="bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 flex items-center gap-3 text-gray-400 text-xs mt-2 overflow-x-auto">
              <button type="button" className="hover:text-gray-700 p-1"><RotateCcw className="h-4 w-4" /></button>
              <button type="button" className="hover:text-gray-700 p-1"><RotateCw className="h-4 w-4" /></button>
              <span className="text-gray-200">|</span>
              <button type="button" className="hover:text-gray-700 p-1 font-bold">Tt</button>
              <button type="button" className="hover:text-gray-700 p-1"><Bold className="h-4 w-4" /></button>
              <button type="button" className="hover:text-gray-700 p-1"><Italic className="h-4 w-4" /></button>
              <button type="button" className="hover:text-gray-700 p-1"><Underline className="h-4 w-4" /></button>
              <span className="text-gray-200">|</span>
              <button type="button" className="hover:text-gray-700 p-1"><List className="h-4 w-4" /></button>
              <button type="button" className="hover:text-gray-700 p-1"><ListOrdered className="h-4 w-4" /></button>
              <button type="button" className="hover:text-gray-700 p-1"><Quote className="h-4 w-4" /></button>
              <button type="button" className="hover:text-gray-700 p-1"><Code className="h-4 w-4" /></button>
            </div>

            <textarea
              rows={8}
              placeholder="Type Your Reply..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-4 bg-transparent border-0 text-sm text-gray-900 placeholder-gray-300 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
