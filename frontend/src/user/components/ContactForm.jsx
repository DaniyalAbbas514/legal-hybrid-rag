import React, { useState } from 'react';

const ContactForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      setError('Email must be a @gmail.com domain.');
      return;
    }
    if (!subject.trim()) { setError('Subject is required.'); return; }
    if (!message.trim()) { setError('Message is required.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || 'Failed to submit inquiry.');
      }
      setSuccess('Your inquiry has been submitted successfully. Our team will review it shortly.');
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative bg-white rounded-lg overflow-hidden z-10"
      style={{
        border: '1px solid rgba(197, 198, 205, 0.1)',
        boxShadow: '0px 32px 64px -12px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Inner overlay */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: 'rgba(255, 255, 255, 0.002)',
        }}
      ></div>

      {/* Form Content */}
      <div className="px-16 pt-16 pb-20">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          {/* Name + Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Daniyal Abbas"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-[14px] text-base leading-[19px] text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none transition-colors"
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Daniyalabbas@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-[14px] text-base leading-[19px] text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none transition-colors"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D]">
              Subject of Inquiry
            </label>
            <input
              type="text"
              placeholder="Strategic Integration Query"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-[14px] text-base leading-[19px] text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none transition-colors"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D]">
              Detailed Message
            </label>
            <textarea
              placeholder="How may we assist in your digital evolution?"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-3 text-base leading-6 text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none resize-none transition-colors"
            ></textarea>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="bg-[#FFDAD6] text-[#93000A] px-4 py-3 rounded-lg font-body text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[#D1FAE5] text-[#065F46] px-4 py-3 rounded-lg font-body text-sm">
              {success}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-6">
            <p className="font-body text-xs leading-4 text-[rgba(68,71,77,0.6)] max-w-[320px]">
              By submitting, you acknowledge our professional privacy protocols and data handling standards.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex items-center gap-3 bg-[#0D1C32] text-white px-10 py-5 font-body font-bold text-base leading-6 tracking-[-0.4px] overflow-hidden hover:opacity-95 transition-all disabled:opacity-60"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
              <span className="material-symbols-outlined text-[#E9C176] relative z-10 text-base">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
