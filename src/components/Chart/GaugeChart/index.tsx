// components/GaugeChart.tsx
import { GaugeChartProps } from '@/lib/types';
import React from 'react';

interface GaugeI {
    data: GaugeChartProps
}
const GaugeChart: React.FC<GaugeI> = ({ data }) => {
    const {
        value = 0, 
        min = 0, 
        max = 100
    } = data
    const angle = ((value - min) / (max - min)) * 180;
    const needleStyle = {
        transform: `rotate(${angle - 90}deg)`,
        transformOrigin: 'bottom center',
    };

    return (
        <div className="relative w-64 h-32 mt-10">
            <div className="relative w-64 h-32 overflow-hidden mx-auto">
                <div className="w-64 h-64 aspect-square border-[35px] border-blue-500 rounded-full absolute top-0 left-0 transform"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                {/* <div className="text-white font-bold text-xl">50%</div> */}
                </div>
            </div>
        
        <div
            className="absolute left-1/2 bottom-0 w-1 h-16 bg-gray-700"
            style={needleStyle}
        ></div>
        <div className="absolute top-0 -translate-x-1/2 left-1/2 flex justify-center items-center">
            <div className="text-center">
            <div  className='text-sm mt-2 text-white'>50%</div>
            </div>
        </div>
        <div className="absolute left-0 bottom-0 flex flex-nowrap justify-between w-full px-2">
            <span className='text-sm text-white'>0</span>
            <span className="text-xl absolute mt-6 left-1/2 -translate-x-1/2">{value}%</span>
            <span className='text-sm  absolute right-0 text-white'>100%</span>
        </div>
        </div>
    );
};

export default GaugeChart;
