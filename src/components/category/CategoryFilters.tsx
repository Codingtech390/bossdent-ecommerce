"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Filter, ArrowUpDown } from "lucide-react";

interface BrandOption {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryFiltersProps {
  brands: BrandOption[];
  selectedBrand?: string;
  inStockOnly?: boolean;
  sort?: string;
}

export function CategoryFilters({
  brands,
  selectedBrand = "",
  inStockOnly = false,
  sort = "recommended",
}: CategoryFiltersProps) {
  const pathname = usePathname();

  const updateQuery = (key: string, value: string) => {
    const url = new URL(window.location.href);

    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }

    // Start from the first page after changing a filter.
    url.searchParams.delete("page");

    window.location.href = `${pathname}?${url.searchParams.toString()}`;
  };

  const resetFilters = () => {
    const url = new URL(window.location.href);

    url.searchParams.delete("brand");
    url.searchParams.delete("inStock");
    url.searchParams.delete("minPrice");
    url.searchParams.delete("maxPrice");
    url.searchParams.delete("page");

    window.location.href = `${pathname}?${url.searchParams.toString()}`;
  };

  return (
    <>
      {/* Filters sidebar */}
      <aside className="h-full min-h-[600px] space-y-6 rounded-xl border border-[#e5dce5] bg-[#fbf9f7] p-5 text-xs">
        <div className="flex items-center justify-between border-b border-[#e9e1e7] pb-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-[#252522]">
            <Filter className="h-4 w-4 text-[#9478a5]" />
            Filters
          </span>

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-[#9478a5] transition-colors hover:text-[#786b7b] hover:underline"
          >
            Reset All
          </button>
        </div>

        {/* Availability */}
        <div>
          <h4 className="mb-3 font-semibold text-[#37332f]">Availability</h4>

          <label className="flex cursor-pointer items-center gap-2.5 text-[#77716f]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => updateQuery("inStock", event.target.checked ? "true" : "")}
              className="h-4 w-4 rounded border-[#c9bdc9] accent-[#9478a5] focus:ring-[#9478a5]"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        {/* Brands */}
        <div>
          <h4 className="mb-3 font-semibold text-[#37332f]">Brands</h4>

          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            <label className="flex cursor-pointer items-center gap-2.5 text-[#77716f] transition-colors hover:text-[#9478a5]">
              <input
                type="radio"
                name="brand"
                checked={!selectedBrand}
                onChange={() => updateQuery("brand", "")}
                className="h-3.5 w-3.5 accent-[#9478a5]"
              />
              <span>All Brands</span>
            </label>

            {brands.map((brand) => (
              <label
                key={brand._id}
                className="flex cursor-pointer items-center gap-2.5 text-[#77716f] transition-colors hover:text-[#9478a5]"
              >
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === brand.slug}
                  onChange={() => updateQuery("brand", brand.slug)}
                  className="h-3.5 w-3.5 accent-[#9478a5]"
                />

                <span>{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

interface CategorySortProps {
  sort?: string;
}

export function CategorySort({ sort = "recommended" }: CategorySortProps) {
  const pathname = usePathname();

  const handleSortChange = (value: string) => {
    const url = new URL(window.location.href);

    if (value === "recommended") {
      url.searchParams.delete("sort");
    } else {
      url.searchParams.set("sort", value);
    }

    url.searchParams.delete("page");

    window.location.href = `${pathname}?${url.searchParams.toString()}`;
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-3.5 w-3.5 text-[#9478a5]" />

      <span className="font-medium text-[#92888e]">Sort by:</span>

      <select
        value={sort}
        onChange={(event) => handleSortChange(event.target.value)}
        className="rounded-md border border-[#ded4de] bg-[#f4f1ed] px-2.5 py-1.5 font-semibold text-[#514751] outline-none transition focus:border-[#9478a5] focus:ring-1 focus:ring-[#9478a5]"
      >
        <option value="recommended">Recommended</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
        <option value="newest">Newest Arrivals</option>
      </select>
    </div>
  );
}
