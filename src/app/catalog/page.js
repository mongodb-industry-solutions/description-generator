"use client"

import { deleteDescriptions, deleteProductFromMDB, fetchProducts } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    HeaderCell,
    HeaderRow,
    Table,
    TableBody,
    TableHead,
} from '@leafygreen-ui/table';
import Spinner from 'react-bootstrap/Spinner';

//import Code from '@leafygreen-ui/code';

import Image from 'next/image';
import { Container } from 'react-bootstrap';
import Button from "@leafygreen-ui/button";

import './catalog.css'
import { deleteProduct, deleteProductDescriptions, setInitialLoad, setOpenedProductDetails, setProducts } from '@/redux/slices/ProductsSlice';
import ModalContainer from '@/components/modalContainer/ModalContainer';
import JsonDisplay from '@/components/jsonDisplayComp/JsonDisplayComp';
import DescriptionInput from '@/components/descriptionInput/DescriptionInput';
import { addOperationAlert, addSucAutoCloseAlertHnd, addWarnAutoCloseAlertHnd, closeAlertWithDelay } from '@/lib/alerts';
import { setLengthFilter, setModelFilter } from '@/redux/slices/FormSlice';
import ProductRow from '@/components/productRow/ProductRow';

export default function Page() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false)
    const catalog = useSelector(state => state.Products.products)
    const modelOptions = useSelector(state => state.Form.models)
    const lengthOptions = useSelector(state => state.Form.lengths)
    const openedProductDetails = useSelector(state => state.Products.openedProductDetails)
    const initialLoad = useSelector(state => state.Products.initialLoad)
    const [disableActionsInModal, setDisableActionsInModal] = useState(false)

    const onDeleteDescriptions = (product) => {
        const delProductDescriptions = async () => {
            const deletingId = new Date()
            setDisableActionsInModal(true)
            addOperationAlert({
                id: deletingId.getMilliseconds(),
                title: 'Delete operation',
                message: `Deleting descriptions of product ${product._id}`
            })
            try {
                const response = await deleteDescriptions({ _id: product._id, imageUrl: product.imageUrl });
                if (response.modifiedCount > 0 || response.acknowledged == true) {
                    dispatch(deleteProductDescriptions({ _id: response._id, imageUrl: response.imageUrl }))
                    addSucAutoCloseAlertHnd({
                        id: (new Date()).getMilliseconds(),
                        title: 'Delete operation',
                        message: `Descriptions of product ${product._id} deleted`,
                        duration: 4000
                    })
                    closeAlertWithDelay(deletingId.getMilliseconds(), 1500)
                    if (openedProductDetails?._id === product._id)
                        dispatch(setOpenedProductDetails({ ...openedProductDetails, descriptions: {} }))
                }
            } catch (error) {
                addWarnAutoCloseAlertHnd({
                    id: (new Date()).getMilliseconds(),
                    title: 'Delete operation',
                    message: `Error deleting descriptions of product`,
                    duration: 4000
                })
                console.error("There was a problem deleting the prodict's descriptions:", error);
            }
            setDisableActionsInModal(false)
        };
        delProductDescriptions();
    }
    const onSeeFullDocument = (product) => {
        setOpen(true)
        dispatch(setOpenedProductDetails(product))
    }
    const onModelChange = (selectedOption) => {
        dispatch(setModelFilter(selectedOption.value))
    }
    const onLengthChange = (selectedOption) => {
        dispatch(setLengthFilter(selectedOption.value))
    }
    const deleteOpenedProductDetails = async () => {
        if (!openedProductDetails)
            return
        setDisableActionsInModal(true)
        const deletingId = new Date()
        addOperationAlert({
            id: deletingId.getMilliseconds(),
            title: 'Delete operation',
            message: `Deleting product ${openedProductDetails._id}`
        })
        try {
            const response = await deleteProductFromMDB({ _id: openedProductDetails._id, imageUrl: openedProductDetails.imageUrl });
            setOpen(false)
            dispatch(setOpenedProductDetails(null))
            if (response.modifiedCount > 0 || response.acknowledged == true) {
                dispatch(deleteProduct({ _id: response._id, imageUrl: response.imageUrl }))
                addSucAutoCloseAlertHnd({
                    id: (new Date()).getMilliseconds(),
                    title: 'Delete operation',
                    message: `Product ${openedProductDetails._id} deleted`,
                    duration: 4000
                })
                closeAlertWithDelay(deletingId.getMilliseconds(), 1500)
            }
        } catch (error) {
            addWarnAutoCloseAlertHnd({
                id: (new Date()).getMilliseconds(),
                title: 'Delete operation',
                message: `Error deleting product`,
                duration: 4000
            })
            console.error("There was a problem deleting the product:", error);
        }
        setDisableActionsInModal(false)
    }

    useEffect(() => {
        if (initialLoad == true || catalog.length > 0)
            return
        const getAllCatalogProducts = async () => {
            dispatch(setInitialLoad(true))
            try {
                const response = await fetchProducts();
                console.log(response.length)
                if (response)
                    dispatch(setProducts(response))
                dispatch(setInitialLoad(false))
            } catch (error) {
                dispatch(setInitialLoad(false))
                console.error("There was a problem with your fetch operation:", error);
            }
        };
        getAllCatalogProducts();
    }, [])

    return (
        <div className=''>
            <h2 className="mt-3 mb-3 text-center text-2xl font-bold">Product Catalog</h2>
            <Container>
                <div className={`row filtersContainer`}>
                    <div className={` col-12 col-md-6 mb-3 text-center`}>
                        <div className='d-flex flex-row'>
                            <DescriptionInput
                                title="Model"
                                options={modelOptions}
                                onSelectionChange={onModelChange}
                                selectedFieldName='isSelectedFilter'
                            />

                        </div>
                    </div>
                    <div className={`col-12 col-md-6 mb-3 ps-3 pe-3 text-center`}>
                        <div className='d-flex flex-row'>
                            <DescriptionInput
                                title="Length"
                                options={lengthOptions}
                                onSelectionChange={onLengthChange}
                                selectedFieldName='isSelectedFilter'
                            />
                        </div>
                    </div>
                </div>
                {
                    initialLoad === true
                        ? <div className='d-flex flex-column justify-content-center align-items-center' style={{ marginTop: '150px' }}>
                            <Spinner animation="border" variant="secondary" />
                            <h4 className='text-secondary mt-2'>Loading</h4>
                        </div>
                        : <Table className='myTable'>
                            <TableHead>
                                <HeaderRow>
                                    <HeaderCell>ID</HeaderCell>
                                    <HeaderCell style={{ minWidth: '100px' }}>Product</HeaderCell>
                                    <HeaderCell style={{ minWidth: 'auto' }}>English</HeaderCell>
                                    <HeaderCell style={{ minWidth: 'auto' }}>Spanish</HeaderCell>
                                    <HeaderCell style={{ minWidth: 'auto' }}>French</HeaderCell>
                                    <HeaderCell style={{ minWidth: '89px' }}>Actions</HeaderCell>
                                </HeaderRow>
                            </TableHead>
                            <TableBody>
                                {
                                    catalog.map((product, index) => (
                                        <ProductRow
                                            key={index}
                                            product={product}
                                            onSeeFullDocument={onSeeFullDocument}
                                            onDeleteDescriptions={onDeleteDescriptions}
                                        ></ProductRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                }
            </Container>
            <ModalContainer
                allowClose={true}
                open={open}
                setOpen={setOpen}
                children={(open && openedProductDetails !== null)
                    ? <div className=' d-flex flex-column align-items-center justify-content-center'>
                        <h3>Product's document model</h3>
                        {
                            openedProductDetails &&
                            <Image
                                src={openedProductDetails?.imageUrl}
                                width={120}
                                height={120}
                                style={{ objectFit: "contain", padding: '4px' }}
                                alt='Product'
                            ></Image>
                        }
                        <div>
                            {
                                !openedProductDetails?.imageUrl.includes('https://m.media-amazon.com/images') &&
                                <Button
                                    variant='default'
                                    size='small'
                                    disabled={disableActionsInModal}
                                    className='mt-1'
                                    onClick={() => deleteOpenedProductDetails()}
                                >
                                    Delete product
                                </Button>
                            }
                            <Button
                                variant='default'
                                size='small'
                                disabled={Object.keys(openedProductDetails.descriptions).length == 0 || disableActionsInModal}
                                className='mt-1 ms-3'
                                onClick={() => onDeleteDescriptions(openedProductDetails)}
                            >
                                Clear all descriptions
                            </Button>
                        </div>
                        <JsonDisplay data={openedProductDetails} />
                        {/* <Code language="json">{openedProductDetails}</Code> */}
                    </div>
                    : <Spinner animation="border" variant="secondary" />
                }
                onCloseCallback={() => dispatch(setOpenedProductDetails(null))}
            />
        </div>
    );
}
