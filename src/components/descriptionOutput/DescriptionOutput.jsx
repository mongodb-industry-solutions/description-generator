'use client'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import IconButton from '@leafygreen-ui/icon-button';

import EditIcon from '@leafygreen-ui/icon/dist/Edit';
import XIcon from '@leafygreen-ui/icon/dist/X';
import TextArea from '@leafygreen-ui/text-area';
import Button from '@leafygreen-ui/button';
import { updateDescriptionsToMongoDB } from '@/lib/api';
import { addSucAutoCloseAlertHnd, addWarnAutoCloseAlertHnd } from '@/lib/alerts';
import { updateProduct } from '@/redux/slices/ProductsSlice';
import { updateResult } from '@/redux/slices/FormSlice';

const DescriptionOutput = (props) => {
    let {
        language = '',
        languageLabel='',
        description = '',
        imageUrl,
        length,
        model,
    } = props;
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false)
    const [newDescription, setNewDescription] = useState(description)
    const [isLoading, setIsLoading] = useState(false)

    const editDescription = () => {
        setIsEditing(true)
        setNewDescription(description)
    }

    const cancelEditDescription = () => {
        setIsEditing(false)
        setNewDescription(description)
    }

    const updateCatalogDescription = async () => {
        setIsLoading(true)
        const productData = {
            "descriptions": [
                {
                    "language": language,
                    "description": newDescription
                }
            ],
            "model": model,
            "length": length,
            "imageUrl": imageUrl
        };
        const updatedProductDocument = await updateDescriptionsToMongoDB(productData)
        if (updatedProductDocument) {
            dispatch(updateProduct(updatedProductDocument))
            addSucAutoCloseAlertHnd({ id: (new Date()).getMilliseconds(), title: 'Update One operation', message: `Description of product stored in MongoDB` })
            setIsEditing(false)
            dispatch(updateResult({...productData.descriptions[0]})) 
        } else {
            addWarnAutoCloseAlertHnd({ id: (new Date()).getMilliseconds(), title: 'Update One operation', message: `Error storing description of product in MongoDB` })
        }
        setIsLoading(false)
    }

    const onKeyDownInput = (e) => {
        if(e.key === 'Enter' && newDescription.length > 0 && !isLoading)
            updateCatalogDescription()
    }

    return (
        <div className='mb-2'>
            <h5 className='text-start d-flex'>
                {languageLabel}
                {
                    isEditing
                        ? <IconButton
                            aria-label="Some Menu"
                            title='Cancel'
                            className='ms-2'
                            onClick={() => cancelEditDescription()}
                        >
                            <XIcon />
                        </IconButton>
                        : <IconButton
                            aria-label="Some Menu"
                            title='Edit description'
                            className='ms-2'
                            onClick={() => editDescription()}
                        >
                            <EditIcon />
                        </IconButton>
                }
            </h5>
            {
                isEditing
                    ? <>
                        <TextArea
                            aria-labelledby="Edit description"
                            disabled={isLoading}
                            onChange={event => setNewDescription(event.target.value)}
                            value={newDescription}
                            onKeyDown={(e) => onKeyDownInput(e)}
                        />
                        <div className='d-flex flex-row-reverse'>
                            <Button
                                variant='default'
                                size='small'
                                disabled={newDescription.length <= 0}
                                className='mt-1'
                                onClick={() => updateCatalogDescription()}
                            >
                                {
                                    isLoading
                                        ? 'Saving...'
                                        : 'Save'
                                }
                            </Button>
                        </div>
                    </>
                    : <p className='text-secondary text-start' style={{ fontSize: '15px' }}>{description}</p>
            }

        </div>
    )
}

export default DescriptionOutput