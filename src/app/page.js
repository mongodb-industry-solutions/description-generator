'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
import { Button as BSButton, Container } from 'react-bootstrap';
import Button from "@leafygreen-ui/button";
import Icon from '@leafygreen-ui/icon';
import { H1 } from '@leafygreen-ui/typography';


import { useS3Upload } from "next-s3-upload";
import Spinner from 'react-bootstrap/Spinner';

import styles from './page.module.css'
import ImageUpload from "@/components/imageUpload/ImageUpload";
import DescriptionInput from "@/components/descriptionInput/DescriptionInput";
import { fetchDescriptions, fetchProducts, updateDescriptionsToMongoDB } from '@/lib/api';
import { setInitialLoad, setOpenedProductDetails, setProducts, updateProduct } from '@/redux/slices/ProductsSlice';
import TextInput from '@leafygreen-ui/text-input';
import { getProductFromObjectId, setProductImageInFormFromObjectId, getDisplayImageUrl } from '@/lib/helpers';
import { setLanguage, setLength, setModel, setImage, setResult, setGeneratingDescription } from '@/redux/slices/FormSlice';
import DescriptionOutput from '@/components/descriptionOutput/DescriptionOutput';
import { addOperationAlert, addSucAutoCloseAlertHnd, addWarnAutoCloseAlertHnd, closeAlert, closeAlertWithDelay } from '@/lib/alerts';
import Image from 'next/image';
import TalkTrackContainer from '@/components/talkTrackContainer/talkTrackContainer';
import { formPage } from '@/lib/talkTrack';


export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  const image = useSelector(state => state.Form.image)
  const selectedModel = useSelector(state => state.Form.selectedModel)
  const modelOptions = useSelector(state => state.Form.models)
  const selectedLength = useSelector(state => state.Form.selectedLength)
  const lengthOptions = useSelector(state => state.Form.lengths)
  const selectedLanguages = useSelector(state => state.Form.selectedLanguages)
  const languagesOptions = useSelector(state => state.Form.languages)
  const languagesDisabled = useSelector(state => state.Form.disabledLanguages)
  const result = useSelector(state => state.Form.result)
  const generatingDescription = useSelector(state => state.Form.generatingDescription)

  const initialLoad = useSelector(state => state.Products.initialLoad)
  const catalogLength = useSelector(state => state.Products.products?.length)
  const productIdRef = useRef(null)

  const [sampleImageLoading, setSampleImageLoading] = useState(false)
  const [disableUpload, setDisableUpload] = useState(true)
  const { uploadToS3 } = useS3Upload();

  const onModelChange = (selectedOption) => {
    dispatch(setModel(selectedOption.value))
  }
  const onLanguageChange = (selectedOption) => {
    dispatch(setLanguage(selectedOption.value))
  }
  const onLengthChange = (selectedOption) => {
    dispatch(setLength(selectedOption.value))
  }
  const onGenerateClick = async () => {
    dispatch(setResult(null))
    const body = {
      languages: selectedLanguages,
      imageUrl: image,
      model: selectedModel,
      length: selectedLength
    }
    console.log(body)
    if ((selectedLanguages.length < 1 || selectedLanguages.length > 3) || !image)
      return;
    dispatch(setGeneratingDescription(true));
    const response = await fetchDescriptions(body)
    if (response && response?.descriptions?.length > 0) {
      dispatch(setResult(response))
      dispatch(setGeneratingDescription(false));
      const updateMDBRes = new Date()
      addOperationAlert({ id: updateMDBRes.getMilliseconds(), title: 'Update One operation', message: 'Saving descriptions of product in MongoDB' })
      const updatedProductDocument = await updateDescriptionsToMongoDB(response)
      if (updatedProductDocument) {
        dispatch(setResult({ ...response, _id: updatedProductDocument._id }))
        dispatch(updateProduct(updatedProductDocument))
        addSucAutoCloseAlertHnd({ id: (new Date()).getMilliseconds(), title: 'Update One operation', message: `Description of product stored in MongoDB` })
      } else {
        addWarnAutoCloseAlertHnd({ id: (new Date()).getMilliseconds(), title: 'Update One operation', message: `Error storing description of product in MongoDB` })
      }
      closeAlertWithDelay(updateMDBRes.getMilliseconds(), 1500)
    } else {
      console.log('response',response)
      addWarnAutoCloseAlertHnd({ 
        id: (new Date()).getMilliseconds(), 
        title: 'An error ocured generating the descriptions', 
        message:`${response?.status}: ${response?.message}` 
      })
    }
    dispatch(setGeneratingDescription(false));
  }
  const onLoadImageFromObjectId = () => {
    const imageId = setProductImageInFormFromObjectId(productIdRef.current.value)
    console.log(imageId)
  }
  const onLoadSampleImage = () => {
    // TODO. replace this hard coded URL with an API call that:
    // 1. retrieves a random document from the product collection
    // 2. use its image URL to setImage
    // TODO. use sampleImageLoading variable to handle loading state while the api is retrieving the sample image
    // when sampleImageLoading  is true the button "Use sample image from catalog" should be disabled and have opacity
    // when sampleImageLoading  is true the ImageUpload component should show a Loading spinner
    dispatch(setImage("https://m.media-amazon.com/images/I/81seiXB5drL.jpg"))
  }

  useEffect(() => {
    if (initialLoad == true || catalogLength > 0)
      return
    const getAllCatalogProducts = async () => {
      const alertFetchProds = 'alertFetchProds'
      dispatch(setInitialLoad(true))
      addOperationAlert({ id: alertFetchProds, title: 'Loading catalog' })
      try {
        const response = await fetchProducts();
        console.log(response.length)
        if (response) {
          dispatch(setProducts(response))
          addSucAutoCloseAlertHnd({ id: (new Date()).getMilliseconds(), title: 'Catalog loaded', duration: 3000 })
        }
        dispatch(setInitialLoad(false))
        closeAlert(alertFetchProds)
      } catch (error) {
        dispatch(setInitialLoad(false))
        closeAlertWithDelay(alertFetchProds)
        console.error("There was a problem with your fetch operation:", error);
      }
    };
    getAllCatalogProducts();
  }, [])

  return (
    <Container className=''>
      <div className='d-flex flex-row align-items-center mb-2'>
        <div className='d-flex align-items-end w-100'>
          <H1 className=''>Description Generator</H1>
        </div>
        <TalkTrackContainer sections={formPage} />
      </div>
      <div className="container" onClick={() => console.log(result)}>
        <div className="row ">
          <div className={`${styles.leftSide} col-12 col-md-6 p-3 mb-3 text-center`}>
            <p className='text-secondary'>Upload an image to generate descriptions in multiple languages.</p>
            <div className={`${styles.cursorPointer} d-flex align-items-end mb-3`}>
              <TextInput
                label="Use product from catalog"
                placeholder="Enter ObjectId"
                onChange={event => {
                  console.log(event)
                  setDisableUpload(productIdRef == null || productIdRef?.current?.value == null || productIdRef?.current?.value == '' || productIdRef?.current?.value.length <= 0)
                }}
                ref={productIdRef}
              />
              <BSButton
                className={`${styles.submitBtn} ms-2`}
                style={{ height: '36px' }}
                onClick={() => onLoadImageFromObjectId()}
                disabled={disableUpload}
              >
                Upload
              </BSButton>
            </div>
            <ImageUpload image={image} setImage={setImage} uploadToS3={uploadToS3} />
            <div className={`d-flex flex-row-reverse mb-3`}>
              <small onClick={() => onLoadSampleImage()} className={`${styles.cursorPointer} ${styles.sampleText} mt-1`}>Use sample image from catalog</small>
            </div>
            <DescriptionInput
              title="Model"
              description="Select the vision model you want to use."
              options={modelOptions}
              onSelectionChange={onModelChange}
            />
            <hr />
            <DescriptionInput
              title="Languages"
              description="Choose up to 3 languages for the product descriptions."
              options={languagesOptions}
              onSelectionChange={onLanguageChange}
              disableUnselectedOptions={selectedLanguages.length >= 3}
              disabledLanguages={languagesDisabled}
            />
            <hr />
            <DescriptionInput
              title="Length"
              description="Select the length of the product descriptions."
              options={lengthOptions}
              onSelectionChange={onLengthChange}
            />
            <div className="d-flex flex-row-reverse mb-3 mt-3">
              <BSButton
                className={`mt-3 ${styles.submitBtn}`}
                disabled={selectedLanguages.length === 0 || image === null || generatingDescription}
                onClick={() => onGenerateClick()}
              >
                {
                  generatingDescription
                    ? <div>
                      <Spinner className='me-2' animation="border" size='sm' variant="secondary" />
                      Generate Descriptions
                    </div>
                    : 'Generate Descriptions'
                }
              </BSButton>
            </div>
          </div>
          <div className={`${styles.rightSide} col-12 col-md-6 mb-3 ps-3 pe-3 text-center`}>
            {
              generatingDescription === true
                ? <div className={`${styles.rightSideContainer} d-flex flex-column justify-content-center align-items-center`}>
                  <Spinner animation="border" variant="secondary" />
                  <p>Loading Descriptions ...</p>
                </div>
                :
                result?.descriptions == null
                  ? <div className={`${styles.rightSideContainer} d-flex justify-content-center align-items-center`}>
                    <h5 className='text-secondary pt-3 pb-3 mt-3 mb-3'>See your generated descriptions here</h5>
                  </div>
                  : <div className=''>
                    <h4>Generated descriptions</h4>
                    {
                      result.imageUrl && <Image
                        src={getDisplayImageUrl(result.imageUrl)}
                        width={100}
                        height={100}
                        style={{ objectFit: "contain", padding: '4px' }}
                        alt='Product'
                      ></Image>
                    }
                    {
                      result?.descriptions.map((description, index) => (
                        <DescriptionOutput
                          key={index}
                          language={description.language}
                          languageLabel={languagesOptions.find(l => l.value === description.language)?.label}
                          description={description.description}
                          imageUrl={result.imageUrl}
                          length={result.length}
                          model={result.model}
                        />
                      ))
                    }
                    <Button
                      leftGlyph={<Icon glyph="AllProducts" />}
                      variant='primaryOutline'
                      onClick={() => {
                        console.log(result);
                        dispatch(setOpenedProductDetails(getProductFromObjectId(result._id)))
                        router.push(`/catalog/${result._id}`)
                      }}
                      disabled={!result._id}
                    >
                      See product inside catalog
                    </Button>
                  </div>
            }
          </div>
        </div>
      </div>
    </Container>
  );
}
