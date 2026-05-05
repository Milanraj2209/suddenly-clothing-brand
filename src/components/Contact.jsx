import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log('Form Submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <img src="/contact_hero.png" alt="Contact Suddenly" />
        <div className="contact-hero-overlay">
          <h1 className="animate-fade-in">Connect With Us</h1>
          <p className="animate-fade-in" style={{ animationDelay: '0.2s' }}>Experience bespoke luxury and personalized service.</p>
        </div>
      </div>

      <div className="contact-container section-padding">
        <div className="contact-grid">
          <div className="contact-info-section">
            <h2 className="section-title">Digital Concierge</h2>
            <p className="online-notice">As a modern, digital-first atelier, we offer personalized support wherever you are. Our team is available to assist with sizing, styling, and order inquiries.</p>
            
            <div className="info-cards">
              <div className="info-card">
                <h3>Customer Care</h3>
                <p>Available 24/7 for your needs.</p>
                <p>Email: care@suddenly.com</p>
                <p>WhatsApp: +91 98765 43210</p>
              </div>
              <div className="info-card">
                <h3>Press & Collaborations</h3>
                <p>Email: press@suddenly.com</p>
              </div>
              <div className="info-card">
                <h3>Online Support Hours</h3>
                <p>Mon - Sat: 9:00 AM - 10:00 PM IST</p>
                <p>Sun: 10:00 AM - 6:00 PM IST</p>
              </div>
            </div>
            
            <div className="social-links">
              <h3>Connect Digitally</h3>
              <div className="social-icons">
                <span>Instagram</span>
                <span>Pinterest</span>
                <span>LinkedIn</span>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2 className="section-title">Send a Message</h2>
            {submitted ? (
              <div className="submission-success">
                <h3>Inquiry Received</h3>
                <p>Thank you for reaching out. Our digital concierge will respond to your request within 24 hours.</p>
              </div>
            ) : (
              <form className="luxury-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="input-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your full name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-light-gray)', padding: '15px 0', fontSize: '1rem', outline: 'none' }}
                  >
                    <option value="">Select a reason</option>
                    <option value="Order Inquiry">Order Inquiry</option>
                    <option value="Sizing Help">Sizing Help</option>
                    <option value="Returns">Returns & Exchanges</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Message</label>
                  <textarea 
                    placeholder="How can we assist you today?" 
                    rows="6"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary submit-btn">
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
