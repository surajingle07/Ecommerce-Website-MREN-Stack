import React from 'react'

import ProductImg from './ProductImg'
import ProductDesc from './ProductDesc'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Breadcrums from './BreadCrums';

const SingleProducts = () => {
  const params = useParams();
  const productId = params.id;
  const { products } = useSelector(store => store.product);
  const product = products.find(item => item._id === productId);
  return (
    <div className='pt-35 py-10 max-w-7xl mx-auto px-5'>
      <Breadcrums product={product} />
      <div className='mt-10 grid grid-cols-2 items-start'>
        <ProductImg images={product.productImg} />
        <ProductDesc product={product} />

      </div>

    </div>
  )
}

export default SingleProducts