import React, { useRef, useState } from 'react';
import Reveal from './Reveal';

const FIELD_CLASS =
  'w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-[14px] text-base leading-[19px] text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_6px_12px_-10px_rgba(233,193,118,0.9)]';
const FIELD_ERROR_CLASS = 'border-[#BA1A1A] focus:border-[#BA1A1A]';
const LABEL_CLASS =
  'font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D] transition-colors';

const ContactForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation (unchanged rules, now surfaced per field)
    const errors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required.';
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      errors.email = 'Email must be a @gmail.com domain.';
    }
    if (!subject.trim()) errors.subject = 'Subject is required.';
    if (!message.trim()) errors.message = 'Message is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Move focus to the first field that failed
      const focusOrder = [
        ['fullName', fullNameRef],
        ['email', emailRef],
        ['subject', subjectRef],
        ['message', messageRef],
      ];
      const firstInvalid = focusOrder.find(([key]) => errors[key]);
      firstInvalid?.[1].current?.focus();
      return;
    }

    setFieldErrors({});
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

  const renderError = (field) =>
    fieldErrors[field] ? (
      <p id={`${field}-error`} className="font-body text-xs leading-4 text-[#BA1A1A] mt-1">
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <Reveal
      variant="up"
      className="relative bg-white rounded-lg overflow-hidden z-10 transition-shadow duration-300 hover:shadow-[0px_36px_72px_-16px_rgba(13,28,50,0.10)]"
      style={{
        border: '1px solid rgba(197, 198, 205, 0.4)',
        boxShadow: '0px 32px 64px -12px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Form Content */}
      <div className="px-6 sm:px-10 lg:px-16 pt-10 sm:pt-14 lg:pt-16 pb-12 sm:pb-16 lg:pb-20">
        <form className="flex flex-col gap-7 sm:gap-8" onSubmit={handleSubmit} noValidate>
          {/* Name + Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className={LABEL_CLASS} htmlFor="contact-full-name">
                Full Name
              </label>
              <input
                id="contact-full-name"
                ref={fullNameRef}
                type="text"
                name="fullName"
                autoComplete="name"
                placeholder="Daniyal Abbas"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError('fullName');
                }}
                aria-invalid={fieldErrors.fullName ? 'true' : undefined}
                aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                className={`${FIELD_CLASS} ${fieldErrors.fullName ? FIELD_ERROR_CLASS : ''}`}
              />
              {renderError('fullName')}
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label className={LABEL_CLASS} htmlFor="contact-email">
                Email Address
              </label>
              <input
                id="contact-email"
                ref={emailRef}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Daniyalabbas@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                aria-invalid={fieldErrors.email ? 'true' : undefined}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                className={`${FIELD_CLASS} ${fieldErrors.email ? FIELD_ERROR_CLASS : ''}`}
              />
              {renderError('email')}
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className={LABEL_CLASS} htmlFor="contact-subject">
              Subject of Inquiry
            </label>
            <input
              id="contact-subject"
              ref={subjectRef}
              type="text"
              name="subject"
              placeholder="Strategic Integration Query"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                clearFieldError('subject');
              }}
              aria-invalid={fieldErrors.subject ? 'true' : undefined}
              aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
              className={`${FIELD_CLASS} ${fieldErrors.subject ? FIELD_ERROR_CLASS : ''}`}
            />
            {renderError('subject')}
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label className={LABEL_CLASS} htmlFor="contact-message">
              Detailed Message
            </label>
            <textarea
              id="contact-message"
              ref={messageRef}
              name="message"
              placeholder="How may we assist in your digital evolution?"
              rows="4"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                clearFieldError('message');
              }}
              aria-invalid={fieldErrors.message ? 'true' : undefined}
              aria-describedby={fieldErrors.message ? 'message-error' : undefined}
              className={`${FIELD_CLASS} py-3 leading-6 resize-none ${
                fieldErrors.message ? FIELD_ERROR_CLASS : ''
              }`}
            ></textarea>
            {renderError('message')}
          </div>

          {/* Submission status — announced to assistive tech */}
          <div aria-live="polite" className="empty:hidden">
            {error && (
              <div className="bg-[#FFDAD6] text-[#93000A] px-4 py-3 rounded-lg font-body text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-base mt-0.5" aria-hidden="true">
                  error
                </span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-[#D1FAE5] text-[#065F46] px-4 py-3 rounded-lg font-body text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-base mt-0.5" aria-hidden="true">
                  check_circle
                </span>
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4 sm:pt-6">
            <p className="font-body text-xs leading-4 text-[rgba(68,71,77,0.6)] max-w-[320px]">
              By submitting, you acknowledge our professional privacy protocols and data handling standards.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex items-center justify-center gap-3 bg-[#0D1C32] text-white px-8 sm:px-10 py-4 sm:py-5 font-body font-bold text-base leading-6 tracking-[-0.4px] overflow-hidden transition-all duration-200 hover:shadow-[0_18px_36px_-16px_rgba(13,28,50,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
              {submitting ? (
                <svg
                  className="animate-spin h-4 w-4 text-[#E9C176] relative z-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <span
                  className="material-symbols-outlined text-[#E9C176] relative z-10 text-base transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Reveal>
  );
};

export default ContactForm;
