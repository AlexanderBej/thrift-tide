import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import {
  selectHistoryHasMore,
  selectHistoryStatus,
  selectLatestDonutItems,
  selectSplitBarData,
  selectTrendTotalSpentSeries,
} from '../../store/history-store/history.selectors';
import { loadHistoryPage, resetHistory } from '../../store/history-store/history.slice';
import TrendLineChart from '../../components-ui/charts/trend-line.component';
import StackedBarChart from '../../components-ui/charts/stacked-bar.component';
import DonutChart from '../../components-ui/charts/donut.component';
import Button from '../../components-ui/button/button.component';

const History: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);
  const status = useSelector(selectHistoryStatus);
  const hasMore = useSelector(selectHistoryHasMore);

  const trendSeries = useSelector(selectTrendTotalSpentSeries);
  const splitData = useSelector(selectSplitBarData);
  const donutItems = useSelector(selectLatestDonutItems);

  useEffect(() => {
    if (!user?.uuid) return;
    dispatch(resetHistory());
    dispatch(loadHistoryPage({ uid: user.uuid, pageSize: 12 })); // last 12 periods
  }, [dispatch, user?.uuid]);

  const loadMore = () => user?.uuid && dispatch(loadHistoryPage({ uid: user.uuid, pageSize: 12 }));

  return (
    <div className="history-page grid gap-6">
      <section className="card p-4">
        <h3 className="mb-2">Trend — Total Spent</h3>
        <TrendLineChart series={trendSeries} height={300} />
      </section>

      <section className="card p-4">
        <h3 className="mb-2">Allocated vs Spent (per period)</h3>
        <StackedBarChart
          data={splitData.map(({ category, allocated, spent }) => ({ category, allocated, spent }))}
          height={320}
        />
        {/* If you prefer stacked buckets per month instead:
            <ResponsiveBar keys={['needs','wants','savings']} ... data={splitData} />
        */}
      </section>

      <section className="card p-4">
        <h3 className="mb-2">Latest Period Distribution</h3>
        <DonutChart data={donutItems} height={260} />
      </section>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={status === 'loading'}>
            <span>{status === 'loading' ? 'Loading…' : 'Load more'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;
