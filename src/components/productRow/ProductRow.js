import React from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';

import { Cell, Row } from '@leafygreen-ui/table';
import CurlyBracesIcon from '@leafygreen-ui/icon/dist/CurlyBraces';
import TrashIcon from '@leafygreen-ui/icon/dist/Trash';
import IconButton from '@leafygreen-ui/icon-button';
import DescriptionOutput from '../descriptionOutput/DescriptionOutput';

const ProductRow = (props) => {
    let { product, onSeeFullDocument, onDeleteDescriptions } = props

    const selectedModel = useSelector(state => state.Form.models?.find(model => model.isSelectedFilter === true).value)
    const selectedLength = useSelector(state => state.Form.lengths?.find(length => length.isSelectedFilter === true).value)

    return (
        <Row>
            <Cell>{product._id}</Cell>
            <Cell>
                <div className='cursorPointer'>
                    <Image
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