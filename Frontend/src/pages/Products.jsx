/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

import FilterSidebar from "@/components/FilterSidebar"
import ProductCard from "@/components/ProductCard"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useDispatch, useSelector } from "react-redux"
import { setProducts } from "@/redux/productSlice"
import store from "@/redux/store"


const Products = () => {
    const { products } = useSelector(store => store.product)
    const [allProducts, setAllProducts] = useState([])
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("All")
    const [brand, setBrand] = useState("All")
    const [loading, setLoading] = useState(false)
    const [priceRange, setPriceRange] = useState([0, 999999])
    const [sortOrder, setSortOrder] = useState('')
    const dispatch = useDispatch()

    const getAllProducts = async () => {
        try {
            setLoading(true)
            const res = await axios.get(
                `http://localhost:8000/api/v1/product/getallProducts`
            )

            if (res.data.success) {
                setAllProducts(res.data.products)
                dispatch(setProducts(res.data.products))
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Something went wrong")

        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (allProducts.length === 0) return;

        let filtered = [...allProducts]
        if (search.trim() !== "") {
            filtered = filtered.filter(p => p.productName?.toLowerCase().includes(search.toLowerCase()))
        }
        if (category !== "All") {
            filtered = filtered.filter(p => p.category === category)
        }
        if (brand !== "All") {
            filtered = filtered.filter(p => p.brand === brand)
        }
        filtered = filtered.filter(p => p.productPrice >= priceRange[0] && p.productPrice <= priceRange[1])

        if (sortOrder === "lowtoHigh") {
            filtered.sort((a, b) => a.productPrice - b.productPrice)
        } else if (sortOrder === "hightoLow") {
            filtered.sort((a, b) => b.productPrice - a.productPrice)

        }
        dispatch(setProducts(filtered))
    }, [search, category, brand, sortOrder, priceRange, allProducts, dispatch])
    useEffect(() => {
        getAllProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    console.log(allProducts)
    return (
        <div className="pt-40 pb-10">
            <div className="max-w-7xl mx-auto flex gap-7">
                {/* Sidebar */}
                <FilterSidebar
                    search={search}
                    setSearch={setSearch}
                    brand={brand}
                    setBrand={setBrand}
                    category={category}
                    setCategory={setCategory}
                    allProducts={allProducts}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                />

                {/* Main product section */}
                <div className="flex flex-col flex-1">
                    <div className="flex justify-end mb-4">
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Sort by Price" />
                            </SelectTrigger>

                            <SelectContent position="popper" side="bottom" align="start" className="bg-white">
                                <SelectItem value="lowtoHigh">Low to High</SelectItem>
                                <SelectItem value="hightoLow">High to Low</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>

                    {/* Products */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-9">
                        {
                            products.map((product) => {
                                return <ProductCard key={product._id} product={product} loading={loading} />
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Products