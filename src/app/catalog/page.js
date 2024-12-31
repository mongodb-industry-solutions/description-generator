"use client"

import { fetchProducts } from '@/lib/api';
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
import { Container } from 'react-bootstrap';

import './catalog.css'
import { setInitialLoad, setOpenedProductDetails, setProducts } from '@/redux/slices/ProductsSlice';
import ModalContainer from '@/components/modalContainer/ModalContainer';
import JsonDisplay from '@/components/jsonDisplayComp/JsonDisplayComp';
import DescriptionInput from '@/components/descriptionInput/DescriptionInput';

const models = [
    {
        value: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
        label: "Llama 3.2 11B",
        isSelected: true
    },
    {
        value: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
        label: "Llama 3.2 90B",
        isSelected: false
    },
];
const lengths = [
    { value: "short", label: "Short", isSelected: true },
    { value: "medium", label: "Medium", isSelected: false },
    { value: "long", label: "Long", isSelected: false },
];

export default function Page() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false)
    const catalog = useSelector(state => state.Products.products)
    const openedProductDetails = useSelector(state => state.Products.openedProductDetails)
    const initialLoad = useSelector(state => state.Products.initialLoad)
    const [modelOptions, setModelOptions] = useState(models)
    const [model, setModel] = useState(models[0].value);
    const [lengthOptions, setLengthOptions] = useState(lengths)
    const [length, setLength] = useState(lengths[0].value);

    const onDeleteDescriptions = () => {

    }
    const onSeeFullDocument = (product) => {
        setOpen(true)
        dispatch(setOpenedProductDetails(product))
    }
    const onModelChange = (selectedOption) => {
        setModel(selectedOption.value)
        setModelOptions(prevState =>
            prevState.map(option => {
                return { ...option, isSelected: option.value === selectedOption.value }
            }
            ))
    }
    const onLengthChange = (selectedOption) => {
        setLength(selectedOption.value)
        setLengthOptions(prevState =>
            prevState.map(option => {
                console.log(option)
                console.log(selectedOption)
                return { ...option, isSelected: option.value === selectedOption.value }
            }
            ))
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
                            />

                        </div>
                    </div>
                    <div className={`col-12 col-md-6 mb-3 ps-3 pe-3 text-center`}>
                        <div className='d-flex flex-row'>
                            <DescriptionInput
                                title="Length"
                                options={lengthOptions}
                                onSelectionChange={onLengthChange}
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
                        : <Table>
                            <TableHead>
                                <HeaderRow>
                                    <HeaderCell>ID</HeaderCell>
                                    <HeaderCell>Product</HeaderCell>
                                    <HeaderCell>Spanish</HeaderCell>
                                    <HeaderCell>English</HeaderCell>
                                    <HeaderCell>French</HeaderCell>
                                    <HeaderCell></HeaderCell>
                                </HeaderRow>
                            </TableHead>
                            <TableBody>
                                {
                                    catalog.map((product, index) => (
                                        <Row key={index}>
                                            <Cell>{product._id}</Cell>
                                            <Cell>
                                                <Image
                                                    src={product.imageUrl}
                                                    width={100}
                                                    height={100}
                                                    style={{ objectFit: "contain", padding: '4px' }}
                                                    alt='Product'
                                                ></Image>
                                            </Cell>
                                            <Cell>
                                                {
                                                    product.descriptions?.es?.[`${length}_${model.replaceAll('.', '')}`] ||  'n/a'
                                                }                                            
                                            </Cell>
                                            <Cell>
                                                {
                                                    product.descriptions?.en?.[`${length}_${model.replaceAll('.', '')}`] ||  'n/a'
                                                }
                                            </Cell>                                            
                                            <Cell>
                                                {
                                                    product.descriptions?.fr?.[`${length}_${model.replaceAll('.', '')}`] ||  'n/a'
                                                }
                                            </Cell>
                                            <Cell>
                                                <IconButton onClick={() => onSeeFullDocument(product)} aria-label="Some Menu" title='See full document'>
                                                    <CurlyBracesIcon />
                                                </IconButton>
                                                <IconButton 
                                                    aria-label="Some Menu" 
                                                    title='Delete descriptions'
                                                    className='d-none'
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
