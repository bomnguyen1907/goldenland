import type { Endpoint } from 'payload'
import divisions from '../app/data/vietnam-divisions.json'

// Lấy danh sách tỉnh
const getProvinces: Endpoint = {
    path: '/divisions/provinces',
    method: 'get',
    handler: (req) => {
        const provinces = divisions.map((p: any) => ({
            code: p.level1_id,
            name: p.name,
        }))
        return Response.json(provinces)
    },
}

// Lấy huyện theo tỉnh
const getDistricts: Endpoint = {
    path: '/divisions/districts/:provinceCode',
    method: 'get',
    handler: (req) => {
        const { provinceCode } = req.routeParams as { provinceCode: string }
        const province = divisions.find((p: any) => p.level1_id === provinceCode)

        if (!province) {
            return Response.json([])
        }

        const districts = (province as any).level2s.map((d: any) => ({
            code: d.level2_id,
            name: d.name,
        }))
        return Response.json(districts)
    },
}

// Lấy xã theo huyện
const getWards: Endpoint = {
    path: '/divisions/wards/:districtCode',
    method: 'get',
    handler: (req) => {
        const { districtCode } = req.routeParams as { districtCode: string }

        for (const province of divisions as any[]) {
            const district = province.level2s.find((d: any) => d.level2_id === districtCode)
            if (district) {
                const wards = district.level3s.map((w: any) => ({
                    code: w.level3_id,
                    name: w.name,
                }))
                return Response.json(wards)
            }
        }

        return Response.json([])
    },
}

export const divisionEndpoints = [getProvinces, getDistricts, getWards]