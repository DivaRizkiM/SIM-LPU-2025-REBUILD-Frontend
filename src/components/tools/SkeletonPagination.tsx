import React from 'react';

const SkeletonLoading: React.FC = () => {
    return (
            <div className="animate-pulse">
                <div className="flex items-center space-x-2">
                    <div className="h-6 bg-slate-500 rounded w-12"/>
                    <div className="h-6 bg-slate-400 rounded w-8"/>
                    <div className="h-6 bg-slate-400 rounded w-8"/>
                    <div className="h-6 bg-slate-400 rounded w-8"/>
                    <div>...</div>
                    <div className="h-6 bg-slate-400 rounded w-8"/>
                    <div className="h-6 bg-slate-500 rounded w-12"/>
                </div>
            </div>
    );
};

export default SkeletonLoading;
