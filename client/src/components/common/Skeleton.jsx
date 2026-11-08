import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * Base Skeleton block with smooth pulse animation and theme-aware colors
 */
export const Skeleton = ({
  className = '',
  style = {},
  variant = 'rect', // 'rect' | 'circle' | 'text'
  width,
  height,
  ...props
}) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const baseStyles = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
    width,
    height,
    ...style
  };

  const roundedClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md'
      : 'rounded-lg';

  return (
    <div
      className={`animate-pulse ${roundedClass} ${className}`}
      style={baseStyles}
      {...props}
    />
  );
};

/**
 * Skeleton for Dashboard 5-KPI Statistic Cards
 */
export const CardSkeleton = () => {
  const { colors, mode } = useTheme();
  return (
    <div
      className="p-3.5 rounded-xl border shadow-xs flex flex-col justify-between h-[104px] animate-pulse"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border
      }}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton variant="circle" className="w-7 h-7" />
      </div>
      <div>
        <Skeleton className="h-6 w-20 mb-1" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Student Cards in Grid View
 */
export const StudentCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <div
      className="p-3.5 rounded-xl border shadow-xs animate-pulse flex flex-col justify-between"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border
      }}
    >
      <div className="flex items-start gap-3">
        <Skeleton variant="circle" className="w-12 h-12 shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-24" />
          <div className="flex items-center gap-1.5 pt-1">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-3.5 pt-2.5 border-t flex items-center justify-between" style={{ borderColor: colors.border }}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
    </div>
  );
};

/**
 * Generic Table Skeleton with customizable row and column count
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  const { colors } = useTheme();
  return (
    <div
      className="rounded-xl border overflow-hidden w-full shadow-xs"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border
      }}
    >
      {/* Header Row */}
      <div
        className="px-4 py-3 border-b flex items-center gap-4"
        style={{
          backgroundColor: colors.bgSecondary,
          borderColor: colors.border
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-3 ${i === 0 ? 'w-32' : 'flex-1'} max-w-[140px]`}
          />
        ))}
      </div>

      {/* Body Rows */}
      <div className="divide-y" style={{ borderColor: colors.border }}>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-4 py-3 flex items-center gap-4 animate-pulse">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={`h-3 ${cIdx === 0 ? 'w-28' : 'flex-1'} max-w-[130px]`}
                style={{ opacity: 0.9 - (cIdx * 0.1) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full Dashboard Skeleton that perfectly mirrors DashboardView layout
 */
export const DashboardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <div className="space-y-4">
      {/* KPI Cards Row (5 columns on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Action / Quick Analytics Banner */}
      <div
        className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div className="space-y-1.5 w-full sm:w-1/2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Dual Analytics Row: Chart Area (2/3) + Side Summary (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div
          className="lg:col-span-2 p-4 rounded-xl border h-72 flex flex-col justify-between"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <div className="flex-1 flex items-end gap-3 pt-6 pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <Skeleton
                  className="w-full rounded-t-sm"
                  style={{ height: `${30 + ((i * 17) % 60)}%` }}
                />
                <Skeleton className="h-2 w-8" />
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-4 rounded-xl border h-72 flex flex-col justify-between space-y-3"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <Skeleton className="h-3.5 w-32" />
          <div className="space-y-2.5 flex-1 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>

      {/* Recent Activity Table Skeleton */}
      <TableSkeleton rows={4} cols={5} />
    </div>
  );
};

/**
 * Skeleton for Student Profile Modal Dossier
 */
export const ProfileModalSkeleton = ({ onClose }) => {
  const { colors } = useTheme();
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden animate-pulse my-auto"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        {/* Banner + Avatar Header */}
        <div className="h-28 bg-slate-300 dark:bg-slate-800 relative">
          <div className="absolute -bottom-8 left-6 flex items-end gap-4">
            <Skeleton variant="circle" className="w-20 h-20 border-4 border-white dark:border-slate-900" />
            <div className="mb-2 space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>

        {/* Tab Header */}
        <div className="pt-12 px-6 pb-4 border-b flex items-center gap-2" style={{ borderColor: colors.border }}>
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>

        {/* Modal Body: Two column grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Route-Level Suspense Fallback
 */
export const ViewSkeleton = ({ title = 'Loading...' }) => {
  const { colors } = useTheme();
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header bar placeholder */}
      <div className="flex items-center justify-between pb-1">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Main content placeholder */}
      <div
        className="p-5 rounded-xl border space-y-4 shadow-xs"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-60 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <TableSkeleton rows={6} cols={5} />
      </div>
    </div>
  );
};

export default Skeleton;
