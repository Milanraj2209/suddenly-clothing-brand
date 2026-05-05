import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { orderId } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="order-success-page section-padding">
            <div className="success-container">
                <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                
                <h1 className="success-title">Thank You for Your Order</h1>
                <p className="success-subtitle">Your suddenly collection is being prepared.</p>
                
                <div className="order-info-card">
                    <div className="info-row">
                        <span className="label">Order Number</span>
                        <span className="value">{orderId}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Confirmation</span>
                        <span className="value">A confirmation email is on its way to you.</span>
                    </div>
                </div>

                <div className="next-steps">
                    <h3>What's Next?</h3>
                    <div className="steps-grid">
                        <div className="step">
                            <span className="step-num">01</span>
                            <h4>Processing</h4>
                            <p>We're verifying your order and preparing items for shipping.</p>
                        </div>
                        <div className="step">
                            <span className="step-num">02</span>
                            <h4>Shipping</h4>
                            <p>You'll receive a tracking number once your package is on its way.</p>
                        </div>
                        <div className="step">
                            <span className="step-num">03</span>
                            <h4>Delivery</h4>
                            <p>Standard delivery takes 3-5 business days across India.</p>
                        </div>
                    </div>
                </div>

                <div className="success-actions">
                    <Link to="/shop" className="btn-primary">Return to Shop</Link>
                    <Link to="/" className="btn-outline">Go to Account</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
