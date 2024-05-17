import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../../utils/context'
import { useGetApplications } from '../../../utils/functions';

function MyDocuments() {
    const { listings, applications } = useContext(AppContext);

    useGetApplications();

    return (
        <div className="p-10">
            {applications.length > 0 && (
                <div className='flex flex-row justify-center gap-20'>
                    {applications.filter(a => a.status == "completed").map((application) => (
                        <Link
                            to={`/application/${application.id}`}
                            state={{ application, listing: listings.find(l => l.id == application.listing), applicationType: application.applicationType }}
                            key={application.id}
                            className={`cursor-pointer flex flex-col rounded justify-center whitespace-normal p-3 border rounded-lg w-[30rem] ${application.status == "completed" && 'border-green-500'} ${application.status == "rejected" && 'border-red-500'} border-black shadow-md`}
                        >
                            <img
                                loading="lazy"
                                className="object-contain w-full h-full rounded"
                                src={listings.find(l => l.id == application.listing).image}
                                alt="Listing Image"
                            />
                            <h1>{listings.find(l => l.id == application.listing).modelandname}</h1>
                        </Link>
                    ))}

                </div>
            )}
        </div >
    )
}

export default MyDocuments