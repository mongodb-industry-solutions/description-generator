"use client"

import { deleteDescriptions, fetchProducts } from '@/lib/api';
import { useRouter } from "next/navigation";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    HeaderCell,
    HeaderRow,
    Table,
    TableBody,
    TableHead,
} from '@leafygreen-ui/table';
import Spinner from 'react-bootstrap/Spinner';
import { H1 } from '@leafygreen-ui/typography';
//import Code from '@leafygreen-ui/code';
import { Container } from 'react-bootstrap';

import './catalog.css'
import { deleteProductDescriptions, setInitialLoad, setOpenedProductDetails, setProducts } from '@/redux/slices/ProductsSlice';
import DescriptionInput from '@/components/descriptionInput/DescriptionInput';
import { addOperationAlert, addSucAutoCloseAlertHnd, addWarnAutoCloseAlertHnd, closeAlertWithDelay } from '@/lib/alerts';
import { setLengthFilter, setModelFilter } from '@/redux/slices/FormSlice';
import ProductRow from '@/components/productRow/ProductRow';
import TalkTrackContainer from '@/components/talkTrackContainer/talkTrackContainer';
import { catalogPage } from '@/lib/talkTrack';

export default function Page() {
    const router = useRouter();
    const dispatch = useDispatch();
    const catalog = useSelector(state => state.Products.products)
    const modelOptions = useSelector(state => state.Form.models)
    const lengthOptions = useSelector(state => state.Form.lengths)
    const openedProductDetails = useSelector(state => state.Products.openedProductDetails)
    const initialLoad = useSelector(state => state.Products.initialLoad)

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
        };
        delProductDescriptions();
    }
    const onSeeFullDocument = (product) => {
        dispatch(setOpenedProductDetails(product))
        router.push(`/catalog/${product._id}`);
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
        <Container className=''>
            <div className='d-flex flex-row align-items-center mb-2'>
                <div className='d-flex align-items-end w-100'>
                    <H1 className=''>Product Catalog</H1>
                </div>
                <TalkTrackContainer sections={catalogPage} />
            </div>
            <div>
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
            </div>
        </Container>
    );
}
