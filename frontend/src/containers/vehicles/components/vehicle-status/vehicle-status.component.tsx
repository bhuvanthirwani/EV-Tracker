import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import './vehicle-status.component.css';


interface FILTER_MAP_TYPE {
    text: string;
        background: string;
        border: string;
        filterName: string;
        hint?: string;
}

const FILTER_MAP: Array<FILTER_MAP_TYPE> = [
    {
        text: 'Active',
        background: 'var(--active)',
        border: '1px solid var(--active)',
        filterName: 'ACTIVE',
        hint: ''
    },
    {
        text: 'Running',
        background: 'var(--active)',
        border: '1px solid var(--active)',
        filterName: 'RUNNING'
    },
    {
        text: 'Charging',
        background: '#F6A623',
        border: '1px solid #F6A623',
        filterName: 'CHARGING'
    },
    {
        text: 'Low Battery',
        background: 'var(--accent-color)',
        border: '1px solid var(--accent-color)',
        filterName: 'LOW_BATTERY'
    },
    {
        text: 'NR',
        background: 'var(--border-color)',
        border: '1px solid var(--border-color)',
        filterName: 'NR',
        hint: 'Not reachable vehicles'
    },
    {
        text: '📍' + 'Issue',
        background: 'var(--border-color)',
        border: '1px solid var(--border-color)',
        filterName: 'Loc',
        hint: 'Vehicles having wrong locations. Not visible in map.'
    }
];

const VehicleStatusFilter = (props: any) => {
    const { selectedFilter, updateSelectedFilter, filterStatusData } = props;

    return (
        <div className='flex-between status-filter'>
            {
                FILTER_MAP.map((filter: FILTER_MAP_TYPE) => (
                    !(filter?.filterName === 'Loc' && !filterStatusData?.[filter.filterName]) ? <Tooltip key={filter.filterName} title={filter?.hint}>
                        <div
                            className='flex flex-column-vert-center flex-center cursor-pointer filter-item'
                            style={selectedFilter?.includes(filter.filterName) ? { background: filter.background, border: filter.border } : { border: filter.border }}
                            onClick={() => updateSelectedFilter(filter.filterName)}
                        >
                            <span className='xs-font text-overflow-ellipsis'>{filter.text}</span><span className='status-data'>{filterStatusData?.[filter.filterName]}</span>
                        </div>
                    </Tooltip> : ''
                ))
            }
        </div>
    )
};

export default VehicleStatusFilter;
