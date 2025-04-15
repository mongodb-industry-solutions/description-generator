"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
import JsonDisplay from '@/components/jsonDisplayComp/JsonDisplayComp'
import ModalContainer from '@/components/modalContainer/ModalContainer'
import Button from '@leafygreen-ui/button'
import Image from 'next/image'
import { addOperationAlert, addSucAutoCloseAlertHnd, addWarnAutoCloseAlertHnd, closeAlertWithDelay } from "@/lib/alerts";
import { deleteDescriptions, deleteProductFromMDB, fetchProducts } from "@/lib/api";
import { deleteProduct, deleteProductDescriptions, setInitialLoad, setOpenedProductDetails, setProducts } from "@/redux/slices/ProductsSlice";
import { Spinner } from 'react-bootstrap';
import { getProductFromObjectId } from '@/lib/helpers';

const ProductPage = () => {
    const dispatch = useDispatch();
    const catalog = useSelector(state => state.Products.products)
    const initialLoad = useSelector(state => state.Products.initialLoad)

    const router = useRouter();
    const params = useParams();

    const openedProductDetails = useSelector(state => state.Products.openedProductDetails)
    const [disableActionsInModal, setDisableActionsInModal] = useState(false)
    const [open, setOpen] = useState(false)

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
            router.push(`/catalog`);
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

    useEffect(() => {
        setOpen(true)
        if (params) {
            if (openedProductDetails === null) {
                const product = getProductFromObjectId(params["product-id"])
                dispatch(setOpenedProductDetails(product))
            }
        }
    }, [params, catalog]);

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
        <ModalContainer
            allowClose={true}
            open={open}
            children={(openedProductDetails !== null)
                ? <div className=' d-flex flex-column align-items-center justify-content-center'>
                    <h3>Product's document model</h3>
                    {/* <small>{productId}</small> */}
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
                            disabled={Object.keys(openedProductDetails?.descriptions || {}).length == 0 || disableActionsInModal}
                            className='mt-1 ms-3'
                            onClick={() => onDeleteDescriptions(openedProductDetails)}
                        >
                            Clear all descriptions
                        </Button>
                    </div>
                    <JsonDisplay data={openedProductDetails} />
                    {/* <Code language="json">{openedProductDetails}</Code> */}
                </div>
                : <div className=' d-flex flex-column align-items-center justify-content-center'>
                    <h3>Product's document model</h3>
                    <Spinner animation="border" variant="secondary" />
                </div>
            }
            onCloseCallback={() => {
                router.push("/catalog")
                dispatch(setOpenedProductDetails(null))
            }}
        />)
}

export default ProductPage