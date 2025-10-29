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
import DoubleDonutChart from '../../components-ui/charts/double-donut.component';
import Button from '../../components-ui/button/button.component';

import './history.styles.scss';

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
    <div className="history-page">
      <section className="history-page-section">
        <h2 className="card-header">Trend — Total Spent</h2>
        <TrendLineChart series={trendSeries} height={300} />
      </section>

      <section className="history-page-section">
        <h2 className="card-header">Allocated vs Spent (per period)</h2>
        <StackedBarChart
          data={splitData.map(({ category, allocated, spent }) => ({ category, allocated, spent }))}
          height={320}
        />
      </section>

      <section className="history-page-section">
        <h2 className="card-header">Latest Period Distribution</h2>
        <DoubleDonutChart data={donutItems} height={260} />
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
