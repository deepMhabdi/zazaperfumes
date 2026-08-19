import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const handleSubmit = (e) => { e.preventDefault(); toast.success('Message sent! We\'ll respond within 24 hours.'); setForm({ name: '', email: '', subject: '', message: '' }); };
  return (
    <div className="pt-24 pb-16">
      <div className="container-zaza max-w-4xl">
        <p className="section-label mb-4">Get in Touch</p>
        <h1 className="font-display text-6xl text-chrome mb-16">Contact Us</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Your Name', key: 'name', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Subject', key: 'subject', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="input-zaza" required />
              </div>
            ))}
            <div>
              <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Message</label>
              <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={5} className="input-zaza resize-none" required />
            </div>
            <button type="submit" className="btn-primary">Send Message</button>
          </form>
          <div className="space-y-8">
            {[
              { icon: Mail, label: 'Email', value: 'hello@zazaperfumes.com' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
              { icon: MapPin, label: 'Address', value: '12, Luxury Lane, Bandra West, Mumbai 400050' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4">
                <div className="w-10 h-10 flex-shrink-0 border border-chrome/20 flex items-center justify-center">
                  <Icon size={16} className="text-chrome/60" />
                </div>
                <div>
                  <p className="text-2xs tracking-widest uppercase text-chrome/40 mb-1">{label}</p>
                  <p className="text-chrome/70">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
