import React from "react";

function FAQ ({faqs, index}) {
    return (
        <div className='DropDownMenu'>
            <div>
                className={'faq ' + (faqs.open ? 'open' : '')}
                key={index}
        
            </div>
            <div>
                    className='faq-question'
                    {faqs.question}
            </div>
            <div>
                    className='faq-answer'
                    {faqs.question}
            </div>
        </div>
    );
}

export default FAQ;