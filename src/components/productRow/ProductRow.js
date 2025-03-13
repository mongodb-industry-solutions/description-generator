import React from 'react';
import { useSelector } from 'react-redux'
import { useRouter } from "next/navigation";;
import Image from 'next/image';

import { Cell, Row } from '@leafygreen-ui/table';
import CurlyBracesIcon from '@leafygreen-ui/icon/dist/CurlyBraces';
import TrashIcon from '@leafygreen-ui/icon/dist/Trash';
import IconButton from '@leafygreen-ui/icon-button';
import CopyIcon from '@leafygreen-ui/icon/dist/Copy';
import SparkleIcon from '@leafygreen-ui/icon/dist/Sparkle';
import DescriptionOutput from '../descriptionOutput/DescriptionOutput';
import { setProductImageInFormFromObjectId } from '@/lib/helpers';

const ProductRow = (props) => {
    const router = useRouter();
    let { product, onSeeFullDocument, onDeleteDescriptions } = props

    const selectedModel = useSelector(state => state.Form.models?.find(model => model.isSelectedFilter === true).value)
    const selectedLength = useSelector(state => state.Form.lengths?.find(length => length.isSelectedFilter === true).value)

    const onCopyIdClick = () => {
        const textArea = document.createElement("textarea");
        textArea.value = product._id;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy"); // Works without HTTPS!
        document.body.removeChild(textArea);
        console.log("Copied:", product._id);
    }
    const onGenerateDescription = () => {
        router.push(`/`);
        const imageId = setProductImageInFormFromObjectId(product._id)
        console.log(imageId)
    }

    return (
        <Row>
            <Cell>
                {product._id}
                <IconButton
                    aria-label="Some Menu"
                    title='Copy'
                    className='ms-2'
                    onClick={() => onCopyIdClick()}
                >
                    <CopyIcon />
                </IconButton>
            </Cell>
            <Cell>
                <div className='cursorPointer'>
                    <Image
                        onClick={() => onSeeFullDocument(product)}
                        src={product?.imageUrl}
                        width={100}
                        height={100}
                        style={{ objectFit: "contain", padding: '4px' }}
                        alt='Product'
                    ></Image>
                </div>
            </Cell>
            <Cell>
                {
                    !product.descriptions?.en?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`]
                        ? 'N/A'
                        : <DescriptionOutput
                            language='en'
                            languageLabel={null}
                            description={product.descriptions?.en?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`] || 'n/a'}
                            imageUrl={product.imageUrl}
                            length={selectedLength}
                            model={selectedModel}
                            isInCatalogRow={true}
                        ></DescriptionOutput>
                }
            </Cell>
            <Cell>
                {
                    !product.descriptions?.es?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`]
                        ? 'N/A'
                        : <DescriptionOutput
                            language='es'
                            languageLabel={null}
                            description={product.descriptions?.es?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`] || 'N/A'}
                            imageUrl={product.imageUrl}
                            length={selectedLength}
                            model={selectedModel}
                            isInCatalogRow={true}
                        ></DescriptionOutput>
                }
            </Cell>
            <Cell>
                {
                    !product.descriptions?.fr?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`]
                        ? 'N/A'
                        : <DescriptionOutput
                            language='fr'
                            languageLabel={null}
                            description={product.descriptions?.fr?.[`${selectedLength}_${selectedModel.replaceAll('.', '')}`] || 'N/A'}
                            imageUrl={product.imageUrl}
                            length={selectedLength}
                            model={selectedModel}
                            isInCatalogRow={true}
                        ></DescriptionOutput>
                }
            </Cell>
            <Cell>
                <IconButton
                    onClick={() => onGenerateDescription(product)}
                    aria-label="Some Menu"
                    title='Generate description'
                >
                    <SparkleIcon />
                </IconButton>
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
    )
}

export default ProductRow