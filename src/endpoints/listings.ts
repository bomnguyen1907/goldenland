import type { Endpoint } from "payload"; 

export const getListings: Endpoint = { 
    path: "/listings",
    method: "get",
    handler: async (req) => {
        const { payload } = req;

        try {
            const listings = await payload.find({
                collection: "listings",
                limit: 100,
                overrideAccess: false,
                req,
            });

            return Response.json({ listings: listings.docs });
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    },
};

export const getListingsDetail: Endpoint = {    
    path: "/listings/:slug",
    method: "get",
    handler: async (req) => {
        const { payload, routeParams } = req;
        const slug = routeParams?.slug as string | undefined;

        if (!slug) {
            return Response.json({ error: "Thiếu slug bất động sản" }, { status: 400 });
        }

        try {
            const result = await payload.find({
                collection: "listings",
                where: {
                    slug: {
                        equals: slug,
                    },
                },
                limit: 1,
                overrideAccess: false,
                req,
            });

            const listing = result.docs[0];

            if (!listing) {
                return Response.json({ error: "Danh sách không tồn tại" }, { status: 404 });
            }

            return Response.json({ listing });
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    },
};

// Exporting list of listings of new listings base on createdAt field, sorted by createdAt in descending order, limit to 8 listings. 
// Client can sent limit = 8 to get next 8 listings, and so on. If limit is not sent, default to 8 listings. 
export const getNewListings: Endpoint = {
    // Use a non-collection path to avoid collision with Payload's built-in /listings/:id route.
    path: "/listings-new",
  method: "get",
  handler: async (req) => {
    const { payload, query } = req;

    const limit = query?.limit ? parseInt(query.limit as string) : 8;
    const page = query?.page ? parseInt(query.page as string) : 1;

    try {
      const listings = await payload.find({
        collection: "listings",
        sort: "-createdAt",
        limit,
        page,
        overrideAccess: false,
        req,
      });

      return Response.json({
        data: listings.docs,
        page: listings.page,
        totalPages: listings.totalPages,
        totalDocs: listings.totalDocs,
        hasMore: listings.hasNextPage,
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
};