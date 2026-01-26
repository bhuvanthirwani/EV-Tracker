import React from 'react';
import {createPageTitle} from '../../utils';

const TermsAndConditions = () => {
    document.title = createPageTitle(1);
    return (
        <div style={{ overflow: 'hidden', overflowY: 'auto', maxHeight: 'calc(100vh - var(--header-height))', padding: '0 8vw', textAlign: 'justify' }} className='sm-font'>
            <h1 style={{ textAlign: 'center' }}>Coming Soon</h1>
        </div>
    );
}

export default TermsAndConditions;
