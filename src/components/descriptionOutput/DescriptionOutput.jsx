'use client'
import React, {useState} from 'react'
import Button from 'react-bootstrap/Button';

import styles from "./descriptionOutput.module.css";

const DescriptionOutput = (props) => {
    let { 
        language = '', 
        description = '', 
        imageUrl,
        length,
        model, 
    } = props;
    // TODO add option to edit description from this page
    const [isEditing, setisEditing] = useState(false)


    return (
        <div>
            <h5 className='text-start'>{language}</h5>
            <p className='text-secondary text-start' style={{ fontSize: '15px' }}>{description}</p>
        </div>
    )
}

export default DescriptionOutput