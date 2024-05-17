import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetApplications } from '../../../utils/functions';

function Listings({ filteredListings }) {

    useGetApplications();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {filteredListings && filteredListings.length > 0 && (
                filteredListings.filter(listing => listing.isavailable == true)
                    .map(listing => (
                        <Link to={`/listing/${listing.id}`} key={listing.id} className='cursor-pointer flex flex-col border rounded justify-center whitespace-normal p-3'>
                            <div className='h-[85%]'>
                                <img
                                    loading="lazy"
                                    className="object-contain w-full h-full rounded"
                                    src={listing.image}
                                    alt="Listing Image"
                                />
                            </div>
                            <h1>{listing.modelandname}</h1>
                        </Link>
                    ))
            )}
        </div>
    );
}

export default Listings;
