import React, { useEffect, useMemo } from "react";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";
import DonutChart from "../../components/DonutChart";
import RecentActivityTable from "../../components/tables/admin/RecentActivityTable";
import {
  MusicIcon1,
  ClothesIcon,
  DollarIcon,
  DownloadIcon,
} from "../../customIcons";
import { useDispatch, useSelector } from "react-redux";
import { me } from "../../store/actions/authActions";
import { dashboard } from "../../store/actions/adminActions";
import { Loader } from "@mantine/core";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { dashboardData, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(me());
    dispatch(dashboard());
  }, [dispatch]);

  const stats = useMemo(() => {
    if (!dashboardData?.stats) return [];
    const { stats: s } = dashboardData;
    return [
      {
        title: t('dashboard.stats.tracks'),
        value: s.totalBeats?.toLocaleString() || "0",
        subtitle: t('dashboard.stats.this_week', { count: s.beatsThisWeek || 0 }),
        icon: MusicIcon1,
        label: t('dashboard.stats.total_beats'),
      },
      {
        title: t('dashboard.stats.products'),
        value: s.totalMerch?.toLocaleString() || "0",
        subtitle: t('dashboard.stats.new_items', { count: s.merchThisWeek || 0 }),
        icon: ClothesIcon,
        label: t('dashboard.stats.merch_items'),
      },
      {
        title: t('dashboard.stats.this_month'),
        value: `€ ${s.totalDonations?.toLocaleString() || "0,00"}`,
        subtitle: t('dashboard.stats.this_week', { count: s.donationsThisWeek?.toFixed(0) || "0" }),
        icon: DollarIcon,
        label: t('dashboard.stats.donations'),
      },
      {
        title: t('dashboard.stats.total'),
        value: s.totalDownloads?.toLocaleString() || "0",
        subtitle: t('dashboard.stats.this_week', { count: s.downloadsThisWeek || 0 }),
        icon: DownloadIcon,
        label: t('dashboard.stats.downloads'),
      },
    ];
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#040404]">
        <Loader type="dots" color="#B5B387" />
      </div>
    );
  }

  const CornerAccents = () => (
    <>
      <div className="absolute top-0 left-0 w-2 h-2 bg-[#F6F4D3] z-20"></div>
      <div className="absolute top-0 right-0 w-2 h-2 bg-[#F6F4D3] z-20"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#F6F4D3] z-20"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#F6F4D3] z-20"></div>
    </>
  );

  return (
    <div className="bg-[#1A1A23] min-h-screen">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            label={stat.label}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-8 bg-[#2F2E24] border border-[#B5B387]/30 p-6 relative overflow-hidden">
          <CornerAccents />
          <h2 className="pixel-font text-[#F6F4D3] text-[12px] uppercase tracking-widest mb-10">
            {t('dashboard.charts.donations_title')}
          </h2>
          <div className="relative">
            <BarChart
              monthlyDonations={dashboardData?.charts?.monthlyDonations}
            />
          </div>
        </div>

        {/* Donut Chart Section */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#2F2E24] border border-[#B5B387]/30 p-6 relative h-full min-h-[400px]">
            <CornerAccents />
            <h2 className="pixel-font text-[#F6F4D3] text-[12px] uppercase tracking-widest mb-10 leading-relaxed">
              {t('dashboard.charts.most_played')}
              <br />
              {t('dashboard.charts.genres_categories')}
            </h2>
            <DonutChart
              genreDistribution={[
                ...(dashboardData?.charts?.genreDistribution || []),
                ...(dashboardData?.charts?.categoryDistribution || []).map((cat) => ({
                  genre: cat.category,
                  count: cat.count,
                  percentage: cat.percentage
                }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-[#2F2E24] border border-[#B5B387]/30  relative">
        <CornerAccents />
        <h2 className="pixel-font text-[#F6F4D3] text-[12px] uppercase tracking-widest p-6">
          {t('dashboard.activity.title')}
        </h2>
        <RecentActivityTable activity={dashboardData?.activity} />
      </div>
    </div>
  );
};

export default Dashboard;
