'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useField } from '@payloadcms/ui'

interface Division {
    code: string
    name: string
}

interface Props {
    provinceField: string
    districtField: string
    wardField: string
}

export const AddressPicker: React.FC<Props> = ({
    provinceField = 'provinceCode',
    districtField = 'districtCode',
    wardField = 'wardCode',
}) => {
    const { value: provinceValue, setValue: setProvince } = useField<string>({
        path: provinceField,
    })
    const { value: districtValue, setValue: setDistrict } = useField<string>({
        path: districtField,
    })
    const { value: wardValue, setValue: setWard } = useField<string>({
        path: wardField,
    })

    const [provinces, setProvinces] = useState<Division[]>([])
    const [districts, setDistricts] = useState<Division[]>([])
    const [wards, setWards] = useState<Division[]>([])
    const [loading, setLoading] = useState(false)

    // Load tỉnh
    useEffect(() => {
        fetch('/api/divisions/provinces')
            .then((res) => res.json())
            .then(setProvinces)
    }, [])

    // Load huyện khi chọn tỉnh
    useEffect(() => {
        if (!provinceValue) {
            setDistricts([])
            setWards([])
            return
        }
        setLoading(true)
        fetch(`/api/divisions/districts/${provinceValue}`)
            .then((res) => res.json())
            .then((data) => {
                setDistricts(data)
                setLoading(false)
            })
    }, [provinceValue])

    // Load xã khi chọn huyện
    useEffect(() => {
        if (!districtValue) {
            setWards([])
            return
        }
        setLoading(true)
        fetch(`/api/divisions/wards/${districtValue}`)
            .then((res) => res.json())
            .then((data) => {
                setWards(data)
                setLoading(false)
            })
    }, [districtValue])

    const handleProvinceChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setProvince(e.target.value)
            setDistrict('')
            setWard('')
        },
        [setProvince, setDistrict, setWard],
    )

    const handleDistrictChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setDistrict(e.target.value)
            setWard('')
        },
        [setDistrict, setWard],
    )

    const handleWardChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setWard(e.target.value)
        },
        [setWard],
    )

    const selectStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid var(--theme-elevation-150)',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-text)',
        fontSize: '14px',
    }

    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                    Tỉnh / Thành phố
                </label>
                <select value={provinceValue || ''} onChange={handleProvinceChange} style={selectStyle}>
                    <option value="">-- Chọn tỉnh --</option>
                    {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                    Quận / Huyện
                </label>
                <select
                    value={districtValue || ''}
                    onChange={handleDistrictChange}
                    disabled={!provinceValue}
                    style={selectStyle}
                >
                    <option value="">-- Chọn huyện --</option>
                    {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                    Phường / Xã
                </label>
                <select
                    value={wardValue || ''}
                    onChange={handleWardChange}
                    disabled={!districtValue}
                    style={selectStyle}
                >
                    <option value="">-- Chọn xã --</option>
                    {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                            {w.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}