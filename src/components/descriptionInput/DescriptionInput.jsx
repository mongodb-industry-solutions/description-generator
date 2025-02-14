'use client'
import React from 'react'
import Button from 'react-bootstrap/Button';

import styles from "./descriptionInput.module.css";

const DescriptionInput = (props) => {
    let { 
        title = '', 
        description = '', 
        options = [],
        onSelectionChange, 
        disableUnselectedOptions = false,
        disabledLanguages = [],
        selectedFieldName = 'isSelected'
    } = props;


    return (
        <div className={`descriptionInput ${styles.descriptionInput}`}>
            <div className='row'>
                <div className='col d-flex flex-column justify-content-start'>
                    <strong className='text-start'>{title}</strong>
                    {
                        description.length > 0 
                        ?<p className='text-start text-secondary'>{description}</p>
                        : ''
                    }
                    
                </div>
                <div className='col'>
                    {
                        options.map((option, index) => (
                            <Button
                                key={index}
                                onClick={() => onSelectionChange(option)}
                                className={` me-1 mb-1 ${styles.optionBtn} ${option[selectedFieldName] === true ? styles.selected : ''}`}
                                disabled= {disabledLanguages.includes(option.value) || (disableUnselectedOptions && !option[selectedFieldName])}
                            >
                                {option.label}
                            </Button>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default DescriptionInput