"use client"

import { deleteDescriptions, fetchProducts } from '@/lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Cell,
    HeaderCell,
    HeaderRow,
    Row,
    Table,
    TableBody,
    TableHead,
} from '@leafygreen-ui/table';
import Spinner from 'react-bootstrap/Spinner';

//import Code from '@leafygreen-ui/code';
import CurlyBracesIcon from '@leafygreen-ui/icon/dist/CurlyBraces';
import TrashIcon from '@leafygreen-ui/icon/dist/Trash';
import IconButton from '@leafygreen-ui/icon-button';
import Image from 'next/image';
import { Container, Toast } from 'react-bootstrap';

import './catalog.css'
import { deleteProductDescriptions, setInitialLoad, setOpenedProductDetails, setProducts } from '@/redux/slices/ProductsSlice';
import ModalContainer from '@/components/modalContainer/ModalContainer';
import JsonDisplay from '@/components/jsonDisplayComp/JsonDisplayComp';
import DescriptionInput from '@/components/descriptionInput/DescriptionInput';
import { addOperationAlert, addSucAutoCloseAlertHnd, addWarnAutoCloseAlertHnd, closeAlert, closeAlertWithDelay } from '@/lib/alerts';
import { setLengthFilter, setModelFilter } from '@/redux/slices/FormSlice';

export default function Page() {
    const dispatch = useDispatch();
    const catalog = useSelector(state => state.Products.products)
    const modelOptions = useSelector(state => state.Form.models)
    const lengthOptions = useSelector(state => state.Form.lengths)
    const openedProductDetails = useSelector(state => state.Products.openedProductDetails)
    const initialLoad = useSelector(state => state.Products.initialLoad)
    const [open, setOpen] = useState(false)
    const selectedModel = useSelector(state => state.Form.models?.find(model => model.isSelectedFilter === true).value)
    console.log(selectedModel)
    const selectedLength = useSelector(state => state.Form.lengths?.find(length => length.isSelectedFilter === true).value)

    const onDeleteDescriptions = (product) => {

        const delProductDescriptions = async () => {
            const deletingId = new Date()
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
                                    <HeaderCell style={{ minWidth: 'auto' }}>Spanish</HeaderCell>
                                    <HeaderCell style={{ minWidth: 'auto' }}>English</HeaderCell>
                                    <HeaderCell style={{ minWidth: 'auto' }}>French</HeaderCell>
                                    <HeaderCell style={{ minWidth: '89px' }}></HeaderCell>
                                </HeaderRow>
                            </TableHead>
                            <TableBody>
                                {
                                    catalog.map((product, index) => (
                                        <Row key={index}>
                                            <Cell>{product._id}</Cell>
                                            <Cell>
                                                <div className='cursorPointer' onClick={() => onSeeFullDocument(product)}>
                                                    <Image
                                                        
                                                        src={product.imageUrl}
                                                        width={100}
                                                        height={100}
                                                        style={{ objectFit: "contain", padding: '4px' }}
                                                        alt='Product'
                                                    ></Image>
                                                </div>
                                            </Cell>
                                            <Cell>
                                                {
                                                    product.descriptions?.es?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`] || 'n/a'
                                                }
                                            </Cell>
                                            <Cell>
                                                {
                                                    product.descriptions?.en?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`] || 'n/a'
                                                }
                                            </Cell>
                                            <Cell>
                                                {
                                                    product.descriptions?.fr?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`] || 'n/a'
                                                }
                                            </Cell>
                                            <Cell>
                                                <IconButton
                                                    onClick={() => onSeeFullDocument(product)}
                                                    aria-label="Some Menu"
                                                    title='See full document'
                                                >
                                                    <CurlyBracesIcon />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Some Menu"
                                                    title='Delete descriptions'
                                                    onClick={() => onDeleteDescriptions(product)}
                                                >
                                                    <TrashIcon />
                                                </IconButton>
                                            </Cell>
                                        </Row>
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
                        <Image
                            src={openedProductDetails?.imageUrl}
                            width={120}
                            height={120}
                            style={{ objectFit: "contain", padding: '4px' }}
                            alt='Product'
                        ></Image>
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
