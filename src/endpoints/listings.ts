import type { Endpoint } from "payload"; 

type TopProvinceRow = {
  province_code: string;
  total: number;
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

// Exporting top 5 provinces with the most listings, sorted by total listings in descending order. Each item in the response should include province_code and total listings in that province.
// export const getTopProvinces: Endpoint = {
//   path: "/stats/top-provinces",
//   method: "get",
//   handler: async (req) => {
//     const { payload } = req;

//     try {
//       const provinceCounter = new Map<string, number>();
//       const pageLimit = 100;
//       let currentPage = 1;
//       let hasNextPage = true;

//       while (hasNextPage) {
//         const listings = await payload.find({
//           collection: "listings",
//           where: {
//             and: [
//               { status: { equals: "active" } },
//               { provinceCode: { exists: true } },
//               { provinceCode: { not_equals: "" } },
//             ],
//           },
//           select: {
//             provinceCode: true,
//           },
//           depth: 0,
//           limit: pageLimit,
//           page: currentPage,
//           overrideAccess: false,
//           req,
//         });

//         listings.docs.forEach((listing) => {
//           if (typeof listing.provinceCode !== "string") {
//             return;
//           }

//           const provinceCode = listing.provinceCode.trim();

//           if (!provinceCode) {
//             return;
//           }

//           provinceCounter.set(provinceCode, (provinceCounter.get(provinceCode) ?? 0) + 1);
//         });

//         hasNextPage = listings.hasNextPage;
//         currentPage += 1;
//       }

//       const data: TopProvinceRow[] = Array.from(provinceCounter.entries())
//         .map(([province_code, total]) => ({ province_code, total }))
//         .sort((a, b) => b.total - a.total)
//         .slice(0, 5);

//       return Response.json(data);
//     } catch (error: any) {
//       return Response.json({ error: error.message }, { status: 500 });
//     }
//   },
// };