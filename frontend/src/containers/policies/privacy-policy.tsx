import React from 'react';
import { createPageTitle } from '../../utils';

const PrivacyPolicy = () => {
    document.title = createPageTitle(1);
    return (
        <div style={{ overflow: 'hidden', overflowY: 'auto', maxHeight: 'calc(100vh - var(--header-height))', padding: '0 8vw', textAlign: 'justify' }} className='sm-font'>
            <h1 style={{ textAlign: 'center' }}>Privacy Policy</h1>
            <p style={{ fontWeight: 'normal', fontSize: '20px' }}>This privacy policy is coming soon.</p>        </div>
    );
}

export default PrivacyPolicy;
